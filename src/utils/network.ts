export async function backoff(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function retry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 200): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await backoff(baseDelayMs * Math.pow(2, i));
    }
  }
  throw lastErr;
}