import { hashToken } from '../../../_lib/crypto.js';
import { getBookingByReviewTokenHash } from '../../../_lib/db.js';
import { proposeBooking } from '../../../_lib/actions.js';
import { pageShell } from '../../../_lib/render.js';

export async function onRequestPost({ request, params, env }) {
  const db = env.DB;
  const hash = await hashToken(params.token);
  const booking = await getBookingByReviewTokenHash(db, hash);
  if (!booking) return errorPage('This link has expired or was already used.', 404);
  if (booking.status !== 'pending') return errorPage(`Reference ${booking.ref} is already ${booking.status}.`);

  const form = await request.formData();
  const appUrl = env.APP_URL || new URL(request.url).origin;
  const result = await proposeBooking(env, db, booking, {
    startDate: form.get('proposed_start_date'),
    endDate: form.get('proposed_end_date'),
    dayRate: form.get('proposed_day_rate'),
    message: form.get('proposed_message'),
  }, appUrl);

  if (!result.ok) return errorPage(result.error);

  return html(pageShell('Proposal sent', `<div class="panel done">
    <h1>${booking.ref} &mdash; proposal sent ✓</h1>
    <p>The contractor has been emailed a secure link to accept. The booking stays as
    "proposed" and won't block other dates until they accept.</p>
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
