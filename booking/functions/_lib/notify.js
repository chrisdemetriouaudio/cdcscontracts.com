import { insertNotification, markNotification, listFailedNotifications } from './db.js';
import { sendEmailViaResend } from './email.js';
import { sendOwnerWhatsAppAlert } from './whatsapp.js';
import { nowIso } from './dates.js';

// Sends one notification and logs the attempt. Never throws - a failed send is
// recorded as 'failed' and picked up later by the retry job, so it can never lose
// the booking itself or block the rest of the flow.
export async function sendAndLog(env, db, { bookingId, channel, payload }) {
  const id = crypto.randomUUID();
  await insertNotification(db, {
    id, booking_id: bookingId, channel, status: 'pending', attempts: 0,
    last_error: null, payload: JSON.stringify(payload),
    created_at: nowIso(), updated_at: nowIso(),
  });
  await attemptSend(env, db, { id, channel, payload });
  return id;
}

async function attemptSend(env, db, { id, channel, payload }) {
  try {
    if (channel === 'whatsapp_owner') {
      await sendOwnerWhatsAppAlert(env, payload.message);
    } else {
      await sendEmailViaResend(env, payload);
    }
    await markNotification(db, id, 'sent', null);
    return true;
  } catch (err) {
    await markNotification(db, id, 'failed', String(err?.message || err));
    return false;
  }
}

// Re-attempts every failed notification under the retry cap. Called both lazily
// (whenever the owner dashboard loads) and from the scheduled retry worker.
export async function retryFailedNotifications(env, db) {
  const failed = await listFailedNotifications(db);
  let retried = 0;
  for (const n of failed) {
    let payload;
    try { payload = JSON.parse(n.payload); } catch { continue; }
    const ok = await attemptSend(env, db, { id: n.id, channel: n.channel, payload });
    if (ok) retried++;
  }
  return { checked: failed.length, retried };
}
