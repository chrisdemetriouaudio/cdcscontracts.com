// All booking dates are plain Europe/London calendar dates (yyyy-mm-dd) - no timezone
// conversion needed for the date itself. Only display formatting uses the London zone,
// via Intl, so BST/GMT is always correct without manual DST math.

export const LONDON_TZ = 'Europe/London';

export function nowIso() {
  return new Date().toISOString();
}

export function isValidIsoDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00Z'); // noon avoids UTC/local edge flips
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ, weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
}

export function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00Z');
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ, day: 'numeric', month: 'short', year: 'numeric',
  }).format(d);
}

export function formatDateTime(isoUtc) {
  const d = new Date(isoUtc);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON_TZ, day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(d) + ' UK time';
}

// Resolve a booking's best-known date range for overlap checks. Falls back to a
// single-day guess when only a start date + rough duration is known.
export function resolveRange(booking, { preferConfirmed = false } = {}) {
  if (preferConfirmed && booking.confirmed_start_date) {
    return {
      start: booking.confirmed_start_date,
      end: booking.confirmed_end_date || booking.confirmed_start_date,
    };
  }
  if (booking.proposed_start_date) {
    return {
      start: booking.proposed_start_date,
      end: booking.proposed_end_date || booking.proposed_start_date,
    };
  }
  const start = booking.req_start_date;
  if (!start) return null;
  let end = booking.req_end_date || start;
  if (!booking.req_end_date) {
    const guessDays = { '1_day': 0, few_days: 2, '1_week': 6, longer: 13, not_sure: 0 };
    const days = guessDays[booking.req_duration] ?? 0;
    if (days > 0) {
      const d = new Date(start + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() + days);
      end = d.toISOString().slice(0, 10);
    }
  }
  return { start, end };
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

function randomSuffix(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
  let suffix = '';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) suffix += chars[b % chars.length];
  return suffix;
}

// Turns a company/contact name into a short, display-friendly reference suffix
// (e.g. "Acme Joinery Ltd" -> "ACMEJOIN"). Falls back to a random code if the
// name has nothing usable in it (blank, or symbols/emoji only).
export function nameToRefCode(name, maxLen = 8) {
  if (!name) return null;
  const cleaned = name.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length < 2) return null;
  return cleaned.slice(0, maxLen);
}

export function generateRefPrefix(date = new Date()) {
  const y = date.getUTCFullYear().toString().slice(2);
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `CDCS-${y}${m}${d}`;
}

export function generateRef(nameSeed, date = new Date()) {
  const code = nameToRefCode(nameSeed) || randomSuffix();
  return `${generateRefPrefix(date)}-${code}`;
}
