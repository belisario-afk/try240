import { useAppStore } from '../../store/store';

export function QualityPanel() {
  const q = useAppStore((s) => s.quality);
  const setQ = useAppStore((s) => s.setQuality);

  return (
    <section class="panel">
      <h2 class="text-sm font-semibold mb-2">Quality / Performance</h2>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <label>
          Render scale: {q.renderScale.toFixed(1)}x
          <input
            type="range"
            min={1}
            max={2}
            step={0.1}
            value={q.renderScale}
            onInput={(e) => setQ({ renderScale: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
        <label>
          Target FPS: {q.targetFPS}
          <select
            class="input"
            value={q.targetFPS}
            onChange={(e) => setQ({ targetFPS: Number((e.target as HTMLSelectElement).value) as any })}
          >
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="120">120</option>
          </select>
        </label>
        <label>
          MSAA: {q.msaa}x
          <select
            class="input"
            value={q.msaa}
            onChange={(e) => setQ({ msaa: Number((e.target as HTMLSelectElement).value) as any })}
          >
            <option value="0">Off</option>
            <option value="2">2x</option>
            <option value="4">4x</option>
            <option value="8">8x</option>
          </select>
        </label>
        <label>
          Raymarch steps: {q.raymarchSteps}
          <input
            type="range"
            min={256}
            max={1024}
            step={256}
            value={q.raymarchSteps}
            onInput={(e) => setQ({ raymarchSteps: Number((e.target as HTMLInputElement).value) as any })}
          />
        </label>
        <label>
          Bloom
          <input
            class="ml-2"
            type="checkbox"
            checked={q.bloom}
            onChange={(e) => setQ({ bloom: (e.target as HTMLInputElement).checked })}
          />
        </label>
        <label>
          TAA
          <input
            class="ml-2"
            type="checkbox"
            checked={q.taa}
            onChange={(e) => setQ({ taa: (e.target as HTMLInputElement).checked })}
          />
        </label>
        <label>
          Motion blur
          <input
            class="ml-2"
            type="checkbox"
            checked={q.motionBlur}
            onChange={(e) => setQ({ motionBlur: (e.target as HTMLInputElement).checked })}
          />
        </label>
        <label>
          SSAO/SSGI
          <input
            class="ml-2"
            type="checkbox"
            checked={q.ssgi}
            onChange={(e) => setQ({ ssgi: (e.target as HTMLInputElement).checked })}
          />
        </label>
      </div>
      <div class="text-xs opacity-80 mt-2">
        Changes take effect immediately with adaptive frame governor.
      </div>
    </section>
  );
}