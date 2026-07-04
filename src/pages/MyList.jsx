import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyList, toggleMyList } from '@/lib/mylist';
import { Bookmark, Play, Tv, Trash2 } from 'lucide-react';

export default function MyList() {
  const navigate = useNavigate();
  const [list, setList] = useState(getMyList);

  const remove = (item) => setList(toggleMyList(item));

  if (list.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-md mx-auto text-center py-24 space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bookmark className="w-8 h-8 text-primary" />
        </div>
        <p className="font-medium">Your list is empty</p>
        <p className="text-sm text-muted-foreground">Tap the bookmark icon on any channel or show to save it here for later.</p>
        <Link to="/player" className="inline-block text-sm text-primary font-medium hover:underline">Browse channels →</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">My List</h1>
        <p className="text-sm text-muted-foreground mt-1">{list.length} saved to watch later.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map((item) => (
          <div
            key={item.url}
            className="group relative rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-[0_8px_40px_hsl(var(--primary)/0.12)] overflow-hidden cursor-pointer transition-all duration-300"
            onClick={() => navigate('/player', { state: { channel: item } })}
          >
            <div className="aspect-video bg-gradient-to-br from-secondary via-secondary/60 to-background flex items-center justify-center relative">
              {item.logo ? (
                <img src={item.logo} alt="" className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <Tv className="w-8 h-8 text-muted-foreground/60" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.5)]">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-3 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.group && <p className="text-[11px] text-muted-foreground truncate">{item.group}</p>}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); remove(item); }}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}