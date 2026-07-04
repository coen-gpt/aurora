const STREAM_PROXY_PATH = '/functions/streamProxy';

export function getStreamProxyUrl(url) {
  return `${STREAM_PROXY_PATH}?url=${encodeURIComponent(url)}`;
}

export function isLikelyHls(url = '') {
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.m3u8') || clean.endsWith('.m3u') || url.toLowerCase().includes('m3u8');
}

export function isInsecureHttp(url = '') {
  return /^http:\/\//i.test(url);
}

export function buildStreamCandidates(url = '') {
  const proxied = getStreamProxyUrl(url);
  const forceProxy = isInsecureHttp(url) || isLikelyHls(url);
  const primary = forceProxy ? proxied : url;
  const fallback = primary === proxied ? url : proxied;

  return [
    { src: primary, proxied: primary === proxied },
    { src: fallback, proxied: fallback === proxied },
  ].filter((candidate, index, all) => candidate.src && all.findIndex((item) => item.src === candidate.src) === index);
}
