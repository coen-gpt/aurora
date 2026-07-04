import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { load } from '@/lib/storage';
import { pKey } from '@/lib/profiles';
import { loadChannels, loadEpg, getEpgUrl, fmtTime } from '@/lib/iptv';
import { getMyList } from '@/lib/mylist';
import { unifiedSearch } from '@/lib/search';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Tv, Play } from 'lucide-react';

const sourceColors = {
  Live: 'bg-primary/15 text-primary',
  Guide: 'bg-cyan-500/15 text-cyan-400',
  'My List': 'bg-fuchsia-500/15 text-fuchsia-400',
  'Continue Watching': 'bg-emerald-500/15 text-emerald-400',
};

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(location.state?.q || '');
  const [channels, setChannels] = useState([]);
  const [guide, setGuide] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pl = load('iptv_playlists', []).find((p) => p.id === load('iptv_active_playlist', null));
    if (!pl) return;
    let cancelled = false;
    setLoading(true);
    loadChannels(pl)
      .then(({ channels: chs, epgUrl }) => {
        if (cancelled) return;
        setChannels(chs);
        const finalEpg = getEpgUrl(pl) || epgUrl;
        if (finalEpg) loadEpg(finalEpg, chs).then((g) => { if (!cancelled) setGuide(g); }).catch(() => {});
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const results = useMemo(
    () =>
      unifiedSearch(query, {
        channels,
        guide,
        myList: getMyList(),
        recents: load(pKey('iptv_recent'), []),
        favorites: load(pKey('iptv_favorites'), []),
      }),
    [query, channels, guide]
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">One search across live channels, the guide, My List, and Continue Watching.</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 h-12"
          placeholder="Search channels, shows, saved items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />}
      </div>

      {query.trim().length >= 2 && results.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground text-center py-12">No matches found{channels.length === 0 ? ' — add a playlist in the Player to search live channels' : ''}.</p>
      )}

      <div className="space-y-2">
        {results.map((r) => (
          <button
            key={r.channel.url}
            onClick={() => navigate('/player', { state: { channel: r.channel } })}
            className="group w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {r.channel.logo ? (
                <img src={r.channel.logo} alt="" className="w-full h-full object-contain" loading="lazy" />
              ) : (
                <Tv className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{r.channel.name}</p>
              {r.program ? (
                <p className="text-xs text-muted-foreground truncate">
                  {r.program.title} · {fmtTime(r.program.start)}–{fmtTime(r.program.stop)}
                </p>
              ) : (
                r.channel.group && <p className="text-xs text-muted-foreground truncate">{r.channel.group}</p>
              )}
              <div className="flex gap-1.5 mt-1">
                {r.sources.map((s) => (
                  <span key={s} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sourceColors[s] || 'bg-secondary text-muted-foreground'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <Play className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}