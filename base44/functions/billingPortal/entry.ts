import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { returnUrl } = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const subs = await base44.asServiceRole.entities.Subscription.filter(
      { user_email: user.email.toLowerCase() },
      '-updated_date',
      1
    );
    let customerId = subs[0] ? subs[0].stripe_customer_id : null;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0] ? customers.data[0].id : null;
    }
    if (!customerId) return Response.json({ error: 'No billing account found' }, { status: 404 });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('billingPortal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});