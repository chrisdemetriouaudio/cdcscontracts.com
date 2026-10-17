// Token + password helpers built on Web Crypto (available natively in the Workers runtime).

function toBase64Url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Random opaque token handed to the outside world (email links, session cookies).
export function generateToken(bytesLen = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(bytesLen));
  return toBase64Url(bytes);
}

// One-way hash of a token, stored in D1 - the raw token itself is never persisted.
export async function hashToken(token) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

export function hashesEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip || 'unknown'}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

// PBKDF2 password hashing for the single admin account.
export async function hashPassword(password, saltHex) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256,
  );
  return `${toHex(salt)}:${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [saltHex] = stored.split(':');
  const attempt = await hashPassword(password, saltHex);
  return hashesEqual(attempt, stored);
}
