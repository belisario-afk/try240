// PKCE helper (no secrets stored). Code challenge uses SHA-256 base64url.

function randomString(length = 64) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => ('0' + b.toString(16)).slice(-2))
    .join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

function base64url(input: ArrayBuffer) {
  const bytes = new Uint8Array(input);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode((bytes as any)[i] as number);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createPKCE() {
  const verifier = randomString(64);
  const challenge = base64url(await sha256(verifier));
  sessionStorage.setItem('pkce_verifier', verifier);
  return { verifier, challenge };
}

export function getPKCEVerifier() {
  const v = sessionStorage.getItem('pkce_verifier');
  if (!v) throw new Error('Missing PKCE verifier in sessionStorage.');
  return v;
}