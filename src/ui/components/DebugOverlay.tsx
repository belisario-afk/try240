import { useEffect, useRef } from 'preact/hooks';
import { useAppStore } from '../../store/store';

export function DebugOverlay() {
  const debug = useAppStore((s) => s.ui.debug);
  const a = useAppStore((s) => s.analysis.frame);
  const stats = useAppStore((s) => s.analysis.stats);
  const logs = useAppStore((s) => s.analysis.debugLog);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!debug || !ref.current || !a?.fft) return;
    const ctx = ref.current.getContext('2d')!;
    const w = ref.current.width;
    const h = ref.current.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1db954';
    ctx.beginPath();
    for (let i = 0; i < a.fft.length; i++) {
      const x = (i / (a.fft.length - 1)) * w;
      const fftv = (a.fft[i] ?? -120) as number;
      const y = h - Math.min(h, ((fftv + 120) / 120) * h);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [a, debug]);

  if (!debug) return null;
  return (
    <aside id="debug-overlay" class="panel">
      <h2 class="text-sm font-semibold mb-2">Analysis Debug</h2>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div>FPS: {stats.fps.toFixed(1)}</div>
          <div>Beat: {a?.beat ? 'yes' : 'no'}</div>
          <div>Tempo: {a?.tempoBPM?.toFixed(1) ?? '--'} bpm</div>
          <div>Bar: {a?.bar ?? '--'}</div>
          <div>RMS: {a?.rms?.toFixed(3) ?? '--'}</div>
        </div>
        <canvas ref={ref} width={240} height={120} class="border border-neutral-800" />
      </div>
      <details class="mt-2">
        <summary class="cursor-pointer">Logs</summary>
        <pre class="mt-2 text-[11px] max-h-48 overflow-auto">{logs.join('\n')}</pre>
      </details>
    </aside>
  );
}