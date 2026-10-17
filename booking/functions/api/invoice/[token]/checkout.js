// "Pay now": create a Stripe Checkout session (test mode) for the invoice's amount
// and send the browser to Stripe's hosted payment page.
import { hashToken } from '../../../_lib/crypto.js';
import { getBookingByInvoiceTokenHash } from '../../../_lib/db.js';
import { computeInvoice } from '../../../_lib/invoice.js';
import { createCheckoutSession, stripeReady } from '../../../_lib/stripe.js';

export async function onRequestPost({ params, env }) {
  const booking = await getBookingByInvoiceTokenHash(env.DB, await hashToken(params.token));
  if (!booking) return new Response('Invoice not found.', { status: 404 });
  const back = `${env.APP_URL}/invoice/${params.token}`;
  if (booking.paid_at) return Response.redirect(back, 303);
  if (!stripeReady(env)) return new Response('Online payment is not switched on.', { status: 503 });

  const inv = computeInvoice(booking, env);
  try {
    const session = await createCheckoutSession(env, {
      amountPence: inv.payablePence,
      description: `Invoice ${booking.ref}: ${inv.days} day${inv.days === 1 ? '' : 's'} labour, after CIS (demo)`,
      bookingId: booking.id,
      ref: booking.ref,
      email: booking.contact_email,
      successUrl: `${back}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${back}?cancelled=1`,
    });
    return Response.redirect(session.url, 303);
  } catch (e) {
    console.error(JSON.stringify({ stripe: 'checkout_failed', error: e.message }));
    return new Response('Could not start the payment. Please try again in a moment.', { status: 502 });
  }
}
