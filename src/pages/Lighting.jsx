import React, { useState, useEffect } from 'react';
import { load, save } from '@/lib/storage';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Lightbulb, Film, Coffee, BookOpen, PartyPopper } from 'lucide-react';

const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF'];

const scenes = [
  { name: 'Movie Night', icon: Film, color: '#8B5CF6', brightness: 20 },
  { name: 'Relax', icon: Coffee, color: '#F59E0B', brightness: 45 },
  { name: 'Focus', icon: BookOpen, color: '#FFFFFF', brightness: 100 },
  { name: 'Party', icon: PartyPopper, color: '#EC4899', brightness: 85 },
];

export default function Lighting() {
  const [devices, setDevices] = useState(() => load('hub_devices', []));
  const lights = devices.filter((d) => d.type === 'light');

  useEffect(() => { save('hub_devices', devices); }, [devices]);

  const updateLight = (id, patch) =>
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const applyScene = (scene) =>
    setDevices((prev) => prev.map((d) =>
      d.type === 'light' ? { ...d, on: true, color: scene.color, brightness: scene.brightness } : d
    ));

  if (lights.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-md mx-auto text-center py-24 space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lightbulb className="w-8 h-8 text-primary" />
        </div>
        <p className="font-medium">No smart lights paired</p>
        <p className="text-sm text-muted-foreground">Pair your smart lights to set the perfect mood for movie night.</p>
        <Link to="/devices" className="inline-block text-sm text-primary font-medium hover:underline">Go to Device Hub →</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Smart Lighting</h1>
        <p className="text-sm text-muted-foreground mt-1">Set the mood with one tap.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {scenes.map((s) => (
          <button
            key={s.name}
            onClick={() => applyScene(s)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all"
          >
            <s.icon className="w-5 h-5" style={{ color: s.color === '#FFFFFF' ? undefined : s.color }} />
            <span className="text-xs font-medium">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {lights.map((light) => (
          <div
            key={light.id}
            className="p-5 rounded-2xl bg-card border border-border space-y-4 transition-shadow"
            style={light.on ? { boxShadow: `0 0 40px ${light.color}22` } : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ backgroundColor: light.on ? `${light.color}30` : undefined }}
                >
                  <Lightbulb className="w-5 h-5" style={{ color: light.on ? light.color : 'hsl(var(--muted-foreground))' }} />
                </div>
                <div>
                  <p className="text-sm font-medium">{light.name}</p>
                  <p className="text-xs text-muted-foreground">{light.room} · {light.on ? `${light.brightness}%` : 'Off'}</p>
                </div>
              </div>
              <Switch checked={!!light.on} onCheckedChange={(v) => updateLight(light.id, { on: v })} />
            </div>

            {light.on && (
              <>
                <Slider
                  value={[light.brightness]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateLight(light.id, { brightness: v })}
                />
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateLight(light.id, { color: c })}
                      className={`w-7 h-7 rounded-full transition-transform active:scale-90 ${
                        light.color === c ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Set color ${c}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}