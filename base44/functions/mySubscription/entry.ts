import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const subs = await base44.asServiceRole.entities.Subscription.filter(
      { user_email: user.email.toLowerCase() },
      '-updated_date',
      1
    );
    return Response.json({ subscription: subs[0] || null });
  } catch (error) {
    console.error('mySubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});