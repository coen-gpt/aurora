import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PricingTiers from '@/components/landing/PricingTiers';
import LandingFooter from '@/components/landing/LandingFooter';
import { Play, Tv, Radio, Lightbulb, Smartphone } from 'lucide-react';

const LOGO = 'https://media.base44.com/images/public/6a485551f0d60c9fa95dcd18/8f526db81_generated_image.png';

const features = [
  { icon: Tv, title: 'Streaming hub', desc: 'Playlists, live guide, and a cinematic player on every screen.' },
  { icon: Smartphone, title: 'Send to TV', desc: 'Pair your phone with any TV using a 6-digit code.' },
  { icon: Radio, title: 'Device control', desc: 'One remote for TVs, soundbars, and streaming boxes.' },
  { icon: Lightbulb, title: 'Smart lighting', desc: 'Scenes, schedules, and movie-night automation.' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2.5">
            <img src={LOGO} alt="Aurora" className="w-9 h-9 rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.4)]" />
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">AURORA</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/register" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all">
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/25 blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              One hub for every screen in your home
            </span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg mt-5 max-w-xl mx-auto">
            Stream your playlists, pair any TV, control your devices and lighting — all from a single beautiful app. 7-day free trial on every plan.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-[0_0_40px_hsl(var(--primary)/0.4)] transition-all">
              <Play className="w-4 h-4 fill-current" /> Start free trial
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-secondary border border-border text-sm font-semibold hover:border-primary/40 transition-all">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f) => (
            <div key={f.title} className="p-5 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">Simple pricing</h2>
        <PricingTiers onSelect={() => navigate('/register')} />
      </section>

      <LandingFooter />
    </div>
  );
}