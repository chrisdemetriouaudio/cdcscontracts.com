import { rangesOverlap, resolveRange, nowIso } from './dates.js';

export async function insertBooking(db, booking) {
  const cols = Object.keys(booking);
  const placeholders = cols.map(() => '?').join(', ');
  const sql = `INSERT INTO bookings (${cols.join(', ')}) VALUES (${placeholders})`;
  await db.prepare(sql).bind(...cols.map((c) => booking[c])).run();
}

export async function getBookingByIdempotencyKey(db, key) {
  if (!key) return null;
  return db.prepare('SELECT * FROM bookings WHERE idempotency_key = ?').bind(key).first();
}

// Recognises a returning contractor by email without any login existing — used to
// flag "returning client" to the owner, never exposed to the contractor themselves.
export async function getClientHistoryByEmail(db, email, excludeId) {
  if (!email) return { confirmedCount: 0, totalCount: 0, lastRef: null };
  const { results } = await db.prepare(
    `SELECT ref, status, created_at FROM bookings
     WHERE lower(contact_email) = lower(?) AND id != ?
     ORDER BY created_at DESC`,
  ).bind(email, excludeId || '').all();
  const rows = results || [];
  const confirmed = rows.filter((r) => r.status === 'confirmed');
  return {
    confirmedCount: confirmed.length,
    totalCount: rows.length,
    lastRef: rows[0]?.ref || null,
  };
}

export async function getBookingById(db, id) {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
}

export async function getBookingByRef(db, ref) {
  return db.prepare('SELECT * FROM bookings WHERE ref = ?').bind(ref.toUpperCase()).first();
}

export async function getBookingByReviewTokenHash(db, hash) {
  return db.prepare(
    'SELECT * FROM bookings WHERE review_token_hash = ? AND review_token_expires > ?',
  ).bind(hash, nowIso()).first();
}

export async function getBookingByAcceptTokenHash(db, hash) {
  return db.prepare(
    'SELECT * FROM bookings WHERE accept_token_hash = ? AND accept_token_expires > ?',
  ).bind(hash, nowIso()).first();
}

export async function getBookingByCalendarTokenHash(db, hash) {
  return db.prepare('SELECT * FROM bookings WHERE calendar_token_hash = ?').bind(hash).first();
}

// Conditional update: only succeeds if the row is still in expectedStatus. Returns
// true if a row was actually changed, false if someone else already actioned it
// (double-click, two tabs, or a race between two review actions).
export async function updateBookingIfStatus(db, id, expectedStatus, fields) {
  const cols = Object.keys(fields);
  const setClause = cols.map((c) => `${c} = ?`).join(', ');
  const sql = `UPDATE bookings SET ${setClause}, updated_at = ? WHERE id = ? AND status = ?`;
  const res = await db.prepare(sql)
    .bind(...cols.map((c) => fields[c]), nowIso(), id, expectedStatus)
    .run();
  return (res.meta?.changes || 0) > 0;
}

export async function listConfirmedBookingsNear(db, startDate, endDate) {
  const { results } = await db.prepare(
    `SELECT * FROM bookings WHERE status = 'confirmed'
     AND confirmed_start_date <= ? AND confirmed_end_date >= ?`,
  ).bind(endDate, startDate).all();
  return results || [];
}

// True if approving/confirming this range would double-book a day already
// confirmed for someone else.
export async function hasConfirmedConflict(db, startDate, endDate, excludeId) {
  const rows = await listConfirmedBookingsNear(db, startDate, endDate);
  return rows.some((r) => r.id !== excludeId && rangesOverlap(startDate, endDate, r.confirmed_start_date, r.confirmed_end_date));
}

export async function listAvailabilityBlocksNear(db, startDate, endDate) {
  const { results } = await db.prepare(
    'SELECT * FROM availability_blocks WHERE start_date <= ? AND end_date >= ?',
  ).bind(endDate, startDate).all();
  return results || [];
}

export async function listWeeklyOffs(db) {
  const { results } = await db.prepare('SELECT * FROM weekly_offs ORDER BY weekday ASC').all();
  return results || [];
}

export async function setWeeklyOff(db, weekday, reason) {
  await db.prepare('INSERT OR REPLACE INTO weekly_offs (weekday, reason, created_at) VALUES (?, ?, ?)')
    .bind(weekday, reason || null, nowIso()).run();
}

export async function removeWeeklyOff(db, weekday) {
  await db.prepare('DELETE FROM weekly_offs WHERE weekday = ?').bind(weekday).run();
}

