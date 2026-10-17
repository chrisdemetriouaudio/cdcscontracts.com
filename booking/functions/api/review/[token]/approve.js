import { hashToken } from '../../../_lib/crypto.js';
import { getBookingByReviewTokenHash } from '../../../_lib/db.js';
import { approveBooking } from '../../../_lib/actions.js';
import { pageShell } from '../../../_lib/render.js';
import { formatDateShort } from '../../../_lib/dates.js';

export async function onRequestPost({ request, params, env }) {
  const db = env.DB;
  const hash = await hashToken(params.token);
  const booking = await getBookingByReviewTokenHash(db, hash);
  if (!booking) return errorPage('This link has expired or was already used.', 404);
  if (booking.status !== 'pending') return errorPage(`Reference ${booking.ref} is already ${booking.status}.`);

  const form = await request.formData();
  const appUrl = env.APP_URL || new URL(request.url).origin;
  const result = await approveBooking(env, db, booking, {
    startDate: form.get('start_date'),
    endDate: form.get('end_date'),
    startTime: form.get('start_time'),
    dayRate: form.get('day_rate'),
    agreedHours: form.get('agreed_hours'),
  }, appUrl);

  if (!result.ok) return errorPage(result.error);

  return html(pageShell('Confirmed', `<div class="panel done">
    <h1>${booking.ref} confirmed ✓</h1>
    <p>Confirmed for ${formatDateShort(result.startDate)}${result.endDate !== result.startDate ? ' – ' + formatDateShort(result.endDate) : ''}. The contractor has been emailed.</p>
    <p><a class="btn btn-approve" href="/admin/">Open dashboard</a></p></div>`));
}

function errorPage(message, status = 409) {
  return html(pageShell('Could not complete', `<div class="panel">
    <h1>Couldn't complete that action</h1><p>${message}</p>
    <p><a class="btn btn-propose" href="/admin/">Open dashboard</a></p></div>`), status);
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
