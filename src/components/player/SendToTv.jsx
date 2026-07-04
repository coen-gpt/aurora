import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { load, save } from '@/lib/storage';
import { MonitorUp, Loader2, CheckCircle2 } from 'lucide-react';

export default function SendToTv({ channel }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(() => load('aurora_tv_code', ''));
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const send = async (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length < 4) return;
    setStatus('sending');
    setError('');
    try {
      const [session] = await base44.entities.SyncSession.filter({ code: c });
      if (!session) {
        setStatus('error');
        setError('No TV found with that code. Make sure TV Mode is open on your TV.');
        return;
      }
      await base44.entities.SyncSession.update(session.id, {
        channel: { name: channel.name, url: channel.url, logo: channel.logo || '', group: channel.group || '' },
      });
      save('aurora_tv_code', c);
      setStatus('sent');
      setTimeout(() => { setOpen(false); setStatus('idle'); }, 1200);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={() => { setOpen(true); setStatus('idle'); }}>
        <MonitorUp className="w-3.5 h-3.5 mr-1.5" /> Send to TV
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Send to TV</DialogTitle>
            <DialogDescription>
              Open Aurora on your TV and go to <span className="text-primary font-medium">TV Mode</span>, then enter the code shown on the screen.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={send} className="space-y-3">
            <Input
              placeholder="e.g. K7X2PQ"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-lg font-mono tracking-[0.4em] uppercase"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={status === 'sending'}>
              {status === 'sending' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {status === 'sent' ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Sent!</> : `Play "${channel.name}" on TV`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}