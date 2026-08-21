// Shared auth + matching helpers for Roomie Match backend functions.
// Uses the Web Crypto API (available in the Workers runtime).

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

export function normalizeAnswer(answer) {
  return (answer || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function generateToken() {
  return (crypto.randomUUID() + crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
}

async function deriveHash(secret, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashSecret(secret) {
  const salt = crypto.randomUUID() + crypto.randomUUID();
  const hash = await deriveHash(secret, salt);
  return salt + ':' + hash;
}

export async function verifySecret(secret, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const sep = stored.indexOf(':');
  if (sep === -1) return false;
  const salt = stored.slice(0, sep);
  const hash = stored.slice(sep + 1);
  const testHash = await deriveHash(secret, salt);
  return testHash === hash;
}

export async function getAccountFromToken(base44, token) {
  if (!token) return null;
  const accounts = await base44.asServiceRole.entities.Account.filter({ sessionToken: token });
  return accounts && accounts.length > 0 ? accounts[0] : null;
}

// Compatibility score between two profiles' lifestyle answers.
// High-conflict items (guests, noise) weighted more.
const WEIGHTS = { guests: 3, noise: 3, lateNights: 2, lightOn: 2, coolerAc: 1 };
const TOTAL_WEIGHT = 11;

export function compatibilityScore(a, b) {
  let matchWeight = 0;
  for (const key of Object.keys(WEIGHTS)) {
    const av = a && a[key];
    const bv = b && b[key];
    if (av === undefined || bv === undefined) continue;
    if (av === bv) matchWeight += WEIGHTS[key];
  }
  return Math.round((matchWeight / TOTAL_WEIGHT) * 100);
}

export function lifestyleTags(profile) {
  const tags = [];
  if (profile.lateNights) tags.push('Night owl'); else tags.push('Early bird');
  if (profile.coolerAc) tags.push('AC preferred'); else tags.push('Cooler fine');
  if (!profile.guests) tags.push('No guests');
  if (profile.noise) tags.push('Music ok'); else tags.push('Quiet zone');
  return tags.slice(0, 3);
}