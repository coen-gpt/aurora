import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { load, save } from '@/lib/storage';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tv, MonitorPlay, Radio, ChevronRight } from 'lucide-react';

const steps = [
  { icon: Tv, title: 'Add your first playlist', desc: 'Paste your M3U link or Xtream Codes login in the Player to load your channels.', to: '/player', cta: 'Open Player' },
  { icon: MonitorPlay, title: 'Put Aurora on your TV', desc: 'Follow the guided install for Android TV and Fire TV — or pair instantly with TV Mode.', to: '/install', cta: 'Install on TV' },
  { icon: Radio, title: 'Pair your devices', desc: 'Connect TVs, soundbars, and smart lights to control your whole setup from one place.', to: '/devices', cta: 'Pair Devices' },
];

export default function Onboarding() {
  const [open, setOpen] = useState(() => !load('aurora_onboarded', false));
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const finish = () => {
    save('aurora_onboarded', true);
    setOpen(false);
  };

  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          <div className="w-16 h-16 rounded-3xl bg-primary/15 flex items-center justify-center">
            <s.icon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Welcome to Aurora · Step {step + 1} of {steps.length}
            </p>
            <DialogTitle className="font-display text-xl font-bold mt-2">{s.title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-secondary'}`} />
            ))}
          </div>
          <div className="flex flex-col w-full gap-2 pt-2">
            <Button onClick={() => { finish(); navigate(s.to); }}>
              {s.cta} <ChevronRight className="w-4 h-4" />
            </Button>
            {last ? (
              <Button variant="ghost" onClick={finish}>Done</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={finish}>Skip tour</Button>
                <Button variant="outline" className="flex-1" onClick={() => setStep(step + 1)}>Next</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}