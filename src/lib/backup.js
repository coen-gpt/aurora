import { load, save } from '@/lib/storage';

// Everything worth carrying to a new device, in one JSON file.
const BACKUP_KEYS = [
  'iptv_playlists',
  'iptv_active_playlist',
  'iptv_favorites',
  'my_list',
  'iptv_recent',
  'watch_stats',
  'light_scenes',
  'hub_devices',
];

export function exportBackup() {
  const data = { aurora_backup: 1, exported_at: new Date().toISOString() };
  BACKUP_KEYS.forEach((k) => {
    const v = load(k, null);
    if (v !== null) data[k] = v;
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aurora-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Returns the number of sections restored; throws on an invalid file.
export async function importBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.aurora_backup) throw new Error('Not an Aurora backup file');
  let restored = 0;
  BACKUP_KEYS.forEach((k) => {
    if (k in data) {
      save(k, data[k]);
      restored++;
    }
  });
  return restored;
}