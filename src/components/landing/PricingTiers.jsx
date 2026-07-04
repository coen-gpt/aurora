import React, { useState } from 'react';
import { PLANS } from '@/lib/plans';
import { Check } from 'lucide-react';

export default function PricingTiers({ onSelect, currentPlanId, cta = 'Start free trial' }) {
  const [cycle, setCycle] = useState('monthly');

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-full bg-secondary border border-border">
          {['monthly', 'yearly'].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                cycle === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {c === 'monthly' ? 'Monthly' : 'Yearly'}
              {c === 'yearly' && <span className="ml-1.5 text-[10px] opacity-80">save ~17%</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative p-6 rounded-2xl bg-card border flex flex-col ${
                plan.popular ? 'border-primary shadow-[0_0_40px_hsl(var(--primary)/0.15)]' : 'border-border'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                  Most popular
                </span>
              )}
              <p className="font-display font-bold text-lg">{plan.name}</p>
              <p className="text-xs text-muted-foreground">{plan.tagline}</p>
              <p className="mt-4">
                <span className="font-display text-4xl font-bold">${cycle === 'monthly' ? plan.monthly : plan.yearly}</span>
                <span className="text-sm text-muted-foreground">/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
              </p>
              <ul className="mt-5 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelect(plan, cycle)}
                disabled={isCurrent}
                className={`mt-6 w-full py-2.5 rounded-full text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'bg-secondary text-muted-foreground cursor-default'
                    : plan.popular
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-secondary border border-border hover:border-primary/40'
                }`}
              >
                {isCurrent ? 'Current plan' : cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}