import { generateToken, hashToken, verifyPassword } from './crypto.js';
import { createAdminSession, isAdminSessionValid, deleteAdminSession } from './db.js';

const SESSION_COOKIE = 'cdcs_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function requireAdmin(request, env, db) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return false;
  const hash = await hashToken(token);
  return isAdminSessionValid(db, hash);
}

export async function createAdminSessionCookie(db) {
  const token = generateToken();
  const hash = await hashToken(token);
  await createAdminSession(db, hash, SESSION_TTL_MS);
  const secure = 'Secure; ';
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; ${secure}SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`;
  return cookie;
}

export async function clearAdminSessionCookie(request, db) {
  const token = getCookie(request, SESSION_COOKIE);
  if (token) await deleteAdminSession(db, await hashToken(token));
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export async function checkAdminPassword(env, password) {
  if (!env.ADMIN_PASSWORD_HASH) return false;
  return verifyPassword(password, env.ADMIN_PASSWORD_HASH);
}

export async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET_KEY) return true; // not configured yet - fail open in dev only
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body: form,
  });
  const data = await res.json();
  return !!data.success;
}
