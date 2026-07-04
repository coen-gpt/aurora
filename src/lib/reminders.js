import { load, save } from '@/lib/storage';

const KEY = 'epg_reminders';

export const getReminders = () => load(KEY, []);

export const isReminded = (list, channelUrl, start) =>
  list.some((r) => r.url === channelUrl && r.start === start);

// Toggle a reminder for a program; returns the new list.
export function toggleReminder(channel, program) {
  const list = getReminders();
  const next = isReminded(list, channel.url, program.start)
    ? list.filter((r) => !(r.url === channel.url && r.start === program.start))
    : [...list, {
        url: channel.url,
        name: channel.name,
        logo: channel.logo || '',
        group: channel.group || '',
        title: program.title,
        start: program.start,
      }];
  save(KEY, next);
  return next;
}

export function removeReminders(items) {
  const keys = new Set(items.map((r) => r.url + r.start));
  save(KEY, getReminders().filter((r) => !keys.has(r.url + r.start)));
}