// Light-weight DSP feature extraction
export function computeLogFft(fftDb: Float32Array, bands = 512): Float32Array {
  const out = new Float32Array(bands);
  const n = fftDb.length;
  for (let i = 0; i < bands; i++) {
    const start = Math.floor(Math.pow(i / bands, 2) * n);
    const end = Math.floor(Math.pow((i + 1) / bands, 2) * n);
    let acc = -120;
    for (let j = start; j < end && j < n; j++) {
      const v = (fftDb[j] ?? -120) as number;
      acc = Math.max(acc, v);
    }
    out[i] = acc;
  }
  return out;
}

export function computeChroma(logFft: Float32Array, out12: Float32Array) {
  out12.fill(0);
  for (let i = 0; i < logFft.length; i++) {
    const db = (logFft[i] ?? -120) as number;
    const note = i % 12;
    const lin = Math.pow(10, db / 20);
    const prev = (out12[note] ?? 0) as number;
    out12[note] = prev + lin;
  }
  const sum = (out12 as any as number[]).reduce((a, b) => a + (b ?? 0), 0) || 1;
  for (let i = 0; i < 12; i++) out12[i] = ((out12[i] ?? 0) as number) / sum;
  return out12;
}

export function estimateTempo(onsetEnv: Float32Array, sampleRate: number) {
  // Placeholder autocorrelation tempo
  let bestLag = 0;
  let best = -Infinity;
  const minLag = Math.floor(sampleRate / 240);
  const maxLag = Math.floor(sampleRate / 60);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = lag; i < onsetEnv.length; i++) {
      const a = (onsetEnv[i] ?? 0) as number;
      const b = (onsetEnv[i - lag] ?? 0) as number;
      sum += a * b;
    }
    if (sum > best) {
      best = sum;
      bestLag = lag;
    }
  }
  const bpm = (60 * sampleRate) / (bestLag || 1);
  return bpm;
}