import React, { useRef, useState } from 'react';
import { exportBackup, importBackup } from '@/lib/backup';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, Upload, Loader2 } from 'lucide-react';

export default function BackupRestore() {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const restored = await importBackup(file);
      toast({ title: 'Backup restored', description: `${restored} sections imported. Reloading…` });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast({ title: 'Import failed', description: 'That file is not a valid Aurora backup.', variant: 'destructive' });
      setImporting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
      <div>
        <p className="font-semibold">Backup & restore</p>
        <p className="text-sm text-muted-foreground mt-1">
          Export your playlists, favorites, My List, lighting scenes, and devices as one file — import it on a new device or after reinstalling.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={exportBackup}>
          <Download className="w-4 h-4" /> Export backup
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import backup
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
      </div>
    </div>
  );
}