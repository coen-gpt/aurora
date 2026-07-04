import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17';

const PLAN_BY_PRICE = {
  'price_1TpLLbCz5WUVCMLLHoZLbTdi': ['starter', 'monthly'],
  'price_1TpLLbCz5WUVCMLLc7Uif9Xq': ['starter', 'yearly'],
  'price_1TpLLbCz5WUVCMLLRuJzVcMq': ['family', 'monthly'],
  'price_1TpLLbCz5WUVCMLLWBjfTXkI': ['family', 'yearly'],
  'price_1TpLLbCz5WUVCMLLBpc0R20x': ['pro', 'monthly'],
  'price_1TpLLbCz5WUVCMLLEnDv3emT': ['pro', 'yearly'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    const upsertSubscription = async (sub, email) => {
      const priceId = sub.items && sub.items.data[0] && sub.items.data[0].price ? sub.items.data[0].price.id : null;
      const mapped = PLAN_BY_PRICE[priceId] || [undefined, undefined];
      const data = {
        stripe_subscription_id: sub.id,
        stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        status: sub.status,
        plan_id: mapped[0],
        cycle: mapped[1],
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined,
      };
      if (email) data.user_email = email.toLowerCase();
      const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: sub.id });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, data);
      } else {
        await base44.asServiceRole.entities.Subscription.create(data);
      }
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const email = session.customer_details ? session.customer_details.email : null;
        await upsertSubscription(sub, email);
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await upsertSubscription(event.data.object, null);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});