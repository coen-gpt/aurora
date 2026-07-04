import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tv, Speaker, MonitorPlay, Lightbulb, Wifi, Check } from 'lucide-react';

const deviceTypes = [
  { type: 'tv', label: 'TV', icon: Tv, brands: ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense'] },
  { type: 'soundbar', label: 'Soundbar', icon: Speaker, brands: ['Sonos', 'Bose', 'Samsung', 'JBL', 'Vizio'] },
  { type: 'streaming', label: 'Streaming Device', icon: MonitorPlay, brands: ['Roku', 'Fire TV', 'Chromecast', 'Apple TV', 'Nvidia Shield'] },
  { type: 'light', label: 'Smart Light', icon: Lightbulb, brands: ['Philips Hue', 'LIFX', 'Govee', 'Nanoleaf', 'Wiz'] },
];

export default function PairingModal({ open, onClose, onPaired }) {
  const [step, setStep] = useState('type'); // type | scan | found | name
  const [selectedType, setSelectedType] = useState(null);
  const [found, setFound] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [room, setRoom] = useState('Living Room');

  useEffect(() => {
    if (!open) { setStep('type'); setSelectedType(null); setSelectedDevice(null); }
  }, [open]);

  useEffect(() => {
    if (step !== 'scan' || !selectedType) return;
    const timer = setTimeout(() => {
      const names = selectedType.brands.slice(0, 3).map(
        (b) => `${b} ${selectedType.label} ${Math.floor(Math.random() * 90 + 10)}`
      );
      setFound(names);
      setStep('found');
    }, 2200);
    return () => clearTimeout(timer);
  }, [step, selectedType]);

  const finish = () => {
    onPaired({
      id: Date.now().toString(36),
      name: selectedDevice,
      type: selectedType.type,
      room: room.trim() || 'Living Room',
      connected: true,
      on: true,
      brightness: 80,
      color: '#8B5CF6',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pair a device</DialogTitle>
          <DialogDescription>
            {step === 'type' && 'What kind of device are you pairing?'}
            {step === 'scan' && 'Searching your network for nearby devices…'}
            {step === 'found' && 'Select your device to pair.'}
            {step === 'name' && 'Almost done — which room is it in?'}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' && (
          <div className="grid grid-cols-2 gap-2">
            {deviceTypes.map((dt) => (
              <button
                key={dt.type}
                onClick={() => { setSelectedType(dt); setStep('scan'); }}
                className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <dt.icon className="w-7 h-7 text-primary" />
                <span className="text-sm font-medium">{dt.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 'scan' && (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground">Scanning…</p>
          </div>
        )}

        {step === 'found' && (
          <div className="space-y-2">
            {found.map((name) => (
              <button
                key={name}
                onClick={() => { setSelectedDevice(name); setStep('name'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left"
              >
                <selectedType.icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium flex-1">{name}</span>
                <Wifi className="w-4 h-4 text-emerald-400" />
              </button>
            ))}
          </div>
        )}

        {step === 'name' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">{selectedDevice}</span>
            </div>
            <Input placeholder="Room name" value={room} onChange={(e) => setRoom(e.target.value)} />
            <Button className="w-full" onClick={finish}>Finish Pairing</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}