import { checkAdminPassword, createAdminSessionCookie } from '../../_lib/auth.js';
import { hashIp } from '../../_lib/crypto.js';
import { countRecentSubmissions, logSubmission } from '../../_lib/db.js';

const WINDOW_MIN = 15;
const MAX_ATTEMPTS = 8;

export async function onRequestPost({ request, env }) {
  const db = env.DB;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ipHash = await hashIp(`login:${ip}`, env.IP_HASH_SALT || 'cdcs-booking');

  const since = new Date(Date.now() - WINDOW_MIN * 60000).toISOString();
  const recent = await countRecentSubmissions(db, ipHash, since);
  if (recent >= MAX_ATTEMPTS) {
    return json({ ok: false, error: 'Too many attempts. Try again later.' }, 429);
  }

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  await logSubmission(db, ipHash);

  const valid = await checkAdminPassword(env, body.password || '');
  if (!valid) return json({ ok: false, error: 'Incorrect password.' }, 401);

  const cookie = await createAdminSessionCookie(db);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
