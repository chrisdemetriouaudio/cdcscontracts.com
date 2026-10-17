import { hashToken } from '../../_lib/crypto.js';
import { getBookingByAcceptTokenHash } from '../../_lib/db.js';
import { approveBooking } from '../../_lib/actions.js';
import { formatDateShort } from '../../_lib/dates.js';
import { pageShell } from '../../_lib/render.js';
import { sendAndLog } from '../../_lib/notify.js';

export async function onRequestPost({ request, params, env }) {
  const db = env.DB;
  const hash = await hashToken(params.token);
  const booking = await getBookingByAcceptTokenHash(db, hash);
  if (!booking) return errorPage('This link has expired or was already used.', 404);
  if (booking.status !== 'proposed') return errorPage(`Reference ${booking.ref} is already ${booking.status}.`);

  const startDate = booking.proposed_start_date;
  const endDate = booking.proposed_end_date || startDate;
  const appUrl = env.APP_URL || new URL(request.url).origin;

  const result = await approveBooking(env, db, booking, {
    startDate, endDate,
    startTime: booking.req_start_time,
    dayRate: booking.proposed_day_rate_pence ? booking.proposed_day_rate_pence / 100 : null,
    agreedHours: null,
  }, appUrl);

  if (!result.ok) {
    await sendAndLog(env, db, {
      bookingId: booking.id, channel: 'whatsapp_owner',
      payload: { message: `Heads up: ${booking.ref} tried to accept ${startDate}-${endDate} but that's now unavailable. Needs a follow-up.` },
    });
    return errorPage(`Sorry — ${startDate} to ${endDate} was just taken by another confirmed booking. I've been notified and will follow up with alternative dates.`);
  }

  if (env.OWNER_EMAIL) {
    await sendAndLog(env, db, {
      bookingId: booking.id, channel: 'email_owner_review',
      payload: {
        to: env.OWNER_EMAIL, subject: `Accepted — ${booking.ref} is confirmed`,
        html: `<p>${booking.contact_name} accepted the proposed terms for <strong>${booking.ref}</strong>. Confirmed for ${formatDateShort(startDate)}${endDate !== startDate ? ' – ' + formatDateShort(endDate) : ''}.</p>`,
        text: `${booking.contact_name} accepted ${booking.ref}. Confirmed ${startDate} to ${endDate}.`,
      },
    });
  }

  return html(pageShell('Confirmed', `<div class="panel done">
    <h1>${booking.ref} confirmed ✓</h1>
    <p>Thanks — you're booked in. A confirmation email with the calendar file is on its way.</p></div>`));
}

function errorPage(message, status = 409) {
  return html(pageShell('Could not complete', `<div class="panel">
    <h1>Couldn't complete that action</h1><p>${message}</p></div>`), status);
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
