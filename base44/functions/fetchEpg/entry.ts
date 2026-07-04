Deno.serve(async (req) => {
  try {
    const { url, channel_ids = [] } = await req.json();
    if (!url || !/^https?:\/\//i.test(url)) {
      return Response.json({ error: 'Please provide a valid EPG (XMLTV) URL' }, { status: 400 });
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Aurora/1.0)' } });
    if (!res.ok || !res.body) {
      return Response.json({ error: `Could not load the EPG (status ${res.status})` }, { status: 400 });
    }

    const decode = (s) =>
      s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'").trim();

    const parseTime = (s) => {
      if (!s) return null;
      const m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:\s*([+-]\d{4}))?/);
      if (!m) return null;
      const tz = m[7] ? `${m[7].slice(0, 3)}:${m[7].slice(3)}` : 'Z';
      const t = Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] || '00'}${tz}`);
      return isNaN(t) ? null : t;
    };

    const wanted = new Set(channel_ids.slice(0, 3000).map((s) => String(s).toLowerCase()));
    const now = Date.now();
    const from = now - 3 * 3600e3;
    const to = now + 24 * 3600e3;
    const guide = {};
    let count = 0;
    const MAX_PROGRAMS = 25000;
    const MAX_CHANNELS_UNFILTERED = 500;

    const processBlock = (block) => {
      const attrsEnd = block.indexOf('>');
      if (attrsEnd === -1) return;
      const attrs = block.slice(0, attrsEnd);
      const chId = (attrs.match(/channel="([^"]*)"/) || [])[1];
      if (!chId) return;
      const key = chId.toLowerCase();
      if (wanted.size > 0) {
        if (!wanted.has(key)) return;
      } else if (!guide[key] && Object.keys(guide).length >= MAX_CHANNELS_UNFILTERED) {
        return;
      }
      const start = parseTime((attrs.match(/start="([^"]*)"/) || [])[1]);
      const stop = parseTime((attrs.match(/stop="([^"]*)"/) || [])[1]);
      if (!start || !stop || stop < from || start > to) return;
      const body = block.slice(attrsEnd + 1);
      const title = decode((body.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || 'Untitled');
      const desc = decode((body.match(/<desc[^>]*>([\s\S]*?)<\/desc>/) || [])[1] || '').slice(0, 240);
      if (!guide[key]) guide[key] = [];
      guide[key].push({ start, stop, title, desc });
      count++;
    };

    // Stream + optionally gunzip so huge guides never sit fully in memory
    const rawReader = res.body.getReader();
    const first = await rawReader.read();
    let byteStream = new ReadableStream({
      start(controller) {
        if (!first.done && first.value) controller.enqueue(first.value);
        if (first.done) controller.close();
      },
      async pull(controller) {
        const { done, value } = await rawReader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      },
      cancel() { rawReader.cancel().catch(() => {}); },
    });
    const isGzip = !first.done && first.value && first.value[0] === 0x1f && first.value[1] === 0x8b;
    if (isGzip) byteStream = byteStream.pipeThrough(new DecompressionStream('gzip'));

    const textDecoder = new TextDecoder();
    const reader = byteStream.getReader();
    let buffer = '';
    let sawProgramme = false;

    while (count < MAX_PROGRAMS) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += textDecoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('</programme>')) !== -1) {
        sawProgramme = true;
        const chunk = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 12);
        const startTag = chunk.lastIndexOf('<programme');
        if (startTag !== -1) processBlock(chunk.slice(startTag + 10));
        if (count >= MAX_PROGRAMS) break;
      }
      if (buffer.length > 2_000_000) buffer = buffer.slice(-500_000);
    }
    reader.cancel().catch(() => {});

    if (!sawProgramme) {
      return Response.json({ error: 'That URL does not look like an XMLTV guide' }, { status: 400 });
    }

    for (const key of Object.keys(guide)) {
      guide[key].sort((a, b) => a.start - b.start);
    }

    return Response.json({ guide, program_count: count, channel_count: Object.keys(guide).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});