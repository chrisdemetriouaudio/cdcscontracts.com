// Stripe in TEST MODE ONLY. This is a demo: any live key is refused, so no real
// money can ever be taken. Uses Stripe's REST API directly (no SDK needed).
const API = 'https://api.stripe.com/v1';

export function stripeReady(env) {
  return typeof env.STRIPE_SECRET_KEY === 'string' && env.STRIPE_SECRET_KEY.startsWith('sk_test_');
}

async function stripe(env, method, path, form) {
  if (!stripeReady(env)) throw new Error('Stripe test key missing (or not a test key).');
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.error && data.error.message) || `Stripe ${res.status}`);
  return data;
}

/** A hosted Stripe Checkout page for one fixed amount. */
export function createCheckoutSession(env, { amountPence, description, bookingId, ref, email, successUrl, cancelUrl }) {
  return stripe(env, 'POST', '/checkout/sessions', {
    mode: 'payment',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'gbp',
    'line_items[0][price_data][unit_amount]': String(amountPence),
    'line_items[0][price_data][product_data][name]': description,
    client_reference_id: bookingId,
    'metadata[booking_id]': bookingId,
    'metadata[ref]': ref,
    'payment_intent_data[metadata][booking_id]': bookingId,
    ...(email ? { customer_email: email } : {}),
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export function getCheckoutSession(env, id) {
  return stripe(env, 'GET', `/checkout/sessions/${encodeURIComponent(id)}`);
}

/** Verify a webhook's Stripe-Signature header (HMAC-SHA256 of "t.payload"). */
export async function verifyWebhook(env, payload, header, toleranceSec = 300) {
  if (!env.STRIPE_WEBHOOK_SECRET || !header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')).filter((p) => p.length === 2).map(([k, v]) => [k.trim(), v]));
  const t = Number(parts.t);
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return sigs.some((s) => s.length === expected.length && timingSafeEqual(s, expected));
}

function timingSafeEqual(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
