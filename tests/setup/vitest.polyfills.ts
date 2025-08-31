import { webcrypto } from 'node:crypto';

// Polyfill Web Crypto for Node test environment
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = webcrypto as unknown as Crypto;
}

// Polyfill btoa/atob for Node
if (!(globalThis as any).btoa) {
  (globalThis as any).btoa = (str: string) =>
    Buffer.from(str, 'binary').toString('base64');
}
if (!(globalThis as any).atob) {
  (globalThis as any).atob = (b64: string) =>
    Buffer.from(b64, 'base64').toString('binary');
}