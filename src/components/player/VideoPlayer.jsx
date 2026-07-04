import React, { useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Cast, X, Loader2, PictureInPicture2, RotateCcw, Maximize2, Minimize2, GripHorizontal } from 'lucide-react';
import { nowNext } from '@/lib/iptv';
import { buildStreamCandidates, isLikelyHls } from '@/lib/stream-url';

const PLAYBACK_ERROR = 'This stream could not be played. Try the proxy, reload, or choose another channel if the provider is offline.';

export default function VideoPlayer({ channel, guide = {}, onClose }) {
  const videoRef = useRef(null);
  const shellRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [fitMode, setFitMode] = useState('contain');
  const [compact, setCompact] = useState(false);
  const playbackAttempts = useMemo(() => {
    const baseCandidates = buildStreamCandidates(channel?.url);
    const hls = isLikelyHls(channel?.url);
    return baseCandidates.flatMap((candidate) => {
      if (hls) return [{ ...candidate, mode: 'hls' }];
      return candidate.proxied
        ? [{ ...candidate, mode: 'native' }, { ...candidate, mode: 'hls' }]
        : [{ ...candidate, mode: 'native' }];
    });
  }, [channel?.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel || playbackAttempts.length === 0) return;

    let hls;
    let settled = false;
    let failTimer;
    let cancelled = false;
    const candidate = playbackAttempts[attempt % playbackAttempts.length];
    const shouldUseHls = candidate.mode === 'hls';

    const cleanup = () => {
      window.clearTimeout(failTimer);
      video.removeAttribute('src');
      video.load();
      if (hls) hls.destroy();
    };

    const fail = () => {
      if (cancelled) return;
      cleanup();
      const hasAnotherCandidate = playbackAttempts.length > 1 && attempt < playbackAttempts.length - 1;
      if (hasAnotherCandidate) {
        setAttempt((value) => value + 1);
        return;
      }
      setLoading(false);
      setError(PLAYBACK_ERROR);
    };

    const onPlaying = () => {
      settled = true;
      setLoading(false);
      setError(null);
      window.clearTimeout(failTimer);
    };

    const onCanPlay = () => {
      settled = true;
      setLoading(false);
      setError(null);
      window.clearTimeout(failTimer);
      video.play().catch(() => {});
    };

    setError(null);
    setLoading(true);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', fail);
    failTimer = window.setTimeout(() => {
      if (!settled) fail();
    }, 12000);

    if (shouldUseHls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 45,
        maxBufferLength: 20,
        manifestLoadingTimeOut: 9000,
        fragLoadingTimeOut: 12000,
      });
      hls.loadSource(candidate.src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !cancelled) {
          hls.startLoad();
          return;
        }
        fail();
      });
    } else {
      video.src = candidate.src;
      video.load();
      video.play().catch(() => {});
    }

    return () => {
      cancelled = true;
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', fail);
      cleanup();
    };
  }, [attempt, playbackAttempts, channel]);

  useEffect(() => {
    setAttempt(0);
  }, [channel?.url]);

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

  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((value) => value + 1);
  };

  const { now } = nowNext(guide, channel);

  return (
    <div
      ref={shellRef}
      className={`group relative overflow-hidden rounded-2xl bg-black shadow-[0_0_60px_hsl(var(--primary)/0.2)] ring-1 ring-border ${compact ? 'h-[42vh] min-h-[280px]' : 'aspect-video min-h-[260px]'} resize-y md:resize overflow-auto`}
      style={{ maxHeight: '82vh' }}
    >
      <video ref={videoRef} controls playsInline className={`h-full min-h-[260px] w-full bg-black ${fitMode === 'cover' ? 'object-cover' : 'object-contain'}` } />
      {loading && !error && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs text-white/70">Opening stream{playbackAttempts[attempt % playbackAttempts.length]?.proxied ? ' through secure proxy' : ''}…</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 p-6">
          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
            <p className="text-sm font-medium text-white">Stream playback needs a retry</p>
            <p className="mt-2 text-sm text-white/65">{error}</p>
            <button onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-95">
              <RotateCcw className="h-4 w-4" /> Reload stream
            </button>
          </div>
        </div>
      )}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
        <span className="max-w-[58%] truncate rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          {channel.name}{now ? ` · ${now.title}` : ''}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setFitMode((mode) => (mode === 'contain' ? 'cover' : 'contain'))} className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-primary" title="Toggle video fit">
            {fitMode === 'contain' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button onClick={retry} className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-primary" title="Reload stream">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={() => setCompact((value) => !value)} className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-primary" title="Toggle compact player">
            <GripHorizontal className="h-4 w-4" />
          </button>
          <button onClick={handlePiP} className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-primary" title="Picture-in-picture">
            <PictureInPicture2 className="h-4 w-4" />
          </button>
          <button onClick={handleCast} className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-primary" title="Cast to device">
            <Cast className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-destructive" title="Close player">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-full bg-black/55 px-3 py-1 text-[11px] text-white/70 backdrop-blur md:block">
        Drag the corner to resize
      </div>
    </div>
  );
}
