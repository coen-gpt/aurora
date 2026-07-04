import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { load } from '@/lib/storage';
import { pullRecents } from '@/lib/recents';
import { getMyList } from '@/lib/mylist';
import ChannelRow from '@/components/home/ChannelRow';
import { Tv, Radio, Gamepad2, Lightbulb, Play, Plus, ShieldCheck, ChevronRight } from 'lucide-react';

const LOGO = 'https://media.base44.com/images/public/6a485551f0d60c9fa95dcd18/8f526db81_generated_image.png';

const hubs = [
  { to: '/devices', title: 'Device Hub', desc: 'Pair & manage devices', icon: Radio, gradient: 'from-blue-600 to-cyan-500' },
  { to: '/remote', title: 'Remote', desc: 'One remote for everything', icon: Gamepad2, gradient: 'from-emerald-600 to-teal-500' },
  { to: '/lighting', title: 'Lighting', desc: 'Scenes & mood control', icon: Lightbulb, gradient: 'from-amber-500 to-orange-500' },
];

export default function Home() {
  const [recents, setRecents] = useState(() => load('iptv_recent', []));
  useEffect(() => { pullRecents().then(setRecents); }, []);
  const playlists = load('iptv_playlists', []);
  const devices = load('hub_devices', []);

  // Favorites row: saved shows (My List) + pinned channels resolved from locally known items
  const myList = getMyList();
  const favUrls = load('iptv_favorites', []);
  const known = [...myList, ...recents];
  const pinned = favUrls
    .map((u) => known.find((c) => c.url === u))
    .filter((c) => c && !myList.some((m) => m.url === c.url));
  const favoritesRow = [...myList, ...pinned];

  const connected = devices.filter((d) => d.connected).length;

  return (
    <div className="space-y-8 pb-8">
      {/* Cinematic hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-fuchsia-500/5 to-background pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/25 blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-14 md:pb-20 flex flex-col items-center text-center">
          <img src={LOGO} alt="Aurora" className="w-20 h-20 md:w-24 md:h-24 rounded-3xl shadow-[0_0_60px_hsl(var(--primary)/0.5)] mb-6" />
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Stream. Control. Illuminate.</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg mt-4 max-w-xl">
            Your universe of entertainment. Watch your own channels, command every device, and set the perfect mood — all from one hub.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              to="/player"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            >
              <Play className="w-4 h-4 fill-current" /> Start Watching
            </Link>
            <Link
              to="/devices"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-secondary border border-border text-sm font-semibold hover:border-primary/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Pair a Device
            </Link>
          </div>
          <div className="inline-flex items-center gap-1.5 mt-6 px-3 py-1 rounded-full bg-secondary/60 text-muted-foreground text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Bring your own content — Aurora never stores streams
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Favorites & saved shows */}
        <ChannelRow title="Favorites" channels={favoritesRow} />

        {/* Continue watching */}
        <ChannelRow title="Continue Watching" channels={recents} />

        {/* Control hubs */}
        <section className="space-y-3 px-4 md:px-8">
          <h2 className="font-display text-lg font-bold tracking-tight">Your Command Center</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {hubs.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all overflow-hidden"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                <ChevronRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Stats strip */}
        <section className="px-4 md:px-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Playlists', value: playlists.length, icon: Tv },
              { label: 'Devices Paired', value: devices.length, icon: Radio },
              { label: 'Connected Now', value: connected, icon: Lightbulb },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-card border border-border text-center">
                <p className="font-display text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}