// Stripe webhook (optional): when STRIPE_WEBHOOK_SECRET is set, a signed
// checkout.session.completed event also marks the invoice paid, even if the visitor
// never comes back to the invoice page. Unsigned or forged requests are refused.
import { verifyWebhook } from '../../_lib/stripe.js';
import { markBookingPaid } from '../../_lib/db.js';

export async function onRequestPost({ request, env }) {
  const payload = await request.text();
  if (!(await verifyWebhook(env, payload, request.headers.get('Stripe-Signature')))) {
    return new Response('Invalid signature', { status: 400 });
  }
  const event = JSON.parse(payload);
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    if (s.payment_status === 'paid' && s.client_reference_id) {
      await markBookingPaid(env.DB, s.client_reference_id, { amountPence: s.amount_total, paymentRef: s.payment_intent || s.id });
    }
  }
  return new Response('ok');
}
