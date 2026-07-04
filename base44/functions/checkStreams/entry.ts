import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0 || urls.length > 25) {
      return Response.json({ error: 'Provide 1-25 urls' }, { status: 400 });
    }

    const results = await Promise.all(urls.map(async (url) => {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(url, {
          headers: { Range: 'bytes=0-1024', 'User-Agent': 'Mozilla/5.0 (SmartTV)' },
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        try { await res.body?.cancel(); } catch (_e) { /* ignore */ }
        return { url, ok: res.ok, status: res.status };
      } catch (_e) {
        return { url, ok: false, status: 0 };
      }
    }));

    return Response.json({ results });
  } catch (error) {
    console.error('checkStreams error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});