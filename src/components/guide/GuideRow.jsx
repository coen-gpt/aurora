import React from 'react';
import { Tv, Play } from 'lucide-react';
import { fmtTime } from '@/lib/iptv';

export default function GuideRow({ channel, now, next, onPlay }) {
  const progress = now ? Math.min(100, Math.max(0, ((Date.now() - now.start) / (now.stop - now.start)) * 100)) : 0;

  return (
    <div
      onClick={onPlay}
      className="group flex items-center gap-3 md:gap-4 p-3 rounded-xl bg-card border border-border hover:border-primary/40 cursor-pointer transition-all"
    >
      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
        {channel.logo ? (
          <img src={channel.logo} alt="" className="w-full h-full object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <Tv className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="w-32 md:w-44 shrink-0 min-w-0">
        <p className="text-sm font-medium truncate">{channel.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{channel.group}</p>
      </div>

      <div className="flex-1 min-w-0">
        {now ? (
          <>
            <div className="flex items-baseline gap-2 min-w-0">
              <p className="text-sm font-medium truncate">{now.title}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{fmtTime(now.start)} – {fmtTime(now.stop)}</span>
            </div>
            <div className="h-1 rounded-full bg-secondary mt-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-fuchsia-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            {next && (
              <p className="text-[11px] text-muted-foreground truncate mt-1.5">
                Next: {next.title} · {fmtTime(next.start)}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No guide data for this channel</p>
        )}
      </div>

      <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-4 h-4 fill-current ml-0.5" />
      </div>
    </div>
  );
}