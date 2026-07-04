import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getSubscription } from '@/lib/subscription';
import { PLANS } from '@/lib/plans';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { UserCircle, CreditCard, LogOut, Loader2, BadgeCheck } from 'lucide-react';

export default function Account() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalBusy, setPortalBusy] = useState(false);

  useEffect(() => {
    Promise.all([base44.auth.me(), getSubscription()]).then(([u, s]) => {
      setUser(u);
      setSub(s);
      setLoading(false);
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast({ title: 'Welcome aboard!', description: 'Your subscription is active. Enjoy Aurora.' });
    }
  }, [toast]);

  const openPortal = async () => {
    setPortalBusy(true);
    try {
      const res = await base44.functions.invoke('billingPortal', {
        returnUrl: window.location.origin + '/account',
      });
      window.location.href = res.data.url;
    } catch {
      toast({ title: 'No billing account yet', description: 'Subscribe to a plan first.', variant: 'destructive' });
      setPortalBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const plan = sub ? PLANS.find((p) => p.id === sub.plan_id) : null;
  const active = sub && ['active', 'trialing'].includes(sub.status);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
          <UserCircle className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold">{user?.full_name || 'My Account'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Subscription</p>
          {sub && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-secondary text-muted-foreground'
            }`}>
              <BadgeCheck className="w-3 h-3" /> {sub.status}
            </span>
          )}
        </div>
        {sub && plan ? (
          <div>
            <p className="font-display text-2xl font-bold text-primary">Aurora {plan.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Billed {sub.cycle}{sub.current_period_end ? ` · renews ${new Date(sub.current_period_end).toLocaleDateString()}` : ''}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active plan. Start a 7-day free trial to unlock everything.</p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          {sub ? (
            <Button onClick={openPortal} disabled={portalBusy}>
              {portalBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Manage billing
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link to="/pricing">{sub ? 'Change plan' : 'View plans'}</Link>
          </Button>
        </div>
      </div>

      <Button variant="ghost" className="text-muted-foreground" onClick={() => base44.auth.logout('/')}>
        <LogOut className="w-4 h-4" /> Log out
      </Button>
    </div>
  );
}