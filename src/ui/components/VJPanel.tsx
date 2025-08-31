import { useAppStore } from '../../store/store';

export function VJPanel() {
  const vj = useAppStore((s) => s.vj);
  const setVJ = useAppStore((s) => s.setVJ);
  const ui = useAppStore((s) => s.ui);
  const setUI = useAppStore((s) => s.setUI);

  return (
    <section class="panel">
      <h2 class="text-sm font-semibold mb-2">VJ / Accessibility</h2>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <label>
          Intensity: {vj.macroIntensity.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={vj.macroIntensity}
            onInput={(e) => setVJ({ macroIntensity: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
        <label>
          Bloom: {vj.macroBloom.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={vj.macroBloom}
            onInput={(e) => setVJ({ macroBloom: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
        <label>
          Glitch: {vj.macroGlitch.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={vj.macroGlitch}
            onInput={(e) => setVJ({ macroGlitch: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
        <label>
          Speed: {vj.macroSpeed.toFixed(2)}
          <input
            type="range"
            min={0.25}
            max={2}
            step={0.01}
            value={vj.macroSpeed}
            onInput={(e) => setVJ({ macroSpeed: Number((e.target as HTMLInputElement).value) })}
          />
        </label>
      </div>
      <div class="grid grid-cols-2 gap-2 text-sm mt-3">
        <label>
          Epilepsy-safe
          <input class="ml-2" type="checkbox" checked={ui.epilepsySafe} onChange={(e) => setUI({ epilepsySafe: (e.target as HTMLInputElement).checked })} />
        </label>
        <label>
          Reduced motion
          <input class="ml-2" type="checkbox" checked={ui.reducedMotion} onChange={(e) => setUI({ reducedMotion: (e.target as HTMLInputElement).checked })} />
        </label>
        <label>
          High contrast
          <input class="ml-2" type="checkbox" checked={ui.highContrast} onChange={(e) => setUI({ highContrast: (e.target as HTMLInputElement).checked })} />
        </label>
        <label>
          Debug overlay
          <input class="ml-2" type="checkbox" checked={ui.debug} onChange={(e) => setUI({ debug: (e.target as HTMLInputElement).checked })} />
        </label>
      </div>
    </section>
  );
}