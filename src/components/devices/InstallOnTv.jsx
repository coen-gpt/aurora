import React, { useState } from 'react';
import { MonitorPlay, Copy, Check } from 'lucide-react';

const steps = [
  'On your streaming box (onn 4K Pro, Chromecast, or any Google TV), open the Play Store and install any web browser — "TV Bro" is free and works great with a remote.',
  'Open the browser and type in the address below exactly as shown.',
  'Once Aurora loads, open "TV Mode" and bookmark the page (or set it as your browser home) so it\'s one click away next time.',
];

export default function InstallOnTv() {
  const [copied, setCopied] = useState(false);
  const url = window.location.origin;
  const tvUrl = `${url}/tv`;

  const copy = async () => {
    await navigator.clipboard.writeText(tvUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-card to-card/40 border border-border p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <MonitorPlay className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-semibold">Get Aurora on your TV box</h2>
          <p className="text-xs text-muted-foreground">Works on onn 4K Pro, Chromecast with Google TV, and any Android TV box — no side-loading tools needed.</p>
        </div>
      </div>

      <ol className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
          <span className="font-mono text-sm md:text-base text-primary truncate flex-1">{tvUrl}</span>
          <button onClick={copy} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shrink-0" title="Copy link">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&bgcolor=0d0a17&color=a78bfa&data=${encodeURIComponent(tvUrl)}`}
          alt="QR code to open Aurora TV Mode"
          className="w-24 h-24 rounded-xl border border-border self-center sm:self-auto"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">Tip: the QR code opens TV Mode on your phone — pair it with the code on your TV screen to send channels straight to the big screen.</p>
    </div>
  );
}