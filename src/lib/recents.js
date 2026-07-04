import { base44 } from '@/api/base44Client';
import { load, save } from '@/lib/storage';
import { recordWatch } from '@/lib/stats';
import { pKey, getActiveProfileId } from '@/lib/profiles';

const KEY = 'iptv_recent';

// Account-level field name — per profile, so household members don't mix histories.
const accountField = () => {
  const id = getActiveProfileId();
  return id === 'default' ? 'iptv_recent' : `iptv_recent_${id}`;
};

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
  const local = load(pKey(KEY), []);
  try {
    const me = await base44.auth.me();
    const merged = merge(me?.[accountField()] || [], local);
    save(pKey(KEY), merged);
    return merged;
  } catch {
    return local;
  }
}

// Record a watch locally and sync it to the account so other devices see it.
export function addRecent(channel) {
  recordWatch(channel);
  const entry = { name: channel.name, url: channel.url, logo: channel.logo || '', group: channel.group || '', tvg_id: channel.tvg_id || '', watched_at: Date.now() };
  const list = merge([entry], load(pKey(KEY), []));
  save(pKey(KEY), list);
  // Merge with the account copy first so watches from other devices are never overwritten.
  base44.auth.me()
    .then((me) => {
      const merged = merge(list, me?.[accountField()] || []);
      save(pKey(KEY), merged);
      return base44.auth.updateMe({ [accountField()]: merged });
    })
    .catch(() => {});
  return list;
}