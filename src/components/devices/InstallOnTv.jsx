import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay, Copy, Check, ChevronRight, Smartphone, Wifi, PlugZap } from 'lucide-react';

const steps = [
  { icon: Smartphone, text: 'Open Aurora on your phone, go to Device Hub, and choose Install on TV.' },
  { icon: Wifi, text: 'Keep your phone and Android TV box on the same Wi‑Fi network, then enable Wireless debugging on the TV.' },
  { icon: PlugZap, text: 'Use the Base44-powered mobile ADB flow to install the Aurora TV Companion, or fall back to TV Mode in a browser.' },
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
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-5 shadow-[0_0_42px_hsl(var(--primary)/0.12)] md:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <MonitorPlay className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Install Aurora TV Companion</h2>
              <p className="text-xs text-muted-foreground">Fast mobile ADB install for Android TV boxes, plus a browser fallback for every screen.</p>
            </div>
          </div>

          <ol className="grid gap-2.5">
            {steps.map((step, i) => (
              <li key={step.text} className="flex gap-3 rounded-2xl border border-border/70 bg-background/45 p-3 text-sm text-muted-foreground">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="leading-relaxed"><span className="font-semibold text-foreground">{i + 1}.</span> {step.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-3 rounded-3xl border border-border bg-background/55 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">TV Mode fallback</p>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
            <span className="min-w-0 flex-1 truncate font-mono text-sm text-primary md:text-base">{tvUrl}</span>
            <button onClick={copy} className="shrink-0 rounded-xl p-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary" title="Copy link">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&bgcolor=0d0a17&color=a78bfa&data=${encodeURIComponent(tvUrl)}`}
              alt="QR code to open Aurora TV Mode"
              className="h-20 w-20 rounded-2xl border border-border"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">Scan or copy when you want TV Mode without installing the companion app.</p>
          </div>
          <Link to="/install" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Open polished install guide <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
