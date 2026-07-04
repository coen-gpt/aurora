import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Cast, X, Loader2, PictureInPicture2 } from 'lucide-react';
import { nowNext } from '@/lib/iptv';

export default function VideoPlayer({ channel, guide = {}, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;
    setError(null);
    setLoading(true);
    let hls;

    const onPlaying = () => setLoading(false);
    video.addEventListener('playing', onPlaying);

    // http:// streams are blocked on an https app (mixed content) and many IPTV
    // servers block browsers with CORS — relay those through our backend.
    const proxied = `/functions/streamProxy?url=${encodeURIComponent(channel.url)}`;
    const mustProxy = channel.url.startsWith('http:');

    if (Hls.isSupported()) {
      const start = (src, allowFallback) => {
        hls = new Hls({ maxBufferLength: 30 });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          hls.destroy();
          if (allowFallback) {
            start(proxied, false);
          } else {
            setLoading(false);
            setError('This stream could not be played. It may be offline or geo-restricted.');
          }
        });
      };
      start(mustProxy ? proxied : channel.url, !mustProxy);
    } else {
      let triedProxy = mustProxy;
      video.src = mustProxy ? proxied : channel.url;
      video.play().catch(() => {});
      video.onerror = () => {
        if (!triedProxy) {
          triedProxy = true;
          video.src = proxied;
          video.play().catch(() => {});
          return;
        }
        setLoading(false);
        setError('This stream could not be played on this device.');
      };
    }

    return () => {
      video.removeEventListener('playing', onPlaying);
      if (hls) hls.destroy();
      video.removeAttribute('src');
    };
  }, [channel]);

  const handleCast = async () => {
    const video = videoRef.current;
    if (video?.remote) {
      try { await video.remote.prompt(); } catch { /* user dismissed */ }
    } else if (video?.webkitShowPlaybackTargetPicker) {
      video.webkitShowPlaybackTargetPicker();
    }
  };

  const handlePiP = async () => {
    const video = videoRef.current;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (video?.requestPictureInPicture) await video.requestPictureInPicture();
    } catch { /* not supported or blocked */ }
  };

  const { now } = nowNext(guide, channel);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-[0_0_60px_hsl(var(--primary)/0.2)] ring-1 ring-border">
      <video ref={videoRef} controls playsInline className="w-full h-full" />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
        </div>
      )}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
        <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-xs font-medium text-white truncate max-w-[60%]">
          {channel.name}{now ? ` · ${now.title}` : ''}
        </span>
        <div className="flex gap-2">
          <button onClick={handlePiP} className="p-2 rounded-full bg-black/60 backdrop-blur text-white hover:bg-primary transition-colors" title="Picture-in-picture">
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button onClick={handleCast} className="p-2 rounded-full bg-black/60 backdrop-blur text-white hover:bg-primary transition-colors" title="Cast to device">
            <Cast className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 rounded-full bg-black/60 backdrop-blur text-white hover:bg-destructive transition-colors" title="Close player">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}