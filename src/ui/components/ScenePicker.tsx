import { useAppStore } from '../../store/store';

export function ScenePicker() {
  const scenes = useAppStore((s) => s.scenes);
  const setActive = useAppStore((s) => s.setActiveScene);
  const schedule = useAppStore((s) => s.scheduleScene);

  return (
    <section class="panel">
      <h2 class="text-sm font-semibold mb-2">Scenes</h2>
      <div class="flex flex-wrap gap-2">
        {scenes.available.map((id) => (
          <button
            key={id}
            class={'btn ' + (id === scenes.active ? 'btn-accent' : '')}
            onClick={() => schedule(id)}
            title="Schedules crossfade at phrase boundary"
          >
            {id}
          </button>
        ))}
      </div>
      <div class="text-xs opacity-80 mt-2">
        Active: <b>{scenes.active}</b>
        {scenes.next ? (
          <>
            {' '}
            → Next at phrase: <b>{scenes.next}</b>
          </>
        ) : null}
      </div>
    </section>
  );
}