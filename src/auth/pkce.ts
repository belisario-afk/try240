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
  if ((globalThis as any).crypto?.getRandomValues) {
    (globalThis as any).crypto.getRandomValues(array);
  } else {
    // Non-crypto fallback for environments without Web Crypto (tests)
    for (let i = 0; i < length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array)
    .map((b) => ('0' + b.toString(16)).slice(-2))
    .join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);

  const c: any = (globalThis as any).crypto;
  if (c?.subtle?.digest) {
    return await c.subtle.digest('SHA-256', data);
  }

  // Test-only fallback: use Node crypto when running under Vitest.
  // import.meta.vitest is defined by Vitest and is tree-shaken out for production builds.
  if ((import.meta as any)?.vitest) {
    const nodeCrypto = await import('node:crypto');
    const hashBuf: Buffer = nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest();
    // Ensure we return a real ArrayBuffer (not SharedArrayBuffer)
    const ab = new ArrayBuffer(hashBuf.length);
    new Uint8Array(ab).set(hashBuf);
    return ab;
  }

  throw new Error('Web Crypto unavailable: crypto.subtle.digest is required. In tests, polyfill globalThis.crypto.');
}

function base64url(input: ArrayBuffer | Uint8Array) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  // Browser-safe base64; uses btoa if available, Buffer in Node (tests)
  if ((globalThis as any).btoa) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i] as number);
    return (globalThis as any)
      .btoa(bin)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else {
    return Buffer.from(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
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