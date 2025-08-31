/// <reference lib="webworker" />
let bar = 0;
let beat = false;
let tempoBPM = 120;
let onset = false;

self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === 'init') {
    // Setup state if needed
  } else if (msg.type === 'tick') {
    // Simple simulated beat grid (replace with spectral flux + adaptive threshold in production)
    const t = (msg.now / 1000) % (60 / (tempoBPM || 120));
    onset = t < 0.05;
    if (onset) {
      beat = !beat;
      if (beat) bar++;
    }
    const payload = { beat, onset, tempoBPM, bar };
    // @ts-ignore
    self.postMessage({ type: 'beat', payload });
  }
};