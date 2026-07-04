import React, { useState, useEffect } from 'react';
import { load, save } from '@/lib/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, Trash2, Lightbulb } from 'lucide-react';

export default function CustomScenes({ lights, onApply }) {
  const [scenes, setScenes] = useState(() => load('light_scenes', []));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => { save('light_scenes', scenes); }, [scenes]);

  const saveScene = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const snapshot = {};
    lights.forEach((l) => {
      snapshot[l.id] = { on: !!l.on, color: l.color || '#8B5CF6', brightness: l.brightness ?? 80 };
    });
    setScenes((prev) => [...prev, { id: Date.now().toString(36), name: name.trim(), lights: snapshot }]);
    setName('');
    setDialogOpen(false);
  };

  const removeScene = (id) => setScenes((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> My Scenes
        </h2>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Save current setup
        </Button>
      </div>

      {scenes.length === 0 ? (
        <p className="text-xs text-muted-foreground rounded-2xl border border-dashed border-border p-4 text-center">
          Set your lights just right, then save the setup as a scene like "Movie Night" or "Bright Reading".
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {scenes.map((scene) => {
            const settings = Object.values(scene.lights);
            const onCount = settings.filter((s) => s.on).length;
            return (
              <div
                key={scene.id}
                className="group relative p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <button onClick={() => onApply(scene)} className="w-full text-left space-y-2 active:scale-95 transition-transform">
                  <div className="flex -space-x-1">
                    {settings.slice(0, 5).map((s, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full ring-2 ring-card"
                        style={{ backgroundColor: s.on ? s.color : 'hsl(var(--secondary))', opacity: s.on ? 1 : 0.5 }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium truncate">{scene.name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> {onCount} of {settings.length} on
                  </p>
                </button>
                <button
                  onClick={() => removeScene(scene.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                  aria-label={`Delete ${scene.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save scene</DialogTitle>
            <DialogDescription>Saves the current on/off state, color and brightness of all {lights.length} lights.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveScene} className="space-y-3">
            <Input autoFocus placeholder='Scene name, e.g. "Movie Night"' value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" className="w-full" disabled={!name.trim()}>Save Scene</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}