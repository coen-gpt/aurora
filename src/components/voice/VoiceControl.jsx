import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { load, save } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';

// Parses a spoken phrase and triggers the matching simulated control.
// Returns { heard, action } or null when nothing matched.
function runCommand(text) {
  const t = text.toLowerCase();
  const devices = load('hub_devices', []);
  const lights = devices.filter((d) => d.type === 'light');
  const av = devices.find((d) => ['tv', 'soundbar', 'streaming'].includes(d.type) && d.connected)
    || devices.find((d) => ['tv', 'soundbar', 'streaming'].includes(d.type));

  const setLights = (patch) => {
    save('hub_devices', devices.map((d) => (d.type === 'light' ? { ...d, ...patch } : d)));
    return lights.length;
  };

  if (/lights?/.test(t)) {
    const pct = t.match(/(\d{1,3})\s*(%|percent)/);
    if (pct) {
      const v = Math.min(100, Math.max(1, parseInt(pct[1], 10)));
      const n = setLights({ on: true, brightness: v });
      return { action: `Set ${n} light${n === 1 ? '' : 's'} to ${v}% brightness` };
    }
    if (/\b(off|out)\b/.test(t)) return { action: `Turned off ${setLights({ on: false })} light${lights.length === 1 ? '' : 's'}` };
    if (/\bon\b/.test(t)) return { action: `Turned on ${setLights({ on: true })} light${lights.length === 1 ? '' : 's'}` };
    if (/dim/.test(t)) { setLights({ on: true, brightness: 25 }); return { action: 'Dimmed the lights to 25%' }; }
  }
  if (/dim/.test(t)) { setLights({ on: true, brightness: 25 }); return { action: 'Dimmed the lights to 25%' }; }

  const target = av ? av.name : 'TV';
  if (/volume\s*(up|louder)|turn (it |the volume )?up/.test(t)) return { action: `VOL + → ${target}` };
  if (/volume\s*(down|lower)|turn (it |the volume )?down/.test(t)) return { action: `VOL − → ${target}` };
  if (/unmute/.test(t)) return { action: `UNMUTE → ${target}` };
  if (/mute/.test(t)) return { action: `MUTE → ${target}` };
  if (/pause/.test(t)) return { action: `PAUSE → ${target}` };
  if (/\bplay\b|resume/.test(t)) return { action: `PLAY → ${target}` };
  if (/channel up|next channel/.test(t)) return { action: `CH + → ${target}` };
  if (/channel down|previous channel/.test(t)) return { action: `CH − → ${target}` };
  if (/power|turn (off|on) (the )?(tv|television)/.test(t)) return { action: `POWER → ${target}` };

  return null;
}

export default function VoiceControl() {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const { toast } = useToast();

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => () => recRef.current?.abort(), []);

  if (!SR) return null;

  const start = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = navigator.language || 'en-US';
    rec.onresult = (e) => {
      const heard = e.results[0][0].transcript.trim();
      const result = runCommand(heard);
      if (result) {
        toast({ title: `"${heard}"`, description: `✓ ${result.action}` });
      } else {
        toast({ title: `"${heard}"`, description: 'Try "volume up", "turn off the lights", or "lights 50%".' });
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <button
      onClick={start}
      title={listening ? 'Listening… tap to stop' : 'Voice commands — "volume up", "turn off lights"'}
      className={`p-2.5 rounded-full transition-all ${
        listening
          ? 'bg-primary text-primary-foreground animate-pulse shadow-[0_0_20px_hsl(var(--primary)/0.6)]'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
      }`}
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}