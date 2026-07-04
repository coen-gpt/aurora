import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HoverPreview({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let hls;
    const proxied = `/functions/streamProxy?url=${encodeURIComponent(url)}`;
    const src = url.startsWith('http:') ? proxied : url;
    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 10 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      hls.on(Hls.Events.ERROR, (_e, data) => { if (data.fatal) hls.destroy(); });
    } else {
      video.src = src;
      video.play().catch(() => {});
    }
    return () => { if (hls) hls.destroy(); };
  }, [url]);

  return <video ref={ref} muted playsInline className="w-full aspect-video bg-black" />;
}