// PKCE helper (no secrets stored). Code challenge uses SHA-256 base64url.

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
}

const safeSession: StorageLike = (() => {
  try {
    const ss = (globalThis as any)?.sessionStorage as StorageLike | undefined;
    if (ss) return ss;
  } catch {
    // ignore
  }
  const mem = new Map<string, string>();
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k, v) => void mem.set(k, v),
    removeItem: (k) => void mem.delete(k),
    clear: () => void mem.clear(),
    key: (i) => Array.from(mem.keys())[i] ?? null,
    get length() {
      return mem.size;
    }
  };
})();

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
  safeSession.setItem('pkce_verifier', verifier);
  return { verifier, challenge };
}

export function getPKCEVerifier() {
  const v = safeSession.getItem('pkce_verifier');
  if (!v) throw new Error('Missing PKCE verifier in sessionStorage.');
  return v;
}