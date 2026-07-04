import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EpgSettings from '@/components/player/EpgSettings';
import { Plus, Trash2, ListVideo, KeyRound, CalendarClock } from 'lucide-react';

export default function PlaylistManager({ playlists, activeId, onAdd, onRemove, onSelect, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [epgOpen, setEpgOpen] = useState(false);
  const [m3u, setM3u] = useState({ name: '', url: '' });
  const [xt, setXt] = useState({ name: '', server: '', username: '', password: '' });

  const active = playlists.find((p) => p.id === activeId);

  const addM3u = (e) => {
    e.preventDefault();
    if (!m3u.name.trim() || !m3u.url.trim()) return;
    onAdd({ type: 'm3u', name: m3u.name.trim(), url: m3u.url.trim() });
    setM3u({ name: '', url: '' });
    setOpen(false);
  };

  const addXtream = (e) => {
    e.preventDefault();
    if (!xt.name.trim() || !xt.server.trim() || !xt.username.trim() || !xt.password.trim()) return;
    onAdd({ type: 'xtream', name: xt.name.trim(), server: xt.server.trim(), username: xt.username.trim(), password: xt.password.trim() });
    setXt({ name: '', server: '', username: '', password: '' });
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {playlists.map((pl) => (
        <div
          key={pl.id}
          className={`group flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all ${
            pl.id === activeId
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-card border-border text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onSelect(pl.id)}
        >
          {pl.type === 'xtream' ? <KeyRound className="w-3.5 h-3.5" /> : <ListVideo className="w-3.5 h-3.5" />}
          {pl.name}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(pl.id); }}
            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      {active && (
        <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={() => setEpgOpen(true)}>
          <CalendarClock className="w-3.5 h-3.5 mr-1" /> EPG
        </Button>
      )}
      <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Source
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a source</DialogTitle>
            <DialogDescription>
              Connect your own provider. Aurora never hosts or stores stream content — your credentials stay on this device only.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="m3u">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="m3u">M3U Playlist</TabsTrigger>
              <TabsTrigger value="xtream">Xtream Codes</TabsTrigger>
            </TabsList>
            <TabsContent value="m3u">
              <form onSubmit={addM3u} className="space-y-3 pt-2">
                <Input placeholder="Playlist name" value={m3u.name} onChange={(e) => setM3u({ ...m3u, name: e.target.value })} />
                <Input placeholder="https://example.com/playlist.m3u" value={m3u.url} onChange={(e) => setM3u({ ...m3u, url: e.target.value })} />
                <Button type="submit" className="w-full">Add Playlist</Button>
              </form>
            </TabsContent>
            <TabsContent value="xtream">
              <form onSubmit={addXtream} className="space-y-3 pt-2">
                <Input placeholder="Source name (e.g. My Provider)" value={xt.name} onChange={(e) => setXt({ ...xt, name: e.target.value })} />
                <Input placeholder="Server URL (e.g. http://host:8080)" value={xt.server} onChange={(e) => setXt({ ...xt, server: e.target.value })} />
                <Input placeholder="Username" value={xt.username} onChange={(e) => setXt({ ...xt, username: e.target.value })} />
                <Input type="password" placeholder="Password" value={xt.password} onChange={(e) => setXt({ ...xt, password: e.target.value })} />
                <Button type="submit" className="w-full">Sign In & Load Channels</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {active && (
        <EpgSettings
          open={epgOpen}
          onClose={() => setEpgOpen(false)}
          playlist={active}
          onSave={(override) => onUpdate(active.id, { epg_override: override })}
        />
      )}
    </div>
  );
}