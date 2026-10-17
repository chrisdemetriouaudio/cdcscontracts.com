import { hashToken } from '../../_lib/crypto.js';
import { getBookingById } from '../../_lib/db.js';
import { buildIcs } from '../../_lib/ics.js';

export async function onRequestGet({ params, request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('t');
  if (!token) return new Response('Missing token', { status: 400 });

  const booking = await getBookingById(env.DB, params.id);
  if (!booking || booking.status !== 'confirmed' || !booking.calendar_token_hash) {
    return new Response('Not found', { status: 404 });
  }
  const hash = await hashToken(token);
  if (hash !== booking.calendar_token_hash) return new Response('Not found', { status: 404 });

  const ics = buildIcs(booking);
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${booking.ref}.ics"`,
    },
  });
}
