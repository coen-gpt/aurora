import React, { useState, useEffect } from 'react';
import { load } from '@/lib/storage';
import { loadChannels } from '@/lib/iptv';
import { topGroups } from '@/lib/stats';
import ChannelRow from '@/components/home/ChannelRow';

// "Because you watch X" — channels from the user's most-watched genre they haven't seen lately.
export default function RecommendedRow() {
  const [row, setRow] = useState(null);

  useEffect(() => {
    const top = topGroups(1)[0];
    if (!top || top.count < 2) return;
    const pl = load('iptv_playlists', []).find((p) => p.id === load('iptv_active_playlist', null));
    if (!pl) return;
    let cancelled = false;
    loadChannels(pl)
      .then(({ channels }) => {
        if (cancelled) return;
        const recentUrls = new Set(load('iptv_recent', []).map((r) => r.url));
        const picks = channels.filter((c) => c.group === top.group && !recentUrls.has(c.url)).slice(0, 12);
        if (picks.length > 0) setRow({ group: top.group, channels: picks });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!row) return null;
  return <ChannelRow title={`Because you watch ${row.group}`} channels={row.channels} />;
}