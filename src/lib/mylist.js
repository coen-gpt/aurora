import { load, save } from '@/lib/storage';

const KEY = 'my_list';

export const getMyList = () => load(KEY, []);

export const inMyList = (list, url) => list.some((i) => i.url === url);

// Toggles an item and returns the new list
export const toggleMyList = (item) => {
  const list = getMyList();
  const next = inMyList(list, item.url)
    ? list.filter((i) => i.url !== item.url)
    : [{ name: item.name, url: item.url, logo: item.logo, group: item.group, added: Date.now() }, ...list];
  save(KEY, next);
  return next;
};