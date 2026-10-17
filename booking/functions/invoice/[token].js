// The demo invoice for a booking: labour, CIS deduction, amount to pay, and a
// "Pay now" button that opens Stripe Checkout in TEST MODE. On return from Stripe
// the payment is checked with Stripe itself before the invoice is marked Paid.
import { hashToken } from '../_lib/crypto.js';
import { getBookingByInvoiceTokenHash, markBookingPaid } from '../_lib/db.js';
import { pageShell, fieldsList } from '../_lib/render.js';
import { formatDateShort } from '../_lib/dates.js';
import { SUPPORT_TYPES } from '../_lib/validate.js';
import { computeInvoice, money, CIS_RATE } from '../_lib/invoice.js';
import { getCheckoutSession, stripeReady } from '../_lib/stripe.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function onRequestGet({ params, env, request }) {
  const db = env.DB;
  let booking = await getBookingByInvoiceTokenHash(db, await hashToken(params.token));
  if (!booking) {
    return html(pageShell('Invoice not found', `<div class="card"><h1>This invoice link isn't valid</h1>
      <p class="msg">Check the link in your e-mail, or reply to it for a new one.</p></div>`), 404);
  }

  // Back from Stripe: confirm the payment with Stripe before believing it.
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  let note = '';
  if (sessionId && !booking.paid_at && stripeReady(env)) {
    try {
      const s = await getCheckoutSession(env, sessionId);
      if (s.payment_status === 'paid' && s.client_reference_id === booking.id) {
        await markBookingPaid(db, booking.id, { amountPence: s.amount_total, paymentRef: s.payment_intent || s.id });
        booking = await getBookingByInvoiceTokenHash(db, await hashToken(params.token));
      } else {
        note = `<div class="notice">That payment hasn't gone through. You can try again below.</div>`;
      }
    } catch {
      note = `<div class="notice">Couldn't check the payment with Stripe just now. Refresh this page in a moment.</div>`;
    }
  }
  if (url.searchParams.get('cancelled')) note = `<div class="notice">Payment cancelled. Nothing was charged.</div>`;

  const inv = computeInvoice(booking, env);
  const dates = inv.range
    ? (inv.range.end !== inv.range.start ? `${formatDateShort(inv.range.start)} – ${formatDateShort(inv.range.end)}` : formatDateShort(inv.range.start))
    : 'To be agreed';
  const paid = !!booking.paid_at;
  const status = paid
    ? `<span style="color:#7BD389;font-weight:700">Paid</span> &middot; ${money(booking.paid_amount_pence || inv.payablePence)}`
    : (inv.basis === 'confirmed' ? 'Confirmed booking &middot; unpaid' : 'Request (not yet confirmed) &middot; unpaid');

  const lines = `<table style="width:100%;border-collapse:collapse;margin:.4rem 0 1rem;font-size:.92rem">
    ${row(`Labour: ${inv.days} day${inv.days === 1 ? '' : 's'} &times; ${money(inv.ratePence)}${inv.usesDemoRate ? ' <span class="msg">(demo day rate)</span>' : ''}`, money(inv.labourPence))}
    ${row(`Less CIS deduction (${CIS_RATE * 100}%), paid by you to HMRC`, '&minus;' + money(inv.cisPence))}
    ${row('<strong>To pay now</strong>', `<strong>${money(inv.payablePence)}</strong>`, true)}
  </table>
  <p class="msg">Materials and consumables are invoiced separately, at cost. Keep the CIS amount for your monthly CIS return.</p>`;

  const pay = paid
    ? `<div class="notice" style="background:#E3F4E7;border-color:#2E7D46">Thank you: payment received (Stripe test mode, ref ${esc(booking.payment_ref || '')}).</div>`
    : stripeReady(env)
      ? `<form method="post" action="/api/invoice/${esc(params.token)}/checkout" class="row">
           <button class="btn btn-accept" type="submit">Pay ${money(inv.payablePence)} now</button>
         </form>
         <p class="msg"><strong>Test mode, no real money.</strong> Use Stripe's test card 4242 4242 4242 4242, any future expiry date, any 3-digit CVC and any postcode.</p>`
      : `<p class="msg">Online payment isn't switched on yet.</p>`;

  const body = `<div class="card">
    <h1>Invoice ${esc(booking.ref)}</h1>
    ${fieldsList([
      ['Status', status],
      ['Dates', dates],
      ['Support', esc(SUPPORT_TYPES[booking.support_type] || '')],
      ['Site', esc(booking.site_address || booking.site_postcode)],
      ['Billed to', esc(booking.company_name || booking.contact_name)],
    ])}
    ${lines}
  </div>
  <div class="panel">${note}${pay}
    <p class="msg">This is a demo of how invoicing and card payment would work. C D Construction Services is a demonstration business.</p>
  </div>`;
  return html(pageShell(`Invoice ${booking.ref}`, body));
}

function row(label, value, total) {
  const border = total ? 'border-top:1px solid rgba(255,255,255,.25);' : 'border-top:1px solid rgba(255,255,255,.08);';
  return `<tr><td style="padding:.5rem 0;${border}">${label}</td><td style="padding:.5rem 0;${border}text-align:right;white-space:nowrap">${value}</td></tr>`;
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
