import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { load, save } from '@/lib/storage';
import { loadChannels, loadEpg } from '@/lib/iptv';
import VideoPlayer from '@/components/player/VideoPlayer';
import ChannelList from '@/components/player/ChannelList';
import PlaylistManager from '@/components/player/PlaylistManager';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Star, Tv } from 'lucide-react';

export default function Player() {
  const [playlists, setPlaylists] = useState(() => load('iptv_playlists', []));
  const [activeId, setActiveId] = useState(() => load('iptv_active_playlist', null));
  const [favorites, setFavorites] = useState(() => load('iptv_favorites', []));
  const [channels, setChannels] = useState([]);
  const [guide, setGuide] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All');
  const [favsOnly, setFavsOnly] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const location = useLocation();
  const [current, setCurrent] = useState(location.state?.channel || null);

  useEffect(() => { save('iptv_playlists', playlists); }, [playlists]);
  useEffect(() => { save('iptv_active_playlist', activeId); }, [activeId]);
  useEffect(() => { save('iptv_favorites', favorites); }, [favorites]);

  useEffect(() => {
    const pl = load('iptv_playlists', []).find((p) => p.id === activeId);
    if (!pl) { setChannels([]); setGuide({}); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setGuide({});
    loadChannels(pl)
      .then(({ channels: chs, epgUrl }) => {
        if (cancelled) return;
        setChannels(chs);
        if (epgUrl) {
          setPlaylists((prev) => prev.map((p) => (p.id === activeId ? { ...p, epg_detected: epgUrl } : p)));
        }
        const finalEpg = pl.epg_override || epgUrl || pl.epg_detected;
        if (finalEpg) {
          loadEpg(finalEpg, chs).then((g) => { if (!cancelled) setGuide(g); }).catch(() => {});
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeId, reloadKey]);

  const playChannel = (ch) => {
    setCurrent(ch);
    const recents = load('iptv_recent', []).filter((r) => r.url !== ch.url);
    save('iptv_recent', [ch, ...recents].slice(0, 12));
  };

  const groups = useMemo(() => ['All', ...new Set(channels.map((c) => c.group))], [channels]);

  const filtered = useMemo(() => {
    let list = channels;
    if (favsOnly) list = list.filter((c) => favorites.includes(c.url));
    if (group !== 'All') list = list.filter((c) => c.group === group);
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return list.slice(0, 500);
  }, [channels, group, search, favsOnly, favorites]);

  const addPlaylist = (data) => {
    const pl = { id: Date.now().toString(36), ...data };
    setPlaylists((prev) => [...prev, pl]);
    setActiveId(pl.id);
  };

  const removePlaylist = (id) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const updatePlaylist = (id, patch) => {
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setReloadKey((k) => k + 1);
  };

  const toggleFav = (url) => {
    setFavorites((prev) => prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">IPTV Player</h1>
        <p className="text-sm text-muted-foreground mt-1">Bring your own playlist or Xtream login. Nothing is stored in the app.</p>
      </div>

      <PlaylistManager
        playlists={playlists}
        activeId={activeId}
        onAdd={addPlaylist}
        onRemove={removePlaylist}
        onSelect={setActiveId}
        onUpdate={updatePlaylist}
      />

      {current && <VideoPlayer channel={current} guide={guide} onClose={() => setCurrent(null)} />}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Loading your channels…</span>
        </div>
      )}
      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-4">{error}</p>}

      {!loading && !error && channels.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder={`Search ${channels.length.toLocaleString()} channels…`} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="h-10 rounded-md border border-input bg-card px-3 text-sm max-w-[180px]"
              >
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <button
                onClick={() => setFavsOnly(!favsOnly)}
                className={`h-10 px-3 rounded-md border text-sm flex items-center gap-1.5 transition-colors ${
                  favsOnly ? 'bg-amber-400/15 border-amber-400/40 text-amber-400' : 'border-input bg-card text-muted-foreground'
                }`}
              >
                <Star className={`w-4 h-4 ${favsOnly ? 'fill-current' : ''}`} /> Favorites
              </button>
            </div>
          </div>
          <ChannelList
            channels={filtered}
            favorites={favorites}
            onToggleFav={toggleFav}
            onSelect={playChannel}
            selectedUrl={current?.url}
            guide={guide}
          />
        </div>
      )}

      {!loading && !error && playlists.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Tv className="w-8 h-8 text-primary" />
          </div>
          <p className="font-medium">No sources yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Tap "Add Source" and paste your own M3U link or sign in with your Xtream Codes account.
          </p>
        </div>
      )}
    </div>
  );
}