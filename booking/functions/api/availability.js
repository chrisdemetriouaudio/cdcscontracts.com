import { getUnavailableDates } from '../_lib/db.js';

const WINDOW_DAYS = 365;

// Public, unauthenticated by design (the booking form needs it before anyone
// logs in) - but only ever returns a flat list of unavailable dates, nothing
// about who booked them or why.
export async function onRequestGet({ env }) {
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + WINDOW_DAYS);
  const endDate = end.toISOString().slice(0, 10);

  const unavailableDates = await getUnavailableDates(env.DB, today, endDate);
  return new Response(JSON.stringify({ today, windowEnd: endDate, unavailableDates }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  });
}
