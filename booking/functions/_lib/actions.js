// Shared booking state-transition logic, used by both the emailed review/accept
// links (token-authenticated) and the owner dashboard (session-authenticated) so
// the two paths can never drift apart on conflict checks or notification content.
import { hashToken, generateToken } from './crypto.js';
import { updateBookingIfStatus, hasConfirmedConflict, hasBlockedConflict } from './db.js';
import { formatDateShort, isValidIsoDate } from './dates.js';
import { SUPPORT_TYPES, MATERIALS } from './validate.js';
import { contractorConfirmedEmail, contractorAcceptEmail, contractorDeclinedEmail } from './email.js';
import { sendAndLog } from './notify.js';

function row(k, v) {
  if (!v) return '';
  return `<tr><td style="padding:4px 12px 4px 0;color:#6E6663;font-size:13px;white-space:nowrap;">${k}</td><td style="padding:4px 0;font-size:14px;">${v}</td></tr>`;
}

export async function approveBooking(env, db, booking, { startDate, endDate, startTime, dayRate, agreedHours }, appUrl) {
  endDate = endDate || startDate;
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return { ok: false, error: 'Enter a valid confirmed start date.' };
  }
  const [confirmConflict, blockConflict] = await Promise.all([
    hasConfirmedConflict(db, startDate, endDate, booking.id),
    hasBlockedConflict(db, startDate, endDate),
  ]);
  if (confirmConflict || blockConflict) {
    return { ok: false, error: `${startDate} to ${endDate} conflicts with another confirmed booking or a blocked date.` };
  }

  const calendarToken = generateToken();
  const changed = await updateBookingIfStatus(db, booking.id, booking.status, {
    status: 'confirmed',
    confirmed_start_date: startDate,
    confirmed_end_date: endDate,
    confirmed_start_time: (startTime || '').trim() || 'tba',
    day_rate_pence: dayRate ? Math.round(Number(dayRate) * 100) : null,
    agreed_hours: (agreedHours || '').trim() || null,
    calendar_token_hash: await hashToken(calendarToken),
  });
  if (!changed) return { ok: false, error: `Reference ${booking.ref} was already actioned elsewhere.` };

  const icsUrl = `${appUrl}/api/ics/${booking.id}?t=${calendarToken}`;
  const summaryRows = [
    row('Dates', endDate !== startDate ? `${formatDateShort(startDate)} – ${formatDateShort(endDate)}` : formatDateShort(startDate)),
    row('Site', booking.site_address || booking.site_postcode),
    row('Support', SUPPORT_TYPES[booking.support_type]),
    row('Day rate', dayRate ? `£${Number(dayRate).toFixed(2)}` : 'To be confirmed on site'),
    row('Materials', MATERIALS[booking.materials_arrangement]),
  ];
  const content = contractorConfirmedEmail({ ref: booking.ref, summaryRows, icsUrl });
  await sendAndLog(env, db, {
    bookingId: booking.id, channel: 'email_contractor_confirmed',
    payload: { to: booking.contact_email, subject: `Confirmed — ${booking.ref}`, ...content },
  });
  return { ok: true, startDate, endDate };
}

export async function proposeBooking(env, db, booking, { startDate, endDate, dayRate, message }, appUrl) {
  endDate = endDate || startDate;
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return { ok: false, error: 'Enter a valid proposed start date.' };
  }
  const acceptToken = generateToken();
  const ACCEPT_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const changed = await updateBookingIfStatus(db, booking.id, booking.status, {
    status: 'proposed',
    proposed_start_date: startDate,
    proposed_end_date: endDate,
    proposed_day_rate_pence: dayRate ? Math.round(Number(dayRate) * 100) : null,
    proposed_message: (message || '').trim() || null,
    accept_token_hash: await hashToken(acceptToken),
    accept_token_expires: new Date(Date.now() + ACCEPT_TOKEN_TTL_MS).toISOString(),
  });
  if (!changed) return { ok: false, error: `Reference ${booking.ref} was already actioned elsewhere.` };

  const acceptUrl = `${appUrl}/accept/${acceptToken}`;
  const summaryRows = [
    row('Proposed dates', endDate !== startDate ? `${formatDateShort(startDate)} – ${formatDateShort(endDate)}` : formatDateShort(startDate)),
    row('Proposed day rate', dayRate ? `£${Number(dayRate).toFixed(2)}` : 'To discuss'),
  ];
  const content = contractorAcceptEmail({ ref: booking.ref, acceptUrl, summaryRows, message: (message || '').trim() || null });
  await sendAndLog(env, db, {
    bookingId: booking.id, channel: 'email_contractor_accept',
    payload: { to: booking.contact_email, subject: `New dates proposed — ${booking.ref}`, ...content },
  });
  return { ok: true };
}

export async function declineBooking(env, db, booking, { reason }) {
  const changed = await updateBookingIfStatus(db, booking.id, booking.status, {
    status: 'declined', decline_reason: (reason || '').trim() || null,
  });
  if (!changed) return { ok: false, error: `Reference ${booking.ref} was already actioned elsewhere.` };

  const content = contractorDeclinedEmail({ ref: booking.ref, reason: (reason || '').trim() || null });
  await sendAndLog(env, db, {
    bookingId: booking.id, channel: 'email_contractor_declined',
    payload: { to: booking.contact_email, subject: `Request update — ${booking.ref}`, ...content },
  });
  return { ok: true };
}

export async function cancelBooking(env, db, booking, { reason }) {
  const changed = await updateBookingIfStatus(db, booking.id, booking.status, {
    status: 'cancelled', decline_reason: (reason || '').trim() || null,
  });
  if (!changed) return { ok: false, error: 'Could not cancel — status changed elsewhere.' };

  const content = contractorDeclinedEmail({
    ref: booking.ref,
    reason: (reason || '').trim() || 'This booking has been cancelled by Chris.',
  });
  await sendAndLog(env, db, {
    bookingId: booking.id, channel: 'email_contractor_declined',
    payload: { to: booking.contact_email, subject: `Booking cancelled — ${booking.ref}`, ...content },
  });
  return { ok: true };
}
