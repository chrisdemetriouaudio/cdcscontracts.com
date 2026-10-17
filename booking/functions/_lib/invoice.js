// Demo invoice: labour for the booked working days, less the 20% CIS deduction the
// contractor withholds for HMRC, gives the amount to pay now. Materials are invoiced
// separately at cost. Confirmed bookings use the agreed dates and day rate; requests
// use the requested dates and the clearly-labelled demo day rate.
import { resolveRange } from './dates.js';

export const CIS_RATE = 0.2; // CIS-registered subcontractor: 20% deducted from labour

/** Working days from start to end inclusive; weekends count only if included. */
export function workingDays(start, end, includeWeekends) {
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  if (isNaN(s) || isNaN(e) || e < s) return 1;
  let days = 0;
  for (const d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = d.getUTCDay();
    if (includeWeekends || (wd !== 0 && wd !== 6)) days++;
  }
  return Math.max(days, 1);
}

const REQUEST_DAYS = { '1_day': 1, few_days: 3, '1_week': 5, longer: 10, not_sure: 1 };

export function computeInvoice(booking, env) {
  const confirmed = booking.status === 'confirmed' && booking.confirmed_start_date;
  const range = resolveRange(booking, { preferConfirmed: true });
  const days = range
    ? workingDays(range.start, range.end, !!booking.req_weekends_included)
    : (REQUEST_DAYS[booking.req_duration] || 1);
  const demoRate = Number(env.DEMO_DAY_RATE_PENCE) || 15000;
  const agreedRate = confirmed ? booking.day_rate_pence : null;
  const ratePence = agreedRate || demoRate;
  const labourPence = days * ratePence;
  const cisPence = Math.round(labourPence * CIS_RATE);
  return {
    basis: confirmed ? 'confirmed' : 'requested',
    usesDemoRate: !agreedRate,
    range,
    days,
    ratePence,
    labourPence,
    cisPence,
    payablePence: labourPence - cisPence,
  };
}

export const money = (pence) => '£' + (pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
