import { useEffect } from 'preact/hooks';
import { useAppStore } from '../store/store';
import { connectAudioAnalysis } from '../processing/analysis';
import { initVisualEngine } from '../visuals/engine';
import { ensurePlayer } from '../auth/spotify';
import { setupRecorderControls } from '../recorder/recorder';

export function Player() {
  const tokens = useAppStore((s) => s.tokens);

  useEffect(() => {
    const container = document.getElementById('vis-container')!;
    const stopVis = initVisualEngine(container);
    const disconnect = connectAudioAnalysis();
    setupRecorderControls();

    if (tokens) {
      ensurePlayer().catch(console.error);
    }

    return () => {
      disconnect?.();
      stopVis?.();
    };
  }, [tokens]);

  return <div class="sr-only">Player page</div>;
}