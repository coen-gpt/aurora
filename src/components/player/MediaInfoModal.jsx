import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { nowNext } from '@/lib/iptv';
import { Loader2, Star, Popcorn, Youtube, Clapperboard, Sparkles } from 'lucide-react';

export default function MediaInfoModal({ channel, guide = {}, onClose }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { now } = nowNext(guide, channel);
  const lookupTitle = now?.title || channel.name;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setInfo(null);
    base44.functions
      .invoke('fetchMediaInfo', { title: lookupTitle })
      .then((res) => {
        if (cancelled) return;
        if (res.data.error) setError(res.data.error);
        else setInfo(res.data);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lookupTitle]);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Searching open sources for "{lookupTitle}"…</p>
          </div>
        )}
        {error && !loading && <p className="text-sm text-destructive py-8 text-center">{error}</p>}
        {info && !loading && (
          <div className="space-y-5">
            <div className="flex gap-5">
              {info.poster ? (
                <img src={info.poster} alt={info.title} className="w-32 md:w-40 rounded-xl shadow-2xl ring-1 ring-border shrink-0 self-start" />
              ) : (
                <div className="w-32 md:w-40 aspect-[2/3] rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Clapperboard className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 space-y-3">
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold leading-tight">{info.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[info.year, ...(info.genres || [])].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {info.imdb && (
                    <Badge className="bg-amber-400/15 text-amber-400 border border-amber-400/30 hover:bg-amber-400/15">
                      <Star className="w-3 h-3 mr-1 fill-current" /> IMDb {info.imdb}
                    </Badge>
                  )}
                  {info.rotten_tomatoes && (
                    <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/15">
                      <Popcorn className="w-3 h-3 mr-1" /> {info.rotten_tomatoes}
                    </Badge>
                  )}
                </div>
                {info.overview && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{info.overview}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <a href={info.trailer_url} target="_blank" rel="noreferrer">
                      <Youtube className="w-4 h-4 mr-1.5" /> Watch Trailer
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {info.preview_url && (
              <video src={info.preview_url} controls className="w-full rounded-xl bg-black aspect-video" />
            )}

            {info.cast?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Cast</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {info.cast.map((c, i) => (
                    <div key={i} className="w-20 shrink-0 text-center">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-16 h-16 mx-auto rounded-full object-cover ring-1 ring-border" />
                      ) : (
                        <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center text-lg font-semibold text-muted-foreground">
                          {c.name?.[0] || '?'}
                        </div>
                      )}
                      <p className="text-[11px] font-medium mt-1.5 leading-tight">{c.name}</p>
                      {c.character && <p className="text-[10px] text-muted-foreground leading-tight truncate">{c.character}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {info.facts?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Did you know?
                </h3>
                <ul className="space-y-2">
                  {info.facts.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary/40">{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}