import { load, save } from '@/lib/storage';

const KEY = 'watch_stats';

// Called on every watch (from lib/recents) — counts plays per genre/group and channel.
export function recordWatch(channel) {
  const stats = load(KEY, { groups: {}, channels: {} });
  const g = channel.group || 'Other';
  stats.groups[g] = (stats.groups[g] || 0) + 1;
  if (channel.url) {
    stats.channels[channel.url] = { name: channel.name, count: (stats.channels[channel.url]?.count || 0) + 1 };
  }
  save(KEY, stats);
}

// Most-watched genres/groups, highest first.
export function topGroups(n = 3) {
  const stats = load(KEY, { groups: {} });
  return Object.entries(stats.groups || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([group, count]) => ({ group, count }));
}