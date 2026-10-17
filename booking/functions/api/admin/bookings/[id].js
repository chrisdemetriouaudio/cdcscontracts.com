import { getBookingById, listNotificationsForBooking, updateBookingIfStatus, getClientHistoryByEmail } from '../../../_lib/db.js';
import { approveBooking, proposeBooking, declineBooking, cancelBooking } from '../../../_lib/actions.js';
import { nowIso } from '../../../_lib/dates.js';

export async function onRequestGet({ params, env }) {
  const booking = await getBookingById(env.DB, params.id);
  if (!booking) return json({ ok: false, error: 'Not found.' }, 404);
  const notifications = await listNotificationsForBooking(env.DB, booking.id);
  const clientHistory = await getClientHistoryByEmail(env.DB, booking.contact_email, booking.id);
  return json({ ok: true, booking, notifications, clientHistory });
}

export async function onRequestPatch({ request, params, env }) {
  const db = env.DB;
  const booking = await getBookingById(db, params.id);
  if (!booking) return json({ ok: false, error: 'Not found.' }, 404);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  const appUrl = env.APP_URL || new URL(request.url).origin;
  let result;

  switch (body.action) {
    case 'approve':
      if (booking.status !== 'pending') return json({ ok: false, error: `Already ${booking.status}.` }, 409);
      result = await approveBooking(env, db, booking, {
        startDate: body.start_date, endDate: body.end_date, startTime: body.start_time,
        dayRate: body.day_rate, agreedHours: body.agreed_hours,
      }, appUrl);
      break;
    case 'propose':
      if (booking.status !== 'pending') return json({ ok: false, error: `Already ${booking.status}.` }, 409);
      result = await proposeBooking(env, db, booking, {
        startDate: body.start_date, endDate: body.end_date, dayRate: body.day_rate, message: body.message,
      }, appUrl);
      break;
    case 'decline':
      if (!['pending', 'proposed'].includes(booking.status)) return json({ ok: false, error: `Already ${booking.status}.` }, 409);
      result = await declineBooking(env, db, booking, { reason: body.reason });
      break;
    case 'cancel':
      if (booking.status !== 'confirmed') return json({ ok: false, error: 'Only confirmed bookings can be cancelled.' }, 409);
      result = await cancelBooking(env, db, booking, { reason: body.reason });
      break;
    case 'notes':
      await db.prepare('UPDATE bookings SET owner_notes = ?, updated_at = ? WHERE id = ?')
        .bind(body.owner_notes || null, nowIso(), booking.id).run();
      result = { ok: true };
      break;
    default:
      return json({ ok: false, error: 'Unknown action.' }, 400);
  }

  if (!result.ok) return json(result, 409);
  const updated = await getBookingById(db, booking.id);
  return json({ ok: true, booking: updated });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
