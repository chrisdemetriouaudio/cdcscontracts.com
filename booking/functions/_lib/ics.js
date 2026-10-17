const SUPPORT_LABELS = {
  carpenter_mate: "Carpenter's mate / carpentry support",
  joinery: 'Joinery support',
  refurb: 'Refurbishment support',
  fitout: 'Fit-out support',
  other: "Other / let's discuss",
};

function icsEscape(s = '') {
  return String(s).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function toIcsDate(iso) {
  return iso.replace(/-/g, '');
}

// All-day event covering the confirmed range (end exclusive per RFC 5545, so +1 day).
export function buildIcs(booking) {
  const start = booking.confirmed_start_date;
  const endInclusive = booking.confirmed_end_date || start;
  const endDate = new Date(endInclusive + 'T00:00:00Z');
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const endExclusive = endDate.toISOString().slice(0, 10);

  const summary = `CDCS Contracts \u2014 ${booking.contact_name}${booking.company_name ? ' (' + booking.company_name + ')' : ''}`;
  const descLines = [
    `Booking reference: ${booking.ref}`,
    booking.support_type ? `Support: ${SUPPORT_LABELS[booking.support_type] || booking.support_type}` : '',
    booking.work_description || '',
    booking.confirmed_start_time && booking.confirmed_start_time !== 'tba'
      ? `Start time: ${booking.confirmed_start_time}` : 'Start time: to be agreed',
    booking.day_rate_pence ? `Day rate: £${(booking.day_rate_pence / 100).toFixed(2)}` : '',
  ].filter(Boolean);

  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CDCS Contracts//Booking//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@cdcscontracts.com`,
    `DTSTAMP:${toIcsDate(new Date().toISOString().slice(0, 10))}T090000Z`,
    `DTSTART;VALUE=DATE:${toIcsDate(start)}`,
    `DTEND;VALUE=DATE:${toIcsDate(endExclusive)}`,
    `SUMMARY:${icsEscape(summary)}`,
    `LOCATION:${icsEscape(booking.site_address || booking.site_postcode)}`,
    `DESCRIPTION:${icsEscape(descLines.join('\n'))}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
