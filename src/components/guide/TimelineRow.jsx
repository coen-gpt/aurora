import React, { useState } from 'react';
import { Tv, Bell } from 'lucide-react';
import { fmtTime } from '@/lib/iptv';
import { getReminders, isReminded, toggleReminder } from '@/lib/reminders';

export default function TimelineRow({ channel, programs, windowStart, windowEnd, pxPerMin, nowTs, onPlay }) {
  const visible = programs.filter((p) => p.stop > windowStart && p.start < windowEnd);
  const [reminders, setReminders] = useState(getReminders);

  return (
    <div className="flex h-16 border-b border-border/60">
      <button
        onClick={onPlay}
        className="sticky left-0 z-10 w-40 shrink-0 flex items-center gap-2 px-2 bg-card border-r border-border hover:bg-secondary transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {channel.logo ? (
            <img src={channel.logo} alt="" className="w-full h-full object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <Tv className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <span className="text-xs font-medium truncate">{channel.name}</span>
      </button>

      <div className="relative flex-1">
        {visible.length === 0 && (
          <span className="absolute inset-y-0 left-3 flex items-center text-[11px] text-muted-foreground">No guide data</span>
        )}
        {visible.map((p, i) => {
          const start = Math.max(p.start, windowStart);
          const stop = Math.min(p.stop, windowEnd);
          const live = p.start <= nowTs && p.stop > nowTs;
          const future = p.start > nowTs;
          const reminded = future && isReminded(reminders, channel.url, p.start);
          return (
            <button
              key={i}
              onClick={future ? () => setReminders(toggleReminder(channel, p)) : onPlay}
              title={future
                ? `${p.title} · ${fmtTime(p.start)} – ${fmtTime(p.stop)} — tap to ${reminded ? 'remove the reminder' : 'set a reminder'}`
                : `${p.title} · ${fmtTime(p.start)} – ${fmtTime(p.stop)}`}
              style={{ left: ((start - windowStart) / 60000) * pxPerMin, width: Math.max(((stop - start) / 60000) * pxPerMin - 2, 24) }}
              className={`absolute top-1.5 bottom-1.5 rounded-md px-2 text-left overflow-hidden border transition-colors ${
                live ? 'bg-primary/20 border-primary/50' : 'bg-secondary/60 border-border hover:border-primary/40'
              }`}
            >
              <span className={`flex items-center gap-1 text-[11px] font-medium truncate ${live ? 'text-primary-foreground' : ''}`}>
                {reminded && <Bell className="w-3 h-3 fill-current text-primary shrink-0" />}
                <span className="truncate">{p.title}</span>
              </span>
              <span className="block text-[10px] text-muted-foreground truncate">{fmtTime(p.start)} – {fmtTime(p.stop)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}