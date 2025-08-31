import { webcrypto } from 'node:crypto';

// Polyfill Web Crypto for Node test environment
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = webcrypto as unknown as Crypto;
}

// Polyfill btoa for Node
if (!(globalThis as any).btoa) {
  (globalThis as any).btoa = (str: string) =>
    Buffer.from(str, 'binary').toString('base64');
}