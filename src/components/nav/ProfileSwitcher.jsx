import React, { useState, useEffect } from 'react';
import { getProfiles, getActiveProfileId, setActiveProfile, addProfile, removeProfile, pullProfiles } from '@/lib/profiles';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Plus, Trash2 } from 'lucide-react';

const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

const Avatar = ({ profile, size = 'w-7 h-7' }) => (
  <span
    className={`${size} rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
    style={{ backgroundColor: profile.color }}
  >
    {profile.name.charAt(0).toUpperCase()}
  </span>
);

export default function ProfileSwitcher() {
  const [profiles, setProfiles] = useState(getProfiles);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[1]);
  const activeId = getActiveProfileId();
  const active = profiles.find((p) => p.id === activeId) || profiles[0];

  useEffect(() => { pullProfiles().then(setProfiles); }, []);

  const create = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const p = addProfile(name.trim(), color);
    setAddOpen(false);
    setActiveProfile(p.id);
  };

  const remove = (e, id) => {
    e.stopPropagation();
    removeProfile(id);
    setProfiles(getProfiles());
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all" aria-label="Switch profile">
          <Avatar profile={active} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Who's watching?</DropdownMenuLabel>
          {profiles.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => p.id !== activeId && setActiveProfile(p.id)} className="gap-2">
              <Avatar profile={p} size="w-6 h-6" />
              <span className="flex-1 truncate text-sm">{p.name}</span>
              {p.id === activeId && <Check className="w-4 h-4 text-primary" />}
              {p.id !== 'default' && p.id !== activeId && (
                <button onClick={(e) => remove(e, p.id)} className="p-1 rounded text-muted-foreground/50 hover:text-destructive" aria-label={`Delete ${p.name}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAddOpen(true)} className="gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New profile</DialogTitle>
            <DialogDescription>Each profile gets its own favorites, My List, watch history, and recommendations.</DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <Input autoFocus placeholder="Profile name, e.g. Kids" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-foreground scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim()}>Create & switch</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}