// Unified cross-source search: live channels, EPG programs, My List, Continue Watching.
// Returns merged, de-duplicated results ranked by relevance + recency.

const matchScore = (text, q) => {
  const t = (text || '').toLowerCase();
  if (!t || !q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(' ' + q)) return 60;
  if (t.includes(q)) return 40;
  return 0;
};

export function unifiedSearch(query, { channels = [], guide = {}, myList = [], recents = [], favorites = [] }) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const now = Date.now();
  const byUrl = new Map();

  const add = (channel, score, source, program) => {
    if (!channel?.url || score <= 0) return;
    const existing = byUrl.get(channel.url);
    if (existing) {
      existing.score = Math.max(existing.score, score) + 10; // multi-source boost
      if (!existing.sources.includes(source)) existing.sources.push(source);
      if (program && !existing.program) existing.program = program;
    } else {
      byUrl.set(channel.url, { channel, score, sources: [source], program: program || null });
    }
  };

  // Live channels by name
  channels.forEach((c) => add(c, matchScore(c.name, q), 'Live'));

  // EPG program titles (current + upcoming), mapped back to their channel
  const channelByTvg = {};
  channels.forEach((c) => {
    const id = (c.tvg_id || '').toLowerCase();
    if (id && !channelByTvg[id]) channelByTvg[id] = c;
  });
  Object.entries(guide).forEach(([id, progs]) => {
    const ch = channelByTvg[id];
    if (!ch) return;
    for (const p of progs) {
      if (p.stop < now) continue;
      const s = matchScore(p.title, q);
      if (s > 0) {
        add(ch, s - 5, 'Guide', p);
        break;
      }
    }
  });

  // My List (saved shows)
  myList.forEach((i) => add(i, matchScore(i.name, q) + 10, 'My List'));

  // Continue Watching — recency boost
  recents.forEach((r) => {
    const s = matchScore(r.name, q);
    if (s > 0) {
      const days = (now - (r.watched_at || 0)) / 86400000;
      add(r, s + (days < 7 ? 20 : 8), 'Continue Watching');
    }
  });

  const results = [...byUrl.values()];
  results.forEach((r) => {
    if (favorites.includes(r.channel.url)) r.score += 10;
  });
  return results.sort((a, b) => b.score - a.score).slice(0, 40);
}