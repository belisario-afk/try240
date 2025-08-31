import { useAppStore } from '../store/store';
import { startBeatWorker } from './workers/beat-worker';
import { computeChroma, computeLogFft } from './features';

let analyser: AnalyserNode | null = null;
let raf = 0;
let beatWorkerStop: (() => void) | null = null;

export function connectAudioAnalysis() {
  const st = useAppStore.getState();

  // Build a dummy audio chain that uses microphone or mock mode
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  analyser = ctx.createAnalyser();
  analyser.fftSize = 8192;
  analyser.smoothingTimeConstant = 0.8;
  analyser.connect(gain);

  if (st.env.mock) {
    // Simulated signal
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 110;
    osc.connect(gain);
    osc.start();
  } else {
    // Ask for microphone to drive visuals (workaround since Spotify SDK PCM is not exposed)
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyser!);
      })
      .catch((err) => {
        console.warn('Microphone unavailable, falling back to mock analysis.', err);
      });
  }

  const fftBuf = new Float32Array(analyser.frequencyBinCount);
  const timeBuf = new Float32Array(analyser.fftSize);
  const chromaBuf = new Float32Array(12);

  const beat = startBeatWorker({
    fftSize: analyser.fftSize,
    onBeat: (payload) => {
      const s = useAppStore.getState();
      s.updateAnalysis({ beat: payload.beat, onset: payload.onset, bar: payload.bar, tempoBPM: payload.tempoBPM });
    }
  });
  beatWorkerStop = beat.stop;

  const loop = () => {
    if (!analyser) return;
    analyser.getFloatFrequencyData(fftBuf);
    analyser.getFloatTimeDomainData(timeBuf);
    const logFft = computeLogFft(fftBuf);
    computeChroma(logFft, chromaBuf);

    useAppStore.getState().updateAnalysis({
      fft: logFft,
      chroma: chromaBuf.slice() as any,
      rms: Math.sqrt(timeBuf.reduce((a, b) => a + (b ?? 0) * (b ?? 0), 0) / timeBuf.length),
      spectralCentroid: spectralCentroid(fftBuf, ctx.sampleRate)
    });

    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  let lastFpsTime = performance.now();
  let frames = 0;
  const fpsLoop = () => {
    frames++;
    const now = performance.now();
    if (now - lastFpsTime > 1000) {
      useAppStore.getState().analysis.stats.fps = frames * (1000 / (now - lastFpsTime));
      lastFpsTime = now;
      frames = 0;
    }
    requestAnimationFrame(fpsLoop);
  };
  fpsLoop();

  return () => {
    cancelAnimationFrame(raf);
    beatWorkerStop?.();
  };
}

function spectralCentroid(spectrum: Float32Array, sampleRate: number) {
  let weightedSum = 0;
  let total = 0;
  for (let i = 0; i < spectrum.length; i++) {
    const mag = Math.pow(10, ((spectrum[i] ?? -120) as number) / 20); // dB to linear
    weightedSum += i * mag;
    total += mag;
  }
  const bin = total > 0 ? weightedSum / total : 0;
  const freq = (bin * sampleRate) / (2 * spectrum.length);
  return freq;
}