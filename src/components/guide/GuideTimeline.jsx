import React, { useState, useEffect, useMemo } from 'react';
import TimelineRow from '@/components/guide/TimelineRow';
import { fmtTime } from '@/lib/iptv';

const PX_PER_MIN = 6;
const HOURS = 4;

export default function GuideTimeline({ channels, guide, onPlay }) {
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  // Window: previous half-hour boundary → +4 hours
  const windowStart = useMemo(() => {
    const d = new Date(nowTs);
    d.setMinutes(d.getMinutes() >= 30 ? 30 : 0, 0, 0);
    return d.getTime();
  }, [nowTs]);
  const windowEnd = windowStart + HOURS * 3600000;

  const slots = useMemo(
    () => Array.from({ length: HOURS * 2 }, (_, i) => windowStart + i * 30 * 60000),
    [windowStart]
  );
  const nowLeft = ((nowTs - windowStart) / 60000) * PX_PER_MIN;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card/50">
      <div className="overflow-x-auto">
        <div style={{ width: 160 + HOURS * 60 * PX_PER_MIN }} className="relative">
          {/* Time header */}
          <div className="flex h-8 border-b border-border bg-card sticky top-0">
            <div className="sticky left-0 z-10 w-40 shrink-0 bg-card border-r border-border" />
            <div className="relative flex-1">
              {slots.map((t) => (
                <span
                  key={t}
                  style={{ left: ((t - windowStart) / 60000) * PX_PER_MIN }}
                  className="absolute top-1/2 -translate-y-1/2 pl-1 text-[10px] font-medium text-muted-foreground border-l border-border/60 h-full flex items-center"
                >
                  {fmtTime(t)}
                </span>
              ))}
            </div>
          </div>

          {/* Now indicator */}
          <div
            style={{ left: 160 + nowLeft }}
            className="absolute top-0 bottom-0 w-px bg-fuchsia-500 z-20 pointer-events-none"
          />

          {channels.map((ch) => (
            <TimelineRow
              key={ch.url}
              channel={ch}
              programs={guide[(ch.tvg_id || '').toLowerCase()] || []}
              windowStart={windowStart}
              windowEnd={windowEnd}
              pxPerMin={PX_PER_MIN}
              nowTs={nowTs}
              onPlay={() => onPlay(ch)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}