import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, ListVideo } from 'lucide-react';

export default function PlaylistManager({ playlists, activeId, onAdd, onRemove, onSelect }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onAdd(name.trim(), url.trim());
    setName(''); setUrl(''); setOpen(false);
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
          <ListVideo className="w-3.5 h-3.5" />
          {pl.name}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(pl.id); }}
            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="rounded-full h-8 text-xs" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Playlist
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add your playlist</DialogTitle>
            <DialogDescription>
              Paste a link to your own M3U playlist. StreamHub never hosts or stores stream content — your link stays on this device only.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <Input placeholder="Playlist name (e.g. My Channels)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="https://example.com/playlist.m3u" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button type="submit" className="w-full">Add Playlist</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}