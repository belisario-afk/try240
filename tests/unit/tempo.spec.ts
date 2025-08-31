import { describe, it, expect } from 'vitest';
import { estimateTempo } from '../../src/processing/features';

describe('Tempo estimation', () => {
  it('estimates around the correct bpm', () => {
    const bpm = 120;
    const sr = 100; // 100Hz sampling of onset envelope
    const len = sr * 10;
    const env = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      if ((i % Math.round((60 / bpm) * sr)) === 0) env[i] = 1;
    }
    const est = estimateTempo(env, sr);
    expect(est).toBeGreaterThan(110);
    expect(est).toBeLessThan(130);
  });
});