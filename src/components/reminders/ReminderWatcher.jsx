import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReminders, removeReminders } from '@/lib/reminders';
import { fmtTime } from '@/lib/iptv';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

// Watches saved EPG reminders and fires a toast when a program is about to start.
export default function ReminderWatcher() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const all = getReminders();
      const stale = all.filter((r) => r.start < now - 10 * 60000);
      const due = all.filter((r) => r.start - now <= 2 * 60000 && r.start >= now - 10 * 60000);
      if (stale.length || due.length) removeReminders([...stale, ...due]);
      due.forEach((r) => {
        toast({
          title: `Starting soon: ${r.title}`,
          description: `${r.name} · ${fmtTime(r.start)}`,
          duration: 60000,
          action: (
            <ToastAction altText="Watch now" onClick={() => navigate('/player', { state: { channel: r } })}>
              Watch
            </ToastAction>
          ),
        });
      });
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  return null;
}