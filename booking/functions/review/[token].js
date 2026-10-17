import { hashToken } from '../_lib/crypto.js';
import { getBookingByReviewTokenHash, findOverlappingBookings } from '../_lib/db.js';
import { pageShell, fieldsList } from '../_lib/render.js';
import { formatDateShort, resolveRange } from '../_lib/dates.js';
import { SUPPORT_TYPES, DURATIONS, MATERIALS, whenLabel } from '../_lib/validate.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function onRequestGet({ params, env }) {
  const db = env.DB;
  const hash = await hashToken(params.token);
  const booking = await getBookingByReviewTokenHash(db, hash);

  if (!booking) {
    return html(pageShell('Link expired', `
      <div class="panel"><h1>This review link has expired or was already used</h1>
      <p>Open the booking dashboard to find this request instead.</p>
      <p><a class="btn btn-propose" href="/admin/">Open dashboard</a></p></div>
    `), 404);
  }

  if (booking.status !== 'pending') {
    return html(pageShell('Already actioned', `
      <div class="panel"><h1>Reference ${esc(booking.ref)} is already ${esc(booking.status)}</h1>
      <p>No further action is needed on this link. Manage it from the dashboard if you need to
      change anything.</p>
      <p><a class="btn btn-propose" href="/admin/">Open dashboard</a></p></div>
    `));
  }

  const overlaps = await findOverlappingBookings(db, booking, booking.id);
  const overlapNotice = overlaps.length
    ? `<div class="notice">Overlaps with ${overlaps.length} other request${overlaps.length > 1 ? 's' : ''}:
       ${overlaps.map((o) => `${esc(o.ref)} (${esc(o.status)})`).join(', ')}. Check dates before approving.</div>`
    : '';

  const when = booking.req_mode === 'date' ? formatDateShort(booking.req_start_date) : whenLabel(booking);
  const range = resolveRange(booking);

  const body = `
    <div class="card">
      <h1>New booking request &mdash; ${esc(booking.ref)}</h1>
      ${fieldsList([
        ['When', when],
        ['Duration', DURATIONS[booking.req_duration]],
        ['End date', booking.req_end_date ? formatDateShort(booking.req_end_date) : ''],
        ['Start time', booking.req_start_time === 'tba' ? 'To be agreed' : booking.req_start_time],
        ['Postcode', booking.site_postcode],
        ['Site address', booking.site_address],
        ['Support needed', SUPPORT_TYPES[booking.support_type]],
        ['Description', esc(booking.work_description)],
        ['Contact', esc(booking.contact_name)],
        ['Company', esc(booking.company_name)],
        ['Email', esc(booking.contact_email)],
        ['Mobile', esc(booking.contact_mobile)],
        ['Site contact', esc(booking.site_contact)],
        ['Access details', esc(booking.access_details)],
        ['Tools/PPE needed', esc(booking.tools_ppe_needed)],
        ['Materials', MATERIALS[booking.materials_arrangement]],
        ['PO reference', esc(booking.po_reference)],
      ])}
    </div>
    <div class="panel">
      ${overlapNotice}

      <form class="action" method="POST" action="/api/review/${esc(params.token)}/approve" onsubmit="return disableBtn(this)">
        <h2 style="margin:0 0 .4rem;font-size:1rem;">Approve and confirm</h2>
        <p class="msg" style="margin-top:0;">Confirm the exact working dates &mdash; pre-filled from the request where known.</p>
        <label>Confirmed start date</label>
        <input type="date" name="start_date" value="${range?.start ? esc(range.start) : ''}" required>
        <label>Confirmed end date (optional, defaults to start date)</label>
        <input type="date" name="end_date" value="${range?.end && range.end !== range.start ? esc(range.end) : ''}">
        <label>Start time (optional)</label>
        <input type="text" name="start_time" value="${booking.req_start_time && booking.req_start_time !== 'tba' ? esc(booking.req_start_time) : ''}" placeholder="To be agreed">
        <label>Agreed day rate (£, optional)</label>
        <input type="number" name="day_rate" min="0" step="1" placeholder="e.g. 120">
        <label>Agreed hours (optional)</label>
        <input type="text" name="agreed_hours" placeholder="e.g. 8am&ndash;4:30pm">
        <div class="row"><button class="btn btn-approve" type="submit">Approve and confirm</button></div>
      </form>

      <form class="action" method="POST" action="/api/review/${esc(params.token)}/propose" onsubmit="return disableBtn(this)">
        <h2 style="margin:0 0 .4rem;font-size:1rem;">Propose different dates / rate</h2>
        <label>Proposed start date</label>
        <input type="date" name="proposed_start_date" value="${range?.start ? esc(range.start) : ''}">
        <label>Proposed end date (optional)</label>
        <input type="date" name="proposed_end_date">
        <label>Proposed day rate (£, optional)</label>
        <input type="number" name="proposed_day_rate" min="0" step="1">
        <label>Message to contractor (optional)</label>
        <textarea name="proposed_message" placeholder="e.g. Can't do Monday, but Tue-Thu works."></textarea>
        <div class="row"><button class="btn btn-propose" type="submit">Send proposal</button></div>
      </form>

      <form class="action" method="POST" action="/api/review/${esc(params.token)}/decline" onsubmit="return disableBtn(this)">
        <h2 style="margin:0 0 .4rem;font-size:1rem;">Decline</h2>
        <label>Reason (optional, sent to contractor)</label>
        <textarea name="reason"></textarea>
        <div class="row"><button class="btn btn-decline" type="submit">Decline request</button></div>
      </form>
      <p class="msg">Each button submits immediately &mdash; there's nothing else to confirm after that.</p>
    </div>
    <script>function disableBtn(f){var b=f.querySelector('button');b.disabled=true;b.textContent='Sending…';return true;}</script>
  `;
  return html(pageShell(`Review ${booking.ref}`, body));
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
