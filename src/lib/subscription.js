import { base44 } from '@/api/base44Client';
import { PLANS } from '@/lib/plans';

// Device limit for a subscription; without an active plan you get the Starter limit.
export function getDeviceLimit(sub) {
  const active = sub && ['active', 'trialing'].includes(sub.status);
  const plan = active ? PLANS.find((p) => p.id === sub.plan_id) : null;
  return plan ? plan.deviceLimit : PLANS[0].deviceLimit;
}

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