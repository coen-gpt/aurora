Deno.serve(async (req) => {
  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\//i.test(url)) {
      return Response.json({ error: 'Please provide a valid http(s) playlist URL' }, { status: 400 });
    }
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StreamHub/1.0)' } });
    if (!res.ok) {
      return Response.json({ error: `Could not load playlist (status ${res.status})` }, { status: 400 });
    }
    const text = await res.text();
    if (!text.includes('#EXTM3U') && !text.includes('#EXTINF')) {
      return Response.json({ error: 'That URL does not look like an M3U playlist' }, { status: 400 });
    }

    const lines = text.split(/\r?\n/);
    const channels = [];
    let cur = null;
    for (const raw of lines) {
      const line = raw.trim();
      if (line.startsWith('#EXTINF')) {
        const name = line.split(',').pop()?.trim() || 'Unknown Channel';
        const logo = (line.match(/tvg-logo="([^"]*)"/) || [])[1] || '';
        const group = (line.match(/group-title="([^"]*)"/) || [])[1] || 'Uncategorized';
        cur = { name, logo, group };
      } else if (line && !line.startsWith('#') && cur) {
        channels.push({ ...cur, url: line });
        cur = null;
        if (channels.length >= 8000) break;
      }
    }

    return Response.json({ channels, count: channels.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});