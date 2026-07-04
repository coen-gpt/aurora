import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Play } from 'lucide-react';

export default function ChannelRow({ title, channels }) {
  const navigate = useNavigate();
  if (!channels || channels.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold tracking-tight px-4 md:px-8">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channels.map((ch) => (
          <button
            key={ch.url}
            onClick={() => navigate('/player', { state: { channel: ch } })}
            className="group shrink-0 w-40 text-left"
          >
            <div className="relative w-40 h-24 rounded-xl bg-card border border-border overflow-hidden flex items-center justify-center group-hover:border-primary/50 group-hover:scale-[1.04] transition-all duration-200">
              {ch.logo ? (
                <img src={ch.logo} alt="" className="max-w-[70%] max-h-[70%] object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <Tv className="w-6 h-6 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
            <p className="text-xs font-medium truncate mt-2">{ch.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{ch.group}</p>
          </button>
        ))}
      </div>
    </section>
  );
}