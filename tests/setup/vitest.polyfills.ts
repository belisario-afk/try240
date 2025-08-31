/* Ensure Web Crypto and btoa are available in Vitest (Node) */

function ensureWebCrypto() {
  const g = globalThis as any;
  if (g.crypto?.subtle && g.crypto?.getRandomValues) {
    return; // already present
  }
  try {
    // Node 16+/18+/20+
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { webcrypto } = require('node:crypto');
    if (webcrypto?.subtle && webcrypto?.getRandomValues) {
      g.crypto = webcrypto;
      return;
    }
  } catch {
    // ignore and try next fallback
  }
  try {
    // Fallback for older Node: pure JS implementation
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Crypto } = require('@peculiar/webcrypto');
    g.crypto = new Crypto();
  } catch (e) {
    // Final fallback — your tests that rely on crypto.subtle will fail, but at least the message is clear.
    console.warn(
      '[vitest.polyfills] Failed to polyfill Web Crypto. Install @peculiar/webcrypto: pnpm add -D @peculiar/webcrypto'
    );
  }
}

function ensureBtoa() {
  const g = globalThis as any;
  if (!g.btoa) {
    g.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  }
}

ensureWebCrypto();
ensureBtoa();