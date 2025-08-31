import { useEffect } from 'preact/hooks';
import { initVisualEngine } from '../visuals/engine';
import { useAppStore } from '../store/store';

export function Home() {
  const mock = useAppStore((s) => s.env.mock);

  useEffect(() => {
    const container = document.getElementById('vis-container')!;
    const stop = initVisualEngine(container);
    return () => stop?.();
  }, []);

  return (
    <div class="fixed inset-0 pointer-events-none">
      <div class="sr-only">
        {mock
          ? 'Mock mode enabled. Visuals will respond to simulated audio features.'
          : 'Login with Spotify to begin audio-reactive visuals.'}
      </div>
    </div>
  );
}