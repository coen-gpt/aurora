import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import VideoPlayer from '@/components/player/VideoPlayer';
import { load, save } from '@/lib/storage';
import { Loader2, Smartphone, Tv } from 'lucide-react';

const makeCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function TvMode() {
  const [session, setSession] = useState(null);
  const [channel, setChannel] = useState(null);

  // Create (or reuse) this screen's pairing session
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const savedId = load('aurora_tv_session_id', null);
      if (savedId) {
        try {
          const existing = await base44.entities.SyncSession.get(savedId);
          if (existing && !cancelled) {
            setSession(existing);
            if (existing.channel?.url) setChannel(existing.channel);
            return;
          }
        } catch { /* stale session — create a new one */ }
      }
      const created = await base44.entities.SyncSession.create({ code: makeCode() });
      if (!cancelled) {
        save('aurora_tv_session_id', created.id);
        setSession(created);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Listen for channels sent from the phone
  useEffect(() => {
    if (!session) return;
    const unsubscribe = base44.entities.SyncSession.subscribe((event) => {
      if (event.type === 'update' && event.data?.id === session.id && event.data.channel?.url) {
        setChannel(event.data.channel);
      }
    });
    return unsubscribe;
  }, [session]);

  if (channel) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center p-2 md:p-6 max-w-6xl mx-auto w-full">
        <VideoPlayer channel={channel} onClose={() => setChannel(null)} />
        <p className="text-center text-xs text-muted-foreground mt-3">
          Paired · code <span className="font-mono text-primary">{session?.code}</span> — pick another channel on your phone anytime
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center">
          <Tv className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">TV Mode</h1>
          <p className="text-sm text-muted-foreground mt-2">
            On your phone, open the Player, tap <span className="text-foreground font-medium">Send to TV</span> and enter this code:
          </p>
        </div>
        {session ? (
          <div className="flex justify-center gap-2">
            {session.code.split('').map((c, i) => (
              <span key={i} className="w-12 h-16 md:w-14 md:h-20 rounded-xl bg-card border border-primary/40 flex items-center justify-center font-mono text-3xl md:text-4xl font-bold text-primary shadow-lg shadow-primary/10">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        )}
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" /> Waiting for your phone…
        </p>
      </div>
    </div>
  );
}