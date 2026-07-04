import { base44 } from '@/api/base44Client';

export async function getSubscription() {
  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return null;
    const res = await base44.functions.invoke('mySubscription', {});
    return res.data.subscription;
  } catch {
    return null;
  }
}