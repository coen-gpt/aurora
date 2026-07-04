import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle2, XCircle, EyeOff, Eye, Loader2 } from 'lucide-react';

const BATCH = 15;
const MAX = 90;

export default function HealthCheck({ channels, hiddenCount, onHide }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const run = async () => {
    setRunning(true);
    setResults(null);
    setProgress(0);
    const targets = channels.slice(0, MAX);
    let ok = 0;
    const dead = [];
    for (let i = 0; i < targets.length; i += BATCH) {
      const batch = targets.slice(i, i + BATCH);
      try {
        const res = await base44.functions.invoke('checkStreams', { urls: batch.map((c) => c.url) });
        const byUrl = Object.fromEntries((res.data.results || []).map((r) => [r.url, r]));
        batch.forEach((c) => {
          if (byUrl[c.url]?.ok) ok++;
          else dead.push({ url: c.url, name: c.name });
        });
      } catch {
        // batch failed to test — count as unchecked, don't mark dead
      }
      setProgress(Math.round(((i + batch.length) / targets.length) * 100));
    }
    setResults({ ok, dead, checked: targets.length });
    setRunning(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Activity className="w-4 h-4" /> Health Check
        {hiddenCount > 0 && <span className="text-xs text-muted-foreground">({hiddenCount} hidden)</span>}
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!running) setOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Channel health check</DialogTitle>
            <DialogDescription>
              Tests the first {Math.min(channels.length, MAX)} channels of this playlist and finds dead streams.
            </DialogDescription>
          </DialogHeader>

          {!running && !results && (
            <Button onClick={run}><Activity className="w-4 h-4" /> Start check</Button>
          )}

          {running && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Testing streams… {progress}%
              </div>
              <Progress value={progress} />
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
                  <p className="flex items-center justify-center gap-1.5 font-display text-xl font-bold text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" /> {results.ok}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Working</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10 text-center">
                  <p className="flex items-center justify-center gap-1.5 font-display text-xl font-bold text-destructive">
                    <XCircle className="w-5 h-5" /> {results.dead.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Dead</p>
                </div>
              </div>

              {results.dead.length > 0 && (
                <>
                  <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-border p-2">
                    {results.dead.map((d) => (
                      <p key={d.url} className="text-xs text-muted-foreground truncate">✕ {d.name}</p>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { onHide(results.dead.map((d) => d.url)); setOpen(false); }}>
                    <EyeOff className="w-4 h-4" /> Hide {results.dead.length} dead channels
                  </Button>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1" onClick={run}>Re-run</Button>
                {hiddenCount > 0 && (
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => { onHide(null); setOpen(false); }}>
                    <Eye className="w-4 h-4" /> Restore hidden ({hiddenCount})
                  </Button>
                )}
              </div>
            </div>
          )}

          {!running && !results && hiddenCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { onHide(null); setOpen(false); }}>
              <Eye className="w-4 h-4" /> Restore {hiddenCount} hidden channels
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}