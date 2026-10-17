import { validateBookingPayload, SUPPORT_TYPES, DURATIONS, MATERIALS, whenLabel } from '../_lib/validate.js';
import { generateRef, nowIso, formatDateShort } from '../_lib/dates.js';
import { generateToken, hashToken, hashIp } from '../_lib/crypto.js';
import {
  insertBooking, getBookingByIdempotencyKey, getBookingByRef, findOverlappingBookings,
  countRecentSubmissions, logSubmission, getClientHistoryByEmail,
} from '../_lib/db.js';
import { sendAndLog } from '../_lib/notify.js';
import { verifyTurnstile } from '../_lib/auth.js';
import { contractorAckEmail, ownerReviewEmail } from '../_lib/email.js';

const REVIEW_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RATE_LIMIT_WINDOW_MIN = 10;
const RATE_LIMIT_MAX = 6;

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = await hashIp(ip, env.IP_HASH_SALT || 'cdcs-booking');

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, errors: { _form: 'Malformed request.' } }, 400);
  }

  if (body.idempotency_key) {
    const existing = await getBookingByIdempotencyKey(db, body.idempotency_key);
    if (existing) return json({ ok: true, ref: existing.ref, duplicate: true });
  }

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60000).toISOString();
  const recent = await countRecentSubmissions(db, ipHash, since);
  if (recent >= RATE_LIMIT_MAX) {
    return json({ ok: false, errors: { _form: 'Too many requests from this connection. Please try again shortly.' } }, 429);
  }

  const turnstileOk = await verifyTurnstile(env, body.turnstile_token, ip);
  if (!turnstileOk) {
    return json({ ok: false, errors: { _form: 'Spam check failed. Please retry the form.' } }, 400);
  }

  const { errors, value, ok } = validateBookingPayload(body);
  if (!ok) return json({ ok: false, errors }, 422);

  const id = crypto.randomUUID();
  const ref = await generateUniqueRef(db, value.company_name || value.contact_name);
  const reviewToken = generateToken();
  const reviewTokenHash = await hashToken(reviewToken);
  const now = nowIso();

  const booking = {
    id, ref, status: 'pending', created_at: now, updated_at: now,
    idempotency_key: body.idempotency_key || null,
    ...value,
    req_end_date: value.req_end_date,
    req_specific_dates: null,
    review_token_hash: reviewTokenHash,
    review_token_expires: new Date(Date.now() + REVIEW_TOKEN_TTL_MS).toISOString(),
    ip_hash: ipHash,
  };

  await insertBooking(db, booking);
  await logSubmission(db, ipHash);

  const overlaps = await findOverlappingBookings(db, booking, id);
  const clientHistory = await getClientHistoryByEmail(db, booking.contact_email, id);

  const summaryRows = [
    ['When', whenLabelFmt(booking)],
    ['Duration', DURATIONS[booking.req_duration]],
    ['Start time', booking.req_start_time === 'tba' ? 'To be agreed' : booking.req_start_time],
    ['Postcode', booking.site_postcode],
    ['Support needed', SUPPORT_TYPES[booking.support_type]],
    ['Description', booking.work_description],
    ['Contact', `${booking.contact_name}${booking.company_name ? ' — ' + booking.company_name : ''}`],
  ].map(([k, v]) => rowHtml(k, v));

  const ownerSummaryRows = [
    ...summaryRows,
    rowHtml('Email', booking.contact_email),
    rowHtml('Mobile', booking.contact_mobile),
    rowHtml('Site address', booking.site_address),
    rowHtml('Materials', MATERIALS[booking.materials_arrangement]),
    rowHtml('PO reference', booking.po_reference),
  ];

  const appUrl = env.APP_URL || new URL(request.url).origin;
  const reviewUrl = `${appUrl}/review/${reviewToken}`;

  const ackContent = contractorAckEmail({ ref, summaryRows });
  await sendAndLog(env, db, {
    bookingId: id, channel: 'email_contractor_ack',
    payload: { to: booking.contact_email, subject: `Request received — ${ref}`, ...ackContent },
  });

  const overlapWarning = overlaps.length
    ? `Heads up: this overlaps with ${overlaps.length} other request${overlaps.length > 1 ? 's' : ''} (${overlaps.map((o) => o.ref).join(', ')}). Check the dashboard before approving.`
    : null;
  const returningNote = clientHistory.confirmedCount > 0
    ? `Returning client — ${clientHistory.confirmedCount} previous confirmed booking${clientHistory.confirmedCount > 1 ? 's' : ''} (most recent ${clientHistory.lastRef}).`
    : clientHistory.totalCount > 0
      ? `You've heard from this email before (${clientHistory.totalCount} prior request${clientHistory.totalCount > 1 ? 's' : ''}, none confirmed yet).`
      : null;
  const ownerNotice = [returningNote, overlapWarning].filter(Boolean).join(' ');

  const reviewContent = ownerReviewEmail({ ref, reviewUrl, summaryRows: ownerSummaryRows, overlapWarning: ownerNotice || null });
  await sendAndLog(env, db, {
    bookingId: id, channel: 'email_owner_review',
    payload: { to: env.OWNER_EMAIL, subject: `New booking request — ${ref}`, ...reviewContent },
  });

  if (env.CALLMEBOT_APIKEY) {
    await sendAndLog(env, db, {
      bookingId: id, channel: 'whatsapp_owner',
      payload: { message: `New booking request ${ref}\n${whenLabelFmt(booking)} - ${SUPPORT_TYPES[booking.support_type]}\n${booking.site_postcode}\nReview: ${reviewUrl}` },
    });
  }

  return json({ ok: true, ref });
}

// Base is name-derived (e.g. CDCS-260907-ACME); on a same-day collision from
// another booking with a similar name, appends -2, -3, ... rather than failing.
async function generateUniqueRef(db, nameSeed) {
  const base = generateRef(nameSeed);
  if (!(await getBookingByRef(db, base))) return base;
  for (let n = 2; n <= 20; n++) {
    const candidate = `${base}-${n}`;
    if (!(await getBookingByRef(db, candidate))) return candidate;
  }
  return generateRef(); // exhausted name-based attempts - fall back to random
}

function whenLabelFmt(b) {
  const label = whenLabel(b);
  return b.req_mode === 'date' ? formatDateShort(label) : label;
}

function rowHtml(k, v) {
  if (!v) return '';
  return `<tr><td style="padding:4px 12px 4px 0;color:#6E6663;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:14px;">${escapeHtml(v)}</td></tr>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
