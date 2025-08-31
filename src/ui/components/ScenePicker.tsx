import { useState } from 'preact/hooks';
import { useAppStore } from '../../store/store';

const SCENES = ['particles', 'terrain', 'fluid', 'raymarch', 'typography'] as const;

export function ScenePicker() {
  const [open, setOpen] = useState(false);
  const active = useAppStore((s) => s.scenes.active);
  const setActiveScene = useAppStore((s) => s.setActiveScene);

  return (
    <div class="panel">
      <button
        type="button"
        class="btn w-full"
        aria-label="Scenes"
        onClick={() => setOpen((v) => !v)}
      >
        Scenes
      </button>
      {open && (
        <div class="mt-2 grid grid-cols-2 gap-2">
          {SCENES.map((name) => (
            <button
              key={name}
              type="button"
              class={`btn ${active === name ? 'btn-accent' : ''}`}
              onClick={() => setActiveScene(name)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}