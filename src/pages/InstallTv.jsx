import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay, Copy, Check, Globe, Download, Smartphone, ChevronLeft } from 'lucide-react';

const methodA = [
  { title: 'Open the Play Store on your box', desc: 'On your onn 4K Pro (or any Google TV / Android TV box), go to the Apps row and open Google Play.' },
  { title: 'Install a web browser', desc: 'Search for "TV Bro" — it\'s free and built for TV remotes. "Puffin TV" also works well.' },
  { title: 'Enter the Aurora address', desc: 'Open the browser and type the address shown below, exactly as written.' },
  { title: 'Set it as your home page', desc: 'In the browser settings, set Aurora as the home page or bookmark it so it opens in one click.' },
];

const methodB = [
  { title: 'Install "Downloader" from the Play Store', desc: 'The orange Downloader app (by AFTVnews) is the classic sideloading tool on Android TV boxes.' },
  { title: 'Allow the browser inside Downloader', desc: 'Open Downloader — if asked, allow it to display web content.' },
  { title: 'Enter the Aurora address', desc: 'Type the address below into Downloader\'s URL bar and press Go. Aurora loads right inside it.' },
  { title: 'Add to favorites', desc: 'Use Downloader\'s Favorites to save Aurora so it\'s always one click from your home screen.' },
];

function Steps({ steps }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-4">
          <span className="w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
          <div>
            <p className="font-medium text-sm">{s.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function InstallTv() {
  const [copied, setCopied] = useState(false);
  const tvUrl = `${window.location.origin}/tv`;

  const copy = async () => {
    await navigator.clipboard.writeText(tvUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/devices" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-3">
          <ChevronLeft className="w-3.5 h-3.5" /> Device Hub
        </Link>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <MonitorPlay className="w-5 h-5" />
          </span>
          Install Aurora on your TV box
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Works on the onn 4K Pro, Chromecast with Google TV, Fire TV, and any Android TV box. No APK files or developer settings needed — Aurora runs as a web app.
        </p>
      </div>

      {/* The address — shared by both methods */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-card border border-primary/25 p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Your Aurora TV address</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-border">
            <span className="font-mono text-sm md:text-lg text-primary truncate flex-1">{tvUrl}</span>
            <button onClick={copy} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shrink-0" title="Copy link">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&bgcolor=0d0a17&color=a78bfa&data=${encodeURIComponent(tvUrl)}`}
            alt="QR code for Aurora TV Mode"
            className="w-24 h-24 rounded-xl border border-border self-center sm:self-auto"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">Type this on your TV box. Scanning the QR with your phone opens TV Mode there instead — handy for pairing.</p>
      </div>

      {/* Method A */}
      <div className="rounded-2xl bg-card border border-border p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Method 1 — Web browser <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Recommended</span></h2>
            <p className="text-xs text-muted-foreground">Best experience, easiest to keep updated.</p>
          </div>
        </div>
        <Steps steps={methodA} />
      </div>

      {/* Method B */}
      <div className="rounded-2xl bg-card border border-border p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold">Method 2 — Downloader app</h2>
            <p className="text-xs text-muted-foreground">The classic sideloader route, if you already use Downloader.</p>
          </div>
        </div>
        <Steps steps={methodB} />
      </div>

      {/* After install */}
      <div className="rounded-2xl bg-card border border-border p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <h2 className="font-display font-semibold">After it's on your TV</h2>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
          <li>Aurora opens straight into <span className="text-foreground font-medium">TV Mode</span> with a 6-digit pairing code on screen.</li>
          <li>On your phone, open any channel in the Player and tap <span className="text-foreground font-medium">Send to TV</span>, then enter the code — the stream jumps to the big screen.</li>
          <li>Sign in with the same account on both devices to keep your Continue Watching row in sync.</li>
        </ul>
      </div>
    </div>
  );
}