Deno.serve(async (req) => {
  try {
    const { server, username, password } = await req.json();
    if (!server || !username || !password) {
      return Response.json({ error: 'Server URL, username and password are required' }, { status: 400 });
    }
    let base = server.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(base)) base = 'http://' + base;

    const api = `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const authRes = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Aurora/1.0)' } });
    if (!authRes.ok) {
      return Response.json({ error: `Could not reach the Xtream server (status ${authRes.status})` }, { status: 400 });
    }
    const auth = await authRes.json().catch(() => null);
    if (!auth?.user_info || Number(auth.user_info.auth) !== 1) {
      return Response.json({ error: 'Invalid Xtream credentials — check your server, username and password' }, { status: 401 });
    }

    const [catsRes, streamsRes] = await Promise.all([
      fetch(`${api}&action=get_live_categories`),
      fetch(`${api}&action=get_live_streams`),
    ]);
    const cats = await catsRes.json().catch(() => []);
    const streams = await streamsRes.json().catch(() => []);
    if (!Array.isArray(streams)) {
      return Response.json({ error: 'The server did not return a channel list' }, { status: 400 });
    }

    const catMap = {};
    if (Array.isArray(cats)) for (const c of cats) catMap[c.category_id] = c.category_name;

    const channels = streams.slice(0, 8000).map((s) => ({
      name: s.name || 'Unknown Channel',
      logo: s.stream_icon || '',
      group: catMap[s.category_id] || 'Uncategorized',
      tvg_id: s.epg_channel_id || '',
      url: `${base}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${s.stream_id}.m3u8`,
    }));

    const epg_url = `${base}/xmltv.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    return Response.json({
      channels,
      count: channels.length,
      epg_url,
      account: {
        status: auth.user_info.status,
        exp_date: auth.user_info.exp_date,
        max_connections: auth.user_info.max_connections,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});