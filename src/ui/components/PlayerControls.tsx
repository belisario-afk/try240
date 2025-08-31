import { useEffect, useMemo, useState } from 'preact/hooks';
import { useAppStore } from '../../store/store';
import { ensurePlayer, getAvailableDevices, pause, play, seek, setVolume } from '../../auth/spotify';

export function PlayerControls() {
  const playing = useAppStore((s) => s.player.playing);
  const positionMs = useAppStore((s) => s.player.positionMs);
  const volume = useAppStore((s) => s.player.volume);
  const tokens = useAppStore((s) => s.tokens);
  const setPlayer = useAppStore((s) => s.setPlayer);

  const [devices, setDevices] = useState<{ id: string; name: string; is_active: boolean }[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    if (!tokens) return;
    getAvailableDevices().then((d) => {
      setDevices(d);
      const active = d.find((x) => x.is_active) || d[0];
      if (active) {
        setSelected(active.id);
        setPlayer({ deviceId: active.id });
      }
    });
  }, [tokens, setPlayer]);

  const minutes = Math.floor(positionMs / 60000);
  const seconds = Math.floor((positionMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  return (
    <section class="panel">
      <h2 class="text-sm font-semibold mb-2">Playback</h2>
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn" onClick={() => ensurePlayer()} disabled={!tokens}>
          Init Player
        </button>
        <button class="btn" onClick={() => (playing ? pause() : play())} disabled={!tokens}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button class="btn" onClick={() => seek(Math.max(0, positionMs - 15000))} disabled={!tokens}>
          -15s
        </button>
        <button class="btn" onClick={() => seek(positionMs + 15000)} disabled={!tokens}>
          +15s
        </button>
        <span class="ml-2 text-sm opacity-80 min-w-[60px]">t= {minutes}:{seconds}</span>
        <label class="ml-4 text-sm">
          Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            class="ml-2 align-middle"
            value={volume}
            onInput={(e) => {
              const v = Number((e.target as HTMLInputElement).value);
              setPlayer({ volume: v });
              setVolume(v);
            }}
          />
        </label>
        <label class="ml-4 text-sm">
          Device
          <select
            class="ml-2 input"
            value={selected}
            onChange={(e) => setSelected((e.target as HTMLSelectElement).value)}
          >
            {devices.map((d) => (
              <option value={d.id} key={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}