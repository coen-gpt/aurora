Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  try {
    let target = new URL(req.url).searchParams.get('url');
    if (!target && req.method === 'POST') {
      target = (await req.json().catch(() => ({}))).url || null;
    }
    if (!target || !/^https?:\/\//i.test(target)) {
      return new Response('Missing or invalid url parameter', { status: 400, headers: cors });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
      'Icy-MetaData': '1',
    };
    const range = req.headers.get('range');
    if (range) headers['Range'] = range;

    const upstream = await fetch(target, { headers, redirect: 'follow' });
    if (!upstream.ok && upstream.status !== 206) {
      return new Response(`Upstream returned ${upstream.status}`, { status: 502, headers: cors });
    }

    const ct = upstream.headers.get('content-type') || '';
    const finalUrl = upstream.url || target;
    const isPlaylist = /mpegurl|m3u8/i.test(ct) || /\.m3u8?(\?|$)/i.test(finalUrl.split('?')[0] + '?');

    // Rewrite playlist URIs so every segment/sub-playlist also flows through this relay
    if (isPlaylist) {
      const prox = (uri) => {
        try {
          return `/functions/streamProxy?url=${encodeURIComponent(new URL(uri, finalUrl).href)}`;
        } catch {
          return uri;
        }
      };
      const text = await upstream.text();
      if (!text.includes('#EXTM3U')) {
        return new Response(text, { headers: { ...cors, 'Content-Type': ct || 'text/plain' } });
      }
      const rewritten = text
        .split('\n')
        .map((line) => {
          const t = line.trim();
          if (!t) return line;
          if (t.startsWith('#')) {
            return line.replace(/URI="([^"]+)"/g, (_m, uri) => `URI="${prox(uri)}"`);
          }
          return prox(t);
        })
        .join('\n');
      return new Response(rewritten, {
        headers: { ...cors, 'Content-Type': 'application/vnd.apple.mpegurl', 'Cache-Control': 'no-store' },
      });
    }

    // Stream media bytes straight through
    const outHeaders = { ...cors, 'Content-Type': ct || 'video/mp2t', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' };
    const len = upstream.headers.get('content-length');
    if (len) outHeaders['Content-Length'] = len;
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) outHeaders['Content-Range'] = contentRange;
    return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
  } catch (error) {
    return new Response(error.message, { status: 500, headers: cors });
  }
});