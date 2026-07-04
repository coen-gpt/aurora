import React from 'react';
import { Link } from 'react-router-dom';
import { load } from '@/lib/storage';
import { Tv, Radio, Gamepad2, Lightbulb, ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react';

const cards = [
  { to: '/player', title: 'IPTV Player', desc: 'Watch your channels with your own playlist', icon: Tv, gradient: 'from-violet-600 to-fuchsia-500' },
  { to: '/devices', title: 'Device Hub', desc: 'Pair TVs, soundbars, streamers & lights', icon: Radio, gradient: 'from-blue-600 to-cyan-500' },
  { to: '/remote', title: 'Universal Remote', desc: 'Control everything from one remote', icon: Gamepad2, gradient: 'from-emerald-600 to-teal-500' },
  { to: '/lighting', title: 'Smart Lighting', desc: 'Scenes, colors & brightness control', icon: Lightbulb, gradient: 'from-amber-500 to-orange-500' },
];

export default function Home() {
  const playlists = load('iptv_playlists', []);
  const devices = load('hub_devices', []);
  const connected = devices.filter((d) => d.connected).length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/25 via-card to-card border border-border p-8 md:p-12">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Bring your own content — nothing stored in the app
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Your entire living room.<br />One hub.
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Stream your own channels, pair your devices, and control your whole setup — the cable-cutter command center.
          </p>
          <Link
            to="/player"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
          >
            <PlayCircle className="w-4 h-4" /> Start Watching
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Playlists', value: playlists.length },
          { label: 'Devices Paired', value: devices.length },
          { label: 'Connected Now', value: connected },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="font-display text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
            <p className="text-[11px] md:text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c) => (
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
            <ArrowRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}