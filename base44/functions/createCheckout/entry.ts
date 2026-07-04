import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17';

const PRICES = {
  starter: { monthly: 'price_1TpLLbCz5WUVCMLLHoZLbTdi', yearly: 'price_1TpLLbCz5WUVCMLLc7Uif9Xq' },
  family: { monthly: 'price_1TpLLbCz5WUVCMLLRuJzVcMq', yearly: 'price_1TpLLbCz5WUVCMLLWBjfTXkI' },
  pro: { monthly: 'price_1TpLLbCz5WUVCMLLBpc0R20x', yearly: 'price_1TpLLbCz5WUVCMLLEnDv3emT' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { planId, cycle, successUrl, cancelUrl } = await req.json();
    const priceId = PRICES[planId] && PRICES[planId][cycle];
    if (!priceId) return Response.json({ error: 'Unknown plan or cycle' }, { status: 400 });

    let email = undefined;
    try {
      const user = await base44.auth.me();
      if (user) email = user.email;
    } catch { /* anonymous checkout allowed */ }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      subscription_data: { trial_period_days: 7 },
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan_id: planId,
        cycle,
      },
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});