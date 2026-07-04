import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PricingTiers from '@/components/landing/PricingTiers';
import { getSubscription } from '@/lib/subscription';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function Pricing() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { getSubscription().then(setSub); }, []);

  const handleSelect = async (plan, cycle) => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      navigate('/register');
      return;
    }
    if (window.self !== window.top) {
      toast({
        title: 'Checkout works from your published app',
        description: 'Open the published app in its own tab to complete checkout.',
      });
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke('createCheckout', {
        planId: plan.id,
        cycle,
        successUrl: window.location.origin + '/account?checkout=success',
        cancelUrl: window.location.origin + '/pricing',
      });
      window.location.href = res.data.url;
    } catch {
      toast({ title: 'Checkout failed', description: 'Please try again.', variant: 'destructive' });
      setBusy(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight">Choose your plan</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">7-day free trial on every plan. Upgrade, downgrade, or cancel anytime.</p>
      </div>
      {busy && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Taking you to secure checkout…
        </div>
      )}
      <PricingTiers
        onSelect={handleSelect}
        currentPlanId={sub && sub.status !== 'canceled' ? sub.plan_id : undefined}
        cta={sub && sub.status !== 'canceled' ? 'Switch to this plan' : 'Start free trial'}
      />
    </div>
  );
}