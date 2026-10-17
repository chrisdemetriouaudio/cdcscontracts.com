import { markNotification } from '../../../../_lib/db.js';
import { sendEmailViaResend } from '../../../../_lib/email.js';
import { sendOwnerWhatsAppAlert } from '../../../../_lib/whatsapp.js';

export async function onRequestPost({ params, env }) {
  const db = env.DB;
  const n = await db.prepare('SELECT * FROM notifications WHERE id = ?').bind(params.id).first();
  if (!n) return json({ ok: false, error: 'Not found.' }, 404);

  let payload;
  try { payload = JSON.parse(n.payload); } catch { return json({ ok: false, error: 'Corrupt payload.' }, 500); }

  try {
    if (n.channel === 'whatsapp_owner') {
      await sendOwnerWhatsAppAlert(env, payload.message);
    } else {
      await sendEmailViaResend(env, payload);
    }
    await markNotification(db, n.id, 'sent', null);
    return json({ ok: true });
  } catch (err) {
    await markNotification(db, n.id, 'failed', String(err?.message || err));
    return json({ ok: false, error: String(err?.message || err) }, 502);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
