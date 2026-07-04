import React, { useState, useEffect } from 'react';
import { load, save } from '@/lib/storage';
import PairingModal from '@/components/devices/PairingModal';
import InstallOnTv from '@/components/devices/InstallOnTv';
import UpgradePrompt from '@/components/devices/UpgradePrompt';
import { getSubscription, getDeviceLimit } from '@/lib/subscription';
import { PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tv, Speaker, MonitorPlay, Lightbulb, Plus, Trash2, Radio } from 'lucide-react';

const icons = { tv: Tv, soundbar: Speaker, streaming: MonitorPlay, light: Lightbulb };
const typeLabels = { tv: 'TV', soundbar: 'Soundbar', streaming: 'Streaming Device', light: 'Smart Light' };

export default function Devices() {
  const [devices, setDevices] = useState(() => load('hub_devices', []));
  const [pairing, setPairing] = useState(false);
  const [sub, setSub] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => { save('hub_devices', devices); }, [devices]);
  useEffect(() => { getSubscription().then(setSub); }, []);

  const limit = getDeviceLimit(sub);
  const planName = (sub && PLANS.find((p) => p.id === sub.plan_id)?.name) || 'Starter';
  const startPairing = () => {
    if (devices.length >= limit) setUpgradeOpen(true);
    else setPairing(true);
  };

  const toggleConnected = (id) =>
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d)));
  const removeDevice = (id) => setDevices((prev) => prev.filter((d) => d.id !== id));

  const rooms = [...new Set(devices.map((d) => d.room))];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Device Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pair and manage your home entertainment devices.
            {Number.isFinite(limit) && (
              <span className="ml-1 text-xs">({devices.length} of {limit} on your {planName} plan)</span>
            )}
          </p>
        </div>
        <Button onClick={startPairing}>
          <Plus className="w-4 h-4 mr-1.5" /> Pair Device
        </Button>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Radio className="w-8 h-8 text-primary" />
          </div>
          <p className="font-medium">No devices paired</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Pair your TV, soundbar, streaming device, or smart lights to control everything from one place.
          </p>
        </div>
      ) : (
        rooms.map((room) => (
          <div key={room} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{room}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {devices.filter((d) => d.room === room).map((d) => {
                const Icon = icons[d.type] || Radio;
                return (
                  <div key={d.id} className="group p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        d.connected ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Switch checked={d.connected} onCheckedChange={() => toggleConnected(d.id)} />
                    </div>
                    <p className="font-medium text-sm mt-3 truncate">{d.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[d.type]} · {d.connected ? 'Connected' : 'Offline'}
                      </p>
                      <button
                        onClick={() => removeDevice(d.id)}
                        className="p-1.5 rounded-lg text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <InstallOnTv />

      <PairingModal
        open={pairing}
        onClose={() => setPairing(false)}
        onPaired={(device) => setDevices((prev) => (prev.length >= limit ? prev : [...prev, device]))}
      />

      <UpgradePrompt open={upgradeOpen} onClose={() => setUpgradeOpen(false)} limit={limit} planName={planName} />
    </div>
  );
}