function rangeIncludesWeekday(startDate, endDate, weekdaySet) {
  if (!weekdaySet.size) return false;
  const d = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  while (d <= end) {
    if (weekdaySet.has(d.getUTCDay())) return true;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return false;
}

function eachDate(startDate, endDate, fn) {
  const d = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  while (d <= end) { fn(d.toISOString().slice(0, 10), d.getUTCDay()); d.setUTCDate(d.getUTCDate() + 1); }
}

// Public-safe: returns only which individual dates are unavailable in the given
// window - never contractor names, site details, or booking references. Used by
// the booking form's calendar so contractors can't even pick an already-busy day.
export async function getUnavailableDates(db, startDate, endDate) {
  const unavailable = new Set();
  const [confirmed, blocks, offs] = await Promise.all([
    listConfirmedBookingsNear(db, startDate, endDate),
    listAvailabilityBlocksNear(db, startDate, endDate),
    listWeeklyOffs(db),
  ]);
  const offWeekdays = new Set(offs.map((o) => o.weekday));
  confirmed.forEach((b) => eachDate(b.confirmed_start_date, b.confirmed_end_date, (d) => unavailable.add(d)));
  blocks.forEach((b) => eachDate(b.start_date, b.end_date, (d) => unavailable.add(d)));
  eachDate(startDate, endDate, (d, weekday) => { if (offWeekdays.has(weekday)) unavailable.add(d); });
  return [...unavailable].sort();
}

export async function hasBlockedConflict(db, startDate, endDate) {
  const rows = await listAvailabilityBlocksNear(db, startDate, endDate);
  if (rows.some((r) => rangesOverlap(startDate, endDate, r.start_date, r.end_date))) return true;
  const offs = await listWeeklyOffs(db);
  return rangeIncludesWeekday(startDate, endDate, new Set(offs.map((o) => o.weekday)));
}

// Any other booking (any status) whose requested/proposed/confirmed dates overlap -
// used to surface a soft warning to the owner, never to auto-reject.
export async function findOverlappingBookings(db, booking, excludeId) {
  const range = resolveRange(booking, { preferConfirmed: true });
  if (!range) return [];
  const { results } = await db.prepare(
    `SELECT id, ref, status, contact_name, company_name,
            req_start_date, req_end_date, req_duration,
            proposed_start_date, proposed_end_date,
            confirmed_start_date, confirmed_end_date
     FROM bookings WHERE id != ? AND status IN ('pending','proposed','confirmed')`,
  ).bind(excludeId).all();
  return (results || []).filter((r) => {
    const rr = resolveRange(r, { preferConfirmed: true });
    return rr && rangesOverlap(range.start, range.end, rr.start, rr.end);
  });
}

export async function listBookings(db, { status, search, limit = 100 } = {}) {
  let sql = 'SELECT * FROM bookings WHERE 1=1';
  const binds = [];
  if (status) {
    sql += ' AND status = ?';
    binds.push(status);
  }
  if (search) {
    sql += ` AND (ref LIKE ? OR company_name LIKE ? OR contact_name LIKE ?
             OR site_postcode LIKE ? OR site_address LIKE ?)`;
    const like = `%${search}%`;
    binds.push(like, like, like, like, like);
  }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);
  const { results } = await db.prepare(sql).bind(...binds).all();
  return results || [];
}

export async function countRecentSubmissions(db, ipHash, sinceIso) {
  const row = await db.prepare(
    'SELECT COUNT(*) AS n FROM submission_log WHERE ip_hash = ? AND created_at > ?',
  ).bind(ipHash, sinceIso).first();
  return row?.n || 0;
}

export async function logSubmission(db, ipHash) {
  await db.prepare('INSERT INTO submission_log (ip_hash, created_at) VALUES (?, ?)')
    .bind(ipHash, nowIso()).run();
}

export async function pruneOldSubmissionLog(db, olderThanIso) {
  await db.prepare('DELETE FROM submission_log WHERE created_at < ?').bind(olderThanIso).run();
}

export async function insertNotification(db, notif) {
  const cols = Object.keys(notif);
  const sql = `INSERT INTO notifications (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
  await db.prepare(sql).bind(...cols.map((c) => notif[c])).run();
}

export async function markNotification(db, id, status, lastError) {
  await db.prepare(
    'UPDATE notifications SET status = ?, last_error = ?, attempts = attempts + 1, updated_at = ? WHERE id = ?',
  ).bind(status, lastError || null, nowIso(), id).run();
}

export async function listFailedNotifications(db, limit = 25) {
  const { results } = await db.prepare(
    "SELECT * FROM notifications WHERE status = 'failed' AND attempts < 6 ORDER BY created_at ASC LIMIT ?",
  ).bind(limit).all();
  return results || [];
}

export async function listNotificationsForBooking(db, bookingId) {
  const { results } = await db.prepare(
    'SELECT * FROM notifications WHERE booking_id = ? ORDER BY created_at ASC',
  ).bind(bookingId).all();
  return results || [];
}

export async function listAvailabilityBlocks(db) {
  const { results } = await db.prepare(
    'SELECT * FROM availability_blocks WHERE end_date >= date("now") ORDER BY start_date ASC',
  ).all();
  return results || [];
}

export async function insertAvailabilityBlock(db, block) {
  const cols = Object.keys(block);
  await db.prepare(`INSERT INTO availability_blocks (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
    .bind(...cols.map((c) => block[c])).run();
}

export async function deleteAvailabilityBlock(db, id) {
  await db.prepare('DELETE FROM availability_blocks WHERE id = ?').bind(id).run();
}

export async function createAdminSession(db, tokenHash, ttlMs) {
  const now = new Date();
  await db.prepare('INSERT INTO admin_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)')
    .bind(tokenHash, now.toISOString(), new Date(now.getTime() + ttlMs).toISOString()).run();
}

export async function isAdminSessionValid(db, tokenHash) {
  const row = await db.prepare(
    'SELECT 1 FROM admin_sessions WHERE token_hash = ? AND expires_at > ?',
  ).bind(tokenHash, nowIso()).first();
  return !!row;
}

export async function deleteAdminSession(db, tokenHash) {
  await db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).run();
}

export async function pruneExpiredPending(db, olderThanIso) {
  await db.prepare(
    "UPDATE bookings SET status = 'expired', updated_at = ? WHERE status = 'pending' AND created_at < ?",
  ).bind(nowIso(), olderThanIso).run();
}
