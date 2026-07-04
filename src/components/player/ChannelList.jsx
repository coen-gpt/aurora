import React from 'react';
import { Star, Tv } from 'lucide-react';

export default function ChannelList({ channels, favorites, onToggleFav, onSelect, selectedUrl }) {
  if (channels.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No channels match your filters.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
      {channels.map((ch) => {
        const isFav = favorites.includes(ch.url);
        const isActive = ch.url === selectedUrl;
        return (
          <div
            key={ch.url}
            onClick={() => onSelect(ch)}
            className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
              isActive
                ? 'bg-primary/15 border-primary/40'
                : 'bg-card border-border hover:border-primary/30 hover:bg-secondary'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {ch.logo ? (
                <img src={ch.logo} alt="" className="w-full h-full object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <Tv className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{ch.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{ch.group}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFav(ch.url); }}
              className={`p-1.5 rounded-lg transition-colors ${isFav ? 'text-amber-400' : 'text-muted-foreground/40 hover:text-amber-400'}`}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}