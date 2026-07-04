import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { buildStreamCandidates, isLikelyHls } from '@/lib/stream-url';

export default function HoverPreview({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let hls;
    let cancelled = false;
    const [candidate] = buildStreamCandidates(url);
    if (!candidate) return;

    if ((isLikelyHls(url) || candidate.proxied) && Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 8, enableWorker: true, lowLatencyMode: true });
      hls.loadSource(candidate.src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal && !cancelled) hls.destroy();
      });
    } else {
      video.src = candidate.src;
      video.play().catch(() => {});
    }
    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      video.removeAttribute('src');
    };
  }, [url]);

  return <video ref={ref} muted playsInline className="aspect-video w-full bg-black object-cover" />;
}
