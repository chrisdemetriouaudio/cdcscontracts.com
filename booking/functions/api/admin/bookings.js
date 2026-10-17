import { listBookings, pruneExpiredPending, pruneOldSubmissionLog } from '../../_lib/db.js';
import { retryFailedNotifications } from '../../_lib/notify.js';

const PENDING_EXPIRY_DAYS = 14;

export async function onRequestGet({ request, env }) {
  const db = env.DB;
  const url = new URL(request.url);

  // Lazy housekeeping: runs on every dashboard load, keeps stale pending requests
  // from silently reserving dates forever, and nudges failed notifications along.
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_DAYS * 86400000).toISOString();
  await pruneExpiredPending(db, cutoff);
  await pruneOldSubmissionLog(db, new Date(Date.now() - 86400000).toISOString());
  const retry = await retryFailedNotifications(env, db);

  const status = url.searchParams.get('status') || undefined;
  const search = url.searchParams.get('q') || undefined;
  const bookings = await listBookings(db, { status, search, limit: 200 });

  return json({ ok: true, bookings, retry });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
