import React, { useState } from 'react';
import { load } from '@/lib/storage';
import { Link } from 'react-router-dom';
import {
  Power, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Volume2, VolumeX, Home, CornerUpLeft, Play, Pause, Tv, Speaker, MonitorPlay, Gamepad2
} from 'lucide-react';

const icons = { tv: Tv, soundbar: Speaker, streaming: MonitorPlay };

function RemoteButton({ children, onClick, className = '', label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-2xl bg-secondary border border-border text-foreground
        active:scale-90 active:bg-primary/25 hover:border-primary/40 transition-all duration-150 ${className}`}
    >
      {children}
    </button>
  );
}

export default function Remote() {
  const devices = load('hub_devices', []).filter((d) => ['tv', 'soundbar', 'streaming'].includes(d.type));
  const [activeId, setActiveId] = useState(devices[0]?.id || null);
  const [lastCmd, setLastCmd] = useState(null);
  const active = devices.find((d) => d.id === activeId);

  const send = (cmd) => {
    setLastCmd(cmd);
    setTimeout(() => setLastCmd((c) => (c === cmd ? null : c)), 1200);
  };

  if (devices.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-md mx-auto text-center py-24 space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-primary" />
        </div>
        <p className="font-medium">No controllable devices</p>
        <p className="text-sm text-muted-foreground">
          Pair a TV, soundbar, or streaming device first, then control it from here.
        </p>
        <Link to="/devices" className="inline-block text-sm text-primary font-medium hover:underline">Go to Device Hub →</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Remote</h1>
        <p className="text-sm text-muted-foreground mt-1">One remote for everything.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {devices.map((d) => {
          const Icon = icons[d.type] || Tv;
          return (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                d.id === activeId ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card border-border text-muted-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {d.name}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl bg-card border border-border p-6 space-y-5 shadow-[0_0_50px_hsl(var(--primary)/0.08)]">
        {/* Status screen */}
        <div className="h-12 rounded-xl bg-background border border-border flex items-center justify-center text-xs font-mono tracking-wider">
          {lastCmd ? (
            <span className="text-primary animate-pulse">▸ {lastCmd} → {active?.name}</span>
          ) : (
            <span className="text-muted-foreground">{active?.connected ? 'READY' : 'DEVICE OFFLINE'}</span>
          )}
        </div>

        {/* Power row */}
        <div className="flex justify-between">
          <RemoteButton label="Power" onClick={() => send('POWER')} className="w-14 h-14 !bg-destructive/15 !border-destructive/30 text-destructive">
            <Power className="w-5 h-5" />
          </RemoteButton>
          <RemoteButton label="Home" onClick={() => send('HOME')} className="w-14 h-14">
            <Home className="w-5 h-5" />
          </RemoteButton>
          <RemoteButton label="Back" onClick={() => send('BACK')} className="w-14 h-14">
            <CornerUpLeft className="w-5 h-5" />
          </RemoteButton>
        </div>

        {/* D-pad */}
        <div className="relative w-52 h-52 mx-auto">
          <div className="absolute inset-0 rounded-full bg-secondary border border-border" />
          <button aria-label="Up" onClick={() => send('UP')} className="absolute top-2 left-1/2 -translate-x-1/2 p-3 text-muted-foreground hover:text-primary active:scale-90 transition-all"><ChevronUp className="w-7 h-7" /></button>
          <button aria-label="Down" onClick={() => send('DOWN')} className="absolute bottom-2 left-1/2 -translate-x-1/2 p-3 text-muted-foreground hover:text-primary active:scale-90 transition-all"><ChevronDown className="w-7 h-7" /></button>
          <button aria-label="Left" onClick={() => send('LEFT')} className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-muted-foreground hover:text-primary active:scale-90 transition-all"><ChevronLeft className="w-7 h-7" /></button>
          <button aria-label="Right" onClick={() => send('RIGHT')} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-muted-foreground hover:text-primary active:scale-90 transition-all"><ChevronRight className="w-7 h-7" /></button>
          <button
            aria-label="OK"
            onClick={() => send('OK')}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-white text-sm font-bold shadow-[0_0_30px_hsl(var(--primary)/0.4)] active:scale-90 transition-transform"
          >
            OK
          </button>
        </div>

        {/* Volume / media */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col rounded-2xl bg-secondary border border-border overflow-hidden">
            <button aria-label="Volume up" onClick={() => send('VOL +')} className="flex-1 py-3 flex justify-center hover:text-primary active:bg-primary/20 transition-colors"><Volume2 className="w-4 h-4" /></button>
            <span className="text-[9px] text-center text-muted-foreground tracking-widest py-0.5">VOL</span>
            <button aria-label="Volume down" onClick={() => send('VOL -')} className="flex-1 py-3 flex justify-center hover:text-primary active:bg-primary/20 transition-colors"><VolumeX className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-col gap-3">
            <RemoteButton label="Play" onClick={() => send('PLAY')} className="flex-1"><Play className="w-4 h-4" /></RemoteButton>
            <RemoteButton label="Pause" onClick={() => send('PAUSE')} className="flex-1"><Pause className="w-4 h-4" /></RemoteButton>
          </div>
          <div className="flex flex-col rounded-2xl bg-secondary border border-border overflow-hidden">
            <button aria-label="Channel up" onClick={() => send('CH +')} className="flex-1 py-3 flex justify-center hover:text-primary active:bg-primary/20 transition-colors"><ChevronUp className="w-4 h-4" /></button>
            <span className="text-[9px] text-center text-muted-foreground tracking-widest py-0.5">CH</span>
            <button aria-label="Channel down" onClick={() => send('CH -')} className="flex-1 py-3 flex justify-center hover:text-primary active:bg-primary/20 transition-colors"><ChevronDown className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}