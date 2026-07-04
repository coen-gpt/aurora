import { base44 } from '@/api/base44Client';
import { load, save } from '@/lib/storage';

const KEY = 'iptv_recent';

const merge = (a, b) => {
  const byUrl = {};
  [...a, ...b].forEach((r) => {
    if (!r?.url) return;
    if (!byUrl[r.url] || (r.watched_at || 0) > (byUrl[r.url].watched_at || 0)) byUrl[r.url] = r;
  });
  return Object.values(byUrl)
    .sort((x, y) => (y.watched_at || 0) - (x.watched_at || 0))
    .slice(0, 12);
};

// Pull recents from the account, merge with this device's list, and cache locally.
export async function pullRecents() {
  const local = load(KEY, []);
  try {
    const me = await base44.auth.me();
    const merged = merge(me?.iptv_recent || [], local);
    save(KEY, merged);
    return merged;
  } catch {
    return local;
  }
}

// Record a watch locally and sync it to the account so other devices see it.
export function addRecent(channel) {
  const entry = { name: channel.name, url: channel.url, logo: channel.logo || '', group: channel.group || '', tvg_id: channel.tvg_id || '', watched_at: Date.now() };
  const list = merge([entry], load(KEY, []));
  save(KEY, list);
  base44.auth.updateMe({ iptv_recent: list }).catch(() => {});
  return list;
}