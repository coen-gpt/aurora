import { base44 } from '@/api/base44Client';

// Load channels for a playlist — either a raw M3U URL or an Xtream Codes login.
export async function loadChannels(playlist) {
  const res = playlist.type === 'xtream'
    ? await base44.functions.invoke('xtreamAuth', {
        server: playlist.server,
        username: playlist.username,
        password: playlist.password,
      })
    : await base44.functions.invoke('fetchPlaylist', { url: playlist.url });
  if (res.data.error) throw new Error(res.data.error);
  return { channels: res.data.channels, epgUrl: res.data.epg_url || null };
}

// Load the XMLTV guide, filtered to the channel ids we actually have.
export async function loadEpg(epgUrl, channels) {
  const ids = [...new Set(channels.map((c) => c.tvg_id).filter(Boolean))];
  if (!epgUrl || ids.length === 0) return {};
  const res = await base44.functions.invoke('fetchEpg', { url: epgUrl, channel_ids: ids });
  if (res.data.error) throw new Error(res.data.error);
  return res.data.guide || {};
}

export const getEpgUrl = (pl) => pl?.epg_override || pl?.epg_detected || null;

// What's on now (and next) for a channel.
export function nowNext(guide, channel) {
  const progs = guide[(channel.tvg_id || '').toLowerCase()] || [];
  const t = Date.now();
  const i = progs.findIndex((p) => p.start <= t && p.stop > t);
  return {
    now: i >= 0 ? progs[i] : null,
    next: i >= 0 ? progs[i + 1] || null : progs.find((p) => p.start > t) || null,
  };
}

export const fmtTime = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });