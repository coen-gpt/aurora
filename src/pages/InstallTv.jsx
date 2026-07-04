import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  Copy,
  Download,
  Gamepad2,
  Globe,
  MousePointerClick,
  PlugZap,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
  Wifi,
} from 'lucide-react';

const installPaths = [
  {
    id: 'mobile',
    label: 'Mobile ADB install',
    badge: 'Fastest',
    icon: Smartphone,
    tone: 'from-violet-500 to-fuchsia-500',
    summary: 'Use the Aurora mobile app to discover your Android TV box and push the TV companion install over ADB.',
    steps: [
      { title: 'Open Aurora on your phone', desc: 'Stay on the same Wi‑Fi network as your TV box, then open Device Hub → Install on TV.' },
      { title: 'Enable wireless debugging on the TV', desc: 'Android TV: Settings → System → Developer options → Wireless debugging. Keep the pairing screen open.' },
      { title: 'Tap Install TV Companion', desc: 'Aurora uses the Base44 install flow already wired into the mobile app to pair with ADB and install the companion.' },
      { title: 'Launch and pair', desc: 'Open Aurora TV Companion, enter the 6-digit TV code on your phone, and start sending channels to the big screen.' },
    ],
  },
  {
    id: 'browser',
    label: 'TV browser',
    badge: 'No setup',
    icon: Globe,
    tone: 'from-cyan-500 to-blue-500',
    summary: 'No developer settings or APK required. Open Aurora TV Mode in a TV-friendly browser and bookmark it.',
    steps: [
      { title: 'Install a TV browser', desc: 'On onn 4K Pro, Chromecast with Google TV, or Android TV, install TV Bro or another remote-friendly browser.' },
      { title: 'Open the TV address', desc: 'Type the TV address shown below exactly as written.' },
      { title: 'Bookmark Aurora', desc: 'Save it as a favorite or home page so it opens in one click next time.' },
    ],
  },
  {
    id: 'downloader',
    label: 'Downloader',
    badge: 'Fallback',
    icon: Download,
    tone: 'from-amber-500 to-orange-500',
    summary: 'A familiar route for Fire TV and Android TV users who already use the Downloader app.',
    steps: [
      { title: 'Install Downloader', desc: 'Get Downloader by AFTVnews from the Play Store or app store on your streaming box.' },
      { title: 'Enter the TV address', desc: 'Paste or type the Aurora TV address into Downloader’s URL field and press Go.' },
      { title: 'Save to favorites', desc: 'Add Aurora to Downloader favorites so TV Mode is always easy to relaunch.' },
    ],
  },
];

const benefits = [
  { icon: PlugZap, label: 'ADB companion install', desc: 'Mobile-led setup for Android TV boxes already supported by the Base44 flow.' },
  { icon: Wifi, label: 'Same-network pairing', desc: 'Clear handoff: phone and TV stay on the same Wi‑Fi for discovery and control.' },
  { icon: Gamepad2, label: 'Remote-first TV UI', desc: 'Large targets, simple pairing, and a lean TV Mode for couch navigation.' },
  { icon: ShieldCheck, label: 'Private by design', desc: 'Bring your own playlists; Aurora does not store stream files.' },
];

function StepCard({ step, index }) {
  return (
    <li className="group flex gap-4 rounded-2xl border border-border/70 bg-background/55 p-4 transition-all hover:border-primary/40 hover:bg-primary/5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary shadow-[0_0_24px_hsl(var(--primary)/0.18)]">
        {index + 1}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{step.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
      </div>
    </li>
  );
}

export default function InstallTv() {
  const [copied, setCopied] = useState(false);
  const [selectedPath, setSelectedPath] = useState('mobile');
  const [done, setDone] = useState([]);
  const tvUrl = `${window.location.origin}/tv`;
  const activePath = useMemo(() => installPaths.find((path) => path.id === selectedPath), [selectedPath]);

  const copy = async () => {
    await navigator.clipboard.writeText(tvUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDone = (item) => {
    setDone((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]));
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.24),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <Link to="/devices" className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
          <ChevronLeft className="h-3.5 w-3.5" /> Device Hub
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-primary/20 bg-card/75 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 p-6 md:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Production-ready setup
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                  Install Aurora on TV without friction.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  Pick the best path for your device: mobile ADB companion install, zero-install TV browser mode, or Downloader. Every route ends with the same simple pairing code and Send to TV experience.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit.label} className="rounded-2xl border border-border/70 bg-background/45 p-4">
                    <benefit.icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold">{benefit.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/70 bg-background/45 p-6 md:p-8 lg:border-l lg:border-t-0">
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 to-background p-5 shadow-[0_0_60px_hsl(var(--primary)/0.14)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">TV Mode address</p>
                    <p className="mt-1 text-xs text-muted-foreground">Use this for browser, Downloader, or quick pairing tests.</p>
                  </div>
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                  <span className="min-w-0 flex-1 truncate font-mono text-sm text-primary md:text-base">{tvUrl}</span>
                  <button onClick={copy} className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary" title="Copy TV address">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=0d0a17&color=a78bfa&data=${encodeURIComponent(tvUrl)}`}
                  alt="QR code for Aurora TV Mode"
                  className="mx-auto mt-5 h-44 w-44 rounded-3xl border border-border bg-background p-2"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            {installPaths.map((path) => (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                className={`w-full rounded-3xl border p-4 text-left transition-all ${selectedPath === path.id ? 'border-primary/50 bg-primary/10 shadow-[0_0_36px_hsl(var(--primary)/0.16)]' : 'border-border bg-card hover:border-primary/30'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${path.tone}`}>
                    <path.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold">{path.label}</p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{path.badge}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{path.summary}</p>
                  </div>
                  {selectedPath === path.id && <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Selected install path</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{activePath.label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activePath.summary}</p>
              </div>
              <MousePointerClick className="h-5 w-5 text-primary" />
            </div>
            <ol className="mt-5 space-y-3">
              {activePath.steps.map((step, index) => <StepCard key={step.title} step={step} index={index} />)}
            </ol>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Final quality checklist</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tap each item as you verify the TV companion experience.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Tv className="h-4 w-4" /> {done.length}/3 ready
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {['TV shows a 6-digit code', 'Phone can send a channel', 'Remote controls respond'].map((item) => (
              <button key={item} onClick={() => toggleDone(item)} className={`rounded-2xl border p-4 text-left text-sm font-medium transition-all ${done.includes(item) ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                <Check className="mb-3 h-4 w-4" /> {item}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
