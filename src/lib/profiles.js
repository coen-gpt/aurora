import { load, save } from '@/lib/storage';
import { base44 } from '@/api/base44Client';

const LIST_KEY = 'aurora_profiles';
const ACTIVE_KEY = 'active_profile';

export const DEFAULT_PROFILE = { id: 'default', name: 'Main', color: '#8B5CF6' };

export const getProfiles = () => [DEFAULT_PROFILE, ...load(LIST_KEY, [])];

export const getActiveProfileId = () => load(ACTIVE_KEY, 'default');

export const getActiveProfile = () =>
  getProfiles().find((p) => p.id === getActiveProfileId()) || DEFAULT_PROFILE;

// Switching reloads so every page picks up the new profile's data.
export const setActiveProfile = (id) => {
  save(ACTIVE_KEY, id);
  window.location.reload();
};

export const addProfile = (name, color) => {
  const p = { id: Date.now().toString(36), name, color };
  save(LIST_KEY, [...load(LIST_KEY, []), p]);
  syncUp();
  return p;
};

export const removeProfile = (id) => {
  save(LIST_KEY, load(LIST_KEY, []).filter((p) => p.id !== id));
  syncUp();
  if (getActiveProfileId() === id) setActiveProfile('default');
};

// Household sharing: the profile list lives on the account so every device sees it.
export async function pullProfiles() {
  try {
    const me = await base44.auth.me();
    const byId = {};
    [...(me?.aurora_profiles || []), ...load(LIST_KEY, [])].forEach((p) => { byId[p.id] = p; });
    const merged = Object.values(byId);
    save(LIST_KEY, merged);
    return [DEFAULT_PROFILE, ...merged];
  } catch {
    return getProfiles();
  }
}

const syncUp = () => {
  base44.auth.updateMe({ aurora_profiles: load(LIST_KEY, []) }).catch(() => {});
};

// Profile-scoped storage key — the default profile keeps the original keys.
export const pKey = (key) => {
  const id = getActiveProfileId();
  return id === 'default' ? key : `${key}::${id}`;
};