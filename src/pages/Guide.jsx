import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { load } from '@/lib/storage';
import { loadChannels, loadEpg, getEpgUrl, nowNext } from '@/lib/iptv';
import GuideRow from '@/components/guide/GuideRow';
import GuideTimeline from '@/components/guide/GuideTimeline';
import { Input } from '@/components/ui/input';
import { Search, Loader2, CalendarClock, List, LayoutGrid } from 'lucide-react';

export default function Guide() {
  const navigate = useNavigate();
  const playlists = load('iptv_playlists', []);
  const [activeId, setActiveId] = useState(() => load('iptv_active_playlist', null) || playlists[0]?.id || null);
  const [channels, setChannels] = useState([]);
  const [guide, setGuide] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All');
  const [view, setView] = useState('timeline');

  useEffect(() => {
    const pl = playlists.find((p) => p.id === activeId);
    if (!pl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadChannels(pl)
      .then(async ({ channels: chs, epgUrl }) => {
        if (cancelled) return;
        setChannels(chs);
        const finalEpg = pl.epg_override || epgUrl || getEpgUrl(pl);
        if (!finalEpg) {
          setError('No EPG found for this source. Add one in the Player page under "EPG".');
          return;
        }
        const g = await loadEpg(finalEpg, chs);
        if (!cancelled) setGuide(g);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => ['All', ...new Set(channels.map((c) => c.group))], [channels]);

  const rows = useMemo(() => {
    let list = channels;
    if (group !== 'All') list = list.filter((c) => c.group === group);
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    // Channels with live guide data first
    return list
      .map((ch) => ({ ch, ...nowNext(guide, ch) }))
      .sort((a, b) => (b.now ? 1 : 0) - (a.now ? 1 : 0))
      .slice(0, 300);
  }, [channels, guide, group, search]);

  if (playlists.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-md mx-auto text-center py-24 space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <CalendarClock className="w-8 h-8 text-primary" />
        </div>
        <p className="font-medium">No sources connected</p>
        <p className="text-sm text-muted-foreground">Add an M3U playlist or Xtream login first, then browse what's on now.</p>
        <Link to="/player" className="inline-block text-sm text-primary font-medium hover:underline">Go to Player →</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">TV Guide</h1>
        <p className="text-sm text-muted-foreground mt-1">What's playing right now on your channels.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {playlists.map((pl) => (
          <button
            key={pl.id}
            onClick={() => setActiveId(pl.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              pl.id === activeId ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {pl.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">Loading the guide…</span>
        </div>
      )}
      {error && !loading && <p className="text-sm text-destructive bg-destructive/10 rounded-xl p-4">{error}</p>}

      {!loading && channels.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search channels…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm max-w-[180px]"
            >
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <div className="flex rounded-md border border-input overflow-hidden">
              <button
                onClick={() => setView('timeline')}
                className={`px-3 flex items-center gap-1.5 text-xs font-medium transition-colors ${view === 'timeline' ? 'bg-primary/15 text-primary' : 'bg-card text-muted-foreground'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Timeline
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 flex items-center gap-1.5 text-xs font-medium transition-colors border-l border-input ${view === 'list' ? 'bg-primary/15 text-primary' : 'bg-card text-muted-foreground'}`}
              >
                <List className="w-3.5 h-3.5" /> On Now
              </button>
            </div>
          </div>
          {view === 'timeline' ? (
            <GuideTimeline
              channels={rows.map((r) => r.ch)}
              guide={guide}
              onPlay={(ch) => navigate('/player', { state: { channel: ch } })}
            />
          ) : (
          <div className="space-y-2">
            {rows.map(({ ch, now, next }) => (
              <GuideRow
                key={ch.url}
                channel={ch}
                now={now}
                next={next}
                onPlay={() => navigate('/player', { state: { channel: ch } })}
              />
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}