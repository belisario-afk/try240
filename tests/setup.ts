// Vitest setup: polyfills for browser APIs used in tests.

import { webcrypto } from 'node:crypto';

// Ensure global crypto with subtle + getRandomValues
// @ts-ignore
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  // @ts-ignore
  globalThis.crypto = webcrypto as unknown as Crypto;
}

// Minimal in-memory Storage polyfill for sessionStorage/localStorage in Node
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// jsdom should provide window, but sessionStorage may be undefined in Node contexts
// Create them if missing to avoid tests failing.
if (typeof window !== 'undefined') {
  // @ts-ignore
  if (!window.sessionStorage) {
    // @ts-ignore
    window.sessionStorage = new MemoryStorage();
  }
  // @ts-ignore
  if (!window.localStorage) {
    // @ts-ignore
    window.localStorage = new MemoryStorage();
  }
}

// Also expose on globalThis for code that reads sessionStorage directly
// @ts-ignore
if (!globalThis.sessionStorage) {
  // @ts-ignore
  globalThis.sessionStorage = new MemoryStorage();
}
// @ts-ignore
if (!globalThis.localStorage) {
  // @ts-ignore
  globalThis.localStorage = new MemoryStorage();
}