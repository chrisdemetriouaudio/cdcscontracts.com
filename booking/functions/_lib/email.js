const INK = '#2B282A';
const ACCENT = '#FEBD17';
const MUTED = '#6E6663';
const PAPER = '#ECEBEA';

export async function sendEmailViaResend(env, { to, subject, html, text }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || 'CDCS Contracts <bookings@mail.cdcscontracts.com>',
      to: [to],
      reply_to: env.EMAIL_REPLY_TO || 'chris@cdcscontracts.com',
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

function button(label, href) {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#231F20;
    font-weight:700;text-decoration:none;padding:14px 22px;border-radius:8px;font-size:15px;
    margin:6px 8px 6px 0;">${label}</a>`;
}

function shell(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:${PAPER};padding:24px 12px;
    font-family:Arial,Helvetica,sans-serif;color:${INK};">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;
      border:1px solid #DCD8D2;">
    <div style="background:${INK};color:${PAPER};padding:18px 24px;">
      <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${ACCENT};
          font-weight:700;">CDCS Contracts</div>
      <div style="font-size:18px;font-weight:700;margin-top:4px;">${title}</div>
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.55;">${bodyHtml}</div>
    <div style="padding:16px 24px;border-top:1px solid #ECEBEA;font-size:12px;color:${MUTED};">
      CDCS Contracts &middot; C D Construction Services &middot; Sole trader, CIS registered &middot;
      Stockport &amp; Greater Manchester
    </div>
  </div>
</body></html>`;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function summaryTable(rows) {
  return `<table style="border-collapse:collapse;width:100%;margin:14px 0;">${rows.join('')}</table>`;
}

export function contractorAckEmail({ ref, summaryRows }) {
  const html = shell('Request received', `
    <p>Thanks &mdash; your request has been sent. <strong>These dates are not
    confirmed yet.</strong> I pick up messages at breaks and in the evening, and will
    come back to you with a straight yes, a proposed alternative, or a no.</p>
    <p style="margin:18px 0 4px;font-size:13px;color:${MUTED};">Booking reference</p>
    <p style="font-family:monospace;font-size:16px;font-weight:700;margin:0 0 12px;">${ref}</p>
    ${summaryTable(summaryRows)}
    <p style="font-size:13px;color:${MUTED};">Quote this reference in any follow-up message.</p>
  `);
  const text = `Thanks - your request has been sent. These dates are not confirmed yet.\nBooking reference: ${ref}\nI pick up messages at breaks and in the evening.`;
  return { html, text };
}

export function ownerReviewEmail({ ref, reviewUrl, summaryRows, overlapWarning }) {
  const warn = overlapWarning
    ? `<p style="background:#FDF1D6;border:1px solid ${ACCENT};padding:10px 12px;
        border-radius:8px;font-size:13px;">${overlapWarning}</p>`
    : '';
  const html = shell('New booking request', `
    <p>New request from the booking form &mdash; reference <strong>${ref}</strong>.</p>
    ${warn}
    ${summaryTable(summaryRows)}
    <div style="margin-top:20px;">${button('Review request', reviewUrl)}</div>
    <p style="font-size:12px;color:${MUTED};margin-top:14px;">
      This link opens a private review page. Nothing is approved, proposed or declined
      until you choose an action on that page.</p>
  `);
  const text = `New booking request ${ref}.\nReview: ${reviewUrl}`;
  return { html, text };
}

export function contractorAcceptEmail({ ref, acceptUrl, summaryRows, message }) {
  const html = shell('Proposed dates / rate', `
    <p>I&rsquo;ve proposed terms for your request (ref <strong>${ref}</strong>):</p>
    ${summaryTable(summaryRows)}
    ${message ? `<p style="font-style:italic;">&ldquo;${escapeHtml(message)}&rdquo;</p>` : ''}
    <div style="margin-top:20px;">${button('Accept and confirm', acceptUrl)}</div>
    <p style="font-size:13px;color:${MUTED};margin-top:10px;">
      Nothing is booked until you accept. If these don&rsquo;t work, just reply to this
      email.</p>
  `);
  const text = `I've proposed terms for booking ${ref}.\nAccept and confirm: ${acceptUrl}`;
  return { html, text };
}

export function contractorConfirmedEmail({ ref, summaryRows, icsUrl, invoiceUrl }) {
  const html = shell('Booking confirmed', `
    <p><strong>Confirmed</strong> &mdash; reference <strong>${ref}</strong>.</p>
    ${summaryTable(summaryRows)}
    <div style="margin-top:18px;">${button('Add to calendar', icsUrl)}</div>
    ${invoiceUrl ? `<div style="margin-top:10px;">${button('View invoice and pay (demo)', invoiceUrl)}</div>` : ''}
    <p style="font-size:13px;color:${MUTED};margin-top:16px;">
      Need to change or cancel? Reply to this email with reference ${ref}.</p>
  `);
  const text = `Booking confirmed - reference ${ref}. Add to calendar: ${icsUrl}${invoiceUrl ? `\nInvoice (demo): ${invoiceUrl}` : ''}`;
  return { html, text };
}

export function contractorDeclinedEmail({ ref, reason }) {
  const html = shell('Request update', `
    <p>Thanks for the request (ref <strong>${ref}</strong>) &mdash; unfortunately I
    can&rsquo;t take this one on.</p>
    ${reason ? `<p style="font-style:italic;">&ldquo;${escapeHtml(reason)}&rdquo;</p>` : ''}
    <p>Feel free to get in touch again for future dates.</p>
  `);
  const text = `Booking ${ref}: I can't take this one on.${reason ? ' ' + reason : ''}`;
  return { html, text };
}
