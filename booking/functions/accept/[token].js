import { hashToken } from '../_lib/crypto.js';
import { getBookingByAcceptTokenHash } from '../_lib/db.js';
import { pageShell, fieldsList } from '../_lib/render.js';
import { formatDateShort } from '../_lib/dates.js';
import { SUPPORT_TYPES } from '../_lib/validate.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function onRequestGet({ params, env }) {
  const db = env.DB;
  const hash = await hashToken(params.token);
  const booking = await getBookingByAcceptTokenHash(db, hash);

  if (!booking) {
    return html(pageShell('Link expired', `<div class="panel">
      <h1>This link has expired or was already used</h1>
      <p>If you're still waiting on dates, reply to the original email.</p></div>`), 404);
  }
  if (booking.status !== 'proposed') {
    return html(pageShell('Already actioned', `<div class="panel">
      <h1>Reference ${esc(booking.ref)} is already ${esc(booking.status)}</h1>
      <p>No further action is needed on this link.</p></div>`));
  }

  const start = booking.proposed_start_date;
  const end = booking.proposed_end_date || start;
  const body = `
    <div class="card">
      <h1>Proposed terms &mdash; ${esc(booking.ref)}</h1>
      ${fieldsList([
        ['Dates', end !== start ? `${formatDateShort(start)} – ${formatDateShort(end)}` : formatDateShort(start)],
        ['Day rate', booking.proposed_day_rate_pence ? `£${(booking.proposed_day_rate_pence / 100).toFixed(2)}` : 'To discuss'],
        ['Support', SUPPORT_TYPES[booking.support_type]],
        ['Site', esc(booking.site_address || booking.site_postcode)],
      ])}
      ${booking.proposed_message ? `<p style="font-style:italic;">&ldquo;${esc(booking.proposed_message)}&rdquo;</p>` : ''}
    </div>
    <div class="panel">
      <form method="POST" action="/api/accept/${esc(params.token)}" onsubmit="var b=this.querySelector('button');b.disabled=true;b.textContent='Confirming…';return true;">
        <p class="msg" style="margin-top:0;">Availability is rechecked at the moment you accept &mdash;
        if these dates have just been taken, you'll see that here instead of a confirmation.</p>
        <div class="row"><button class="btn btn-accept" type="submit">Accept and confirm</button></div>
      </form>
      <p class="msg">Not going to work? Reply to the original email with reference ${esc(booking.ref)}.</p>
    </div>`;
  return html(pageShell(`Accept ${booking.ref}`, body));
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
