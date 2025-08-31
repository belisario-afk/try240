// Worker that detects onsets and beats via spectral flux and adaptive threshold.
export function startBeatWorker(opts: { fftSize: number; onBeat: (p: { beat: boolean; onset: boolean; tempoBPM: number; bar: number }) => void }) {
  const worker = new Worker(new URL('./beat.worker.ts', import.meta.url), { type: 'module' });
  worker.postMessage({ type: 'init', fftSize: opts.fftSize });
  worker.onmessage = (e) => {
    if (e.data?.type === 'beat') {
      opts.onBeat(e.data.payload);
    }
  };
  // For demo: synthesize periodic beats in mock mode
  let t = 0;
  const interval = setInterval(() => {
    t++;
    worker.postMessage({ type: 'tick', now: performance.now(), idx: t });
  }, 50);

  return {
    stop() {
      clearInterval(interval);
      worker.terminate();
    }
  };
}