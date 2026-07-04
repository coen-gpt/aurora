// All user data (playlist URLs, devices, favorites) lives on-device only.
export const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};