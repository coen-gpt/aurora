import React, { useState } from 'react';
import { Tv, Play, Bell } from 'lucide-react';
import { fmtTime } from '@/lib/iptv';
import { getReminders, isReminded, toggleReminder } from '@/lib/reminders';

export default function GuideRow({ channel, now, next, onPlay }) {
  const progress = now ? Math.min(100, Math.max(0, ((Date.now() - now.start) / (now.stop - now.start)) * 100)) : 0;
  const [reminders, setReminders] = useState(getReminders);
  const nextReminded = next ? isReminded(reminders, channel.url, next.start) : false;

  return (
    <div
      onClick={onPlay}
      className="group flex items-center gap-4 md:gap-5 p-3.5 md:p-4 rounded-2xl bg-gradient-to-r from-card to-card/40 border border-border hover:border-primary/40 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.12)] hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
    >
      {/* Poster thumbnail */}
      <div className="relative w-24 h-14 md:w-32 md:h-[4.5rem] rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-secondary via-secondary/60 to-background ring-1 ring-border group-hover:ring-primary/30 transition-all">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt=""
            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="w-6 h-6 text-muted-foreground/60" />
          </div>
        )}
        {now && (
          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[8px] font-bold tracking-wider uppercase">
            Live
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
          {channel.name}{channel.group ? ` · ${channel.group}` : ''}
        </p>
        {now ? (
          <>
            <div className="flex items-baseline gap-2 min-w-0 mt-0.5">
              <p className="font-display text-sm md:text-base font-semibold truncate">{now.title}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{fmtTime(now.start)} – {fmtTime(now.stop)}</span>
            </div>
            <div className="h-1 rounded-full bg-secondary mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-fuchsia-500 rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            {next && (
              <p className="text-[11px] text-muted-foreground truncate mt-2 flex items-center gap-1.5">
                <span className="text-foreground/60 font-medium shrink-0">Up next:</span>
                <span className="truncate">{next.title} · {fmtTime(next.start)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setReminders(toggleReminder(channel, next)); }}
                  className={`p-1 rounded-full shrink-0 transition-colors ${nextReminded ? 'text-primary' : 'text-muted-foreground/50 hover:text-primary'}`}
                  title={nextReminded ? 'Remove reminder' : 'Remind me when this starts'}
                >
                  <Bell className={`w-3.5 h-3.5 ${nextReminded ? 'fill-current' : ''}`} />
                </button>
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">No guide data for this channel</p>
        )}
      </div>

      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_0_24px_hsl(var(--primary)/0.5)]">
        <Play className="w-4 h-4 fill-current ml-0.5" />
      </div>
    </div>
  );
}