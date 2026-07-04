import React, { useState, useRef } from 'react';
import { Star, Tv, Play, Info, Bookmark } from 'lucide-react';
import { nowNext } from '@/lib/iptv';
import { getMyList, toggleMyList, inMyList } from '@/lib/mylist';
import HoverPreview from '@/components/player/HoverPreview';

export default function ChannelList({ channels, favorites, onToggleFav, onSelect, onInfo, selectedUrl, guide = {} }) {
  const [hovered, setHovered] = useState(null);
  const [myList, setMyList] = useState(getMyList);
  const timer = useRef(null);

  const enter = (url) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHovered(url), 700);
  };
  const leave = () => {
    clearTimeout(timer.current);
    setHovered(null);
  };

  if (channels.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No channels match your filters.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
      {channels.map((ch) => {
        const isFav = favorites.includes(ch.url);
        const isActive = ch.url === selectedUrl;
        const { now } = nowNext(guide, ch);
        return (
          <div
            key={ch.url}
            onClick={() => onSelect(ch)}
            onMouseEnter={() => enter(ch.url)}
            onMouseLeave={leave}
            className={`relative group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
              isActive
                ? 'bg-primary/15 border-primary/40'
                : 'bg-card border-border hover:border-primary/30 hover:bg-secondary'
            }`}
          >
            {/* Hover live preview (desktop) */}
            {hovered === ch.url && (
              <div className="hidden md:block absolute bottom-full left-0 mb-2 z-30 w-64 rounded-xl overflow-hidden shadow-2xl ring-1 ring-primary/40 bg-black">
                <HoverPreview url={ch.url} />
                <p className="text-[11px] font-medium px-2.5 py-1.5 truncate bg-card">{ch.name}</p>
              </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {ch.logo ? (
                <img src={ch.logo} alt="" className="w-full h-full object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <Tv className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{ch.name}</p>
              {now ? (
                <p className="text-[11px] text-primary truncate flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current shrink-0" /> {now.title}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground truncate">{ch.group}</p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onInfo?.(ch); }}
              className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary transition-colors"
              title="Movie & show details"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMyList(toggleMyList(ch)); }}
              className={`p-1.5 rounded-lg transition-colors ${inMyList(myList, ch.url) ? 'text-primary' : 'text-muted-foreground/40 hover:text-primary'}`}
              title={inMyList(myList, ch.url) ? 'Remove from My List' : 'Save to My List'}
            >
              <Bookmark className={`w-4 h-4 ${inMyList(myList, ch.url) ? 'fill-current' : ''}`} />
            </button>
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