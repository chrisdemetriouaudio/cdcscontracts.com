#!/usr/bin/env node
// Generates the ADMIN_PASSWORD_HASH secret value for a chosen dashboard password.
// Usage: node scripts/hash-password.js "your password"
const { webcrypto } = require('crypto');
const subtle = webcrypto.subtle;

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: node scripts/hash-password.js "your password"');
    process.exit(1);
  }
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const hash = `${toHex(salt)}:${toHex(bits)}`;
  console.log('\nADMIN_PASSWORD_HASH value:\n');
  console.log(hash);
  console.log('\nSet it with:\n');
  console.log(`  npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name cdcs-booking\n`);
  console.log('(paste the value above when prompted)\n');
}

main();
