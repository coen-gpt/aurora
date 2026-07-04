import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, CircleAlert } from 'lucide-react';

export default function EpgSettings({ open, onClose, playlist, onSave }) {
  const [override, setOverride] = useState('');

  useEffect(() => {
    if (open) setOverride(playlist.epg_override || '');
  }, [open, playlist]);

  const save = (e) => {
    e.preventDefault();
    onSave(override.trim() || null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>TV Guide (EPG) settings</DialogTitle>
          <DialogDescription>Aurora auto-detects your provider's guide. You can also use your own XMLTV source.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
            playlist.epg_detected
              ? 'bg-emerald-400/10 border-emerald-400/30'
              : 'bg-amber-400/10 border-amber-400/30'
          }`}>
            {playlist.epg_detected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-emerald-400">EPG auto-detected</p>
                  <p className="text-muted-foreground break-all mt-0.5">{playlist.epg_detected}</p>
                </div>
              </>
            ) : (
              <>
                <CircleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">No EPG was detected from this source. Paste your own XMLTV guide URL below.</p>
              </>
            )}
          </div>
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Custom EPG URL (overrides auto-detected)</label>
              <Input
                placeholder="https://example.com/guide.xml or .xml.gz"
                value={override}
                onChange={(e) => setOverride(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Save & Reload Guide</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}