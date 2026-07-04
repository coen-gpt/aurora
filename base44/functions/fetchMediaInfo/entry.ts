import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { title } = await req.json();
    if (!title) return Response.json({ error: 'A title is required' }, { status: 400 });

    // Clean IPTV-style noise from titles: "US| HBO HD", "Movie (4K)", etc.
    const clean = title
      .replace(/\b(HD|SD|FHD|UHD|4K|8K|HEVC|H265|VIP|RAW|BACKUP|24\/7)\b/gi, '')
      .replace(/^[A-Z]{2,3}\s*[|:-]\s*/i, '')
      .replace(/[[\](){}|].*$/, '')
      .replace(/\s+/g, ' ')
      .trim() || title.trim();

    // Open sources: TVMaze (TV shows, free), iTunes Search (movies/posters/preview clips, free)
    let tv = null;
    try {
      const r = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(clean)}&embed=cast`);
      if (r.ok) tv = await r.json();
    } catch { /* source unavailable */ }

    let movie = null;
    try {
      const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(clean)}&media=movie&limit=1`);
      if (r.ok) movie = (await r.json()).results?.[0] || null;
    } catch { /* source unavailable */ }

    // Web-grounded lookup for IMDb / Rotten Tomatoes / facts
    let extra = {};
    try {
      extra = await base44.integrations.Core.InvokeLLM({
        prompt: `Find accurate details about the movie or TV show "${clean}". Provide the IMDb rating (format "8.5/10"), Rotten Tomatoes critic score (format "92%"), release year, a one-paragraph synopsis, 4 interesting behind-the-scenes facts, and the top 6 billed cast members. If it is a live TV channel rather than a movie/show, describe the channel instead and leave ratings null.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            imdb_rating: { type: ['string', 'null'] },
            rotten_tomatoes: { type: ['string', 'null'] },
            year: { type: ['string', 'null'] },
            synopsis: { type: 'string' },
            facts: { type: 'array', items: { type: 'string' } },
            cast: { type: 'array', items: { type: 'string' } },
          },
        },
      });
    } catch { /* ratings lookup unavailable */ }

    const poster =
      tv?.image?.original ||
      (movie?.artworkUrl100 ? movie.artworkUrl100.replace('100x100', '600x600') : null);

    const cast =
      tv?._embedded?.cast?.slice(0, 10).map((c) => ({
        name: c.person?.name || '',
        character: c.character?.name || '',
        image: c.person?.image?.medium || null,
      })) ||
      (extra.cast || []).map((n) => ({ name: n, character: '', image: null }));

    return Response.json({
      title: tv?.name || movie?.trackName || clean,
      poster,
      overview:
        (tv?.summary || '').replace(/<[^>]+>/g, '').trim() ||
        movie?.longDescription ||
        extra.synopsis ||
        '',
      genres: tv?.genres?.length ? tv.genres : movie?.primaryGenreName ? [movie.primaryGenreName] : [],
      imdb: extra.imdb_rating || (tv?.rating?.average ? `${tv.rating.average}/10` : null),
      rotten_tomatoes: extra.rotten_tomatoes || null,
      year: extra.year || (tv?.premiered || movie?.releaseDate || '').slice(0, 4) || null,
      facts: extra.facts || [],
      cast,
      preview_url: movie?.previewUrl || null,
      trailer_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + ' official trailer')}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});