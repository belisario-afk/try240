import { useAppStore } from '../../store/store';
import { loginWithSpotify, logoutAndClear } from '../../auth/spotify';
import { useEffect } from 'preact/hooks';

export function HeaderBar() {
  const tokens = useAppStore((s) => s.tokens);
  const theme = useAppStore((s) => s.ui.theme);
  const setUI = useAppStore((s) => s.setUI);
  const pushDebug = useAppStore((s) => s.pushDebug);

  useEffect(() => {
    pushDebug(`App v${__APP_VERSION__} ready. MOCK=${__MOCK__}`);
  }, [pushDebug]);

  return (
    <header class="fixed top-0 inset-x-0 z-30">
      <div class="m-2 p-2 panel flex items-center gap-2">
        <a href="#/" class="text-xl font-semibold mr-3">try240</a>
        <nav class="flex gap-2 text-sm">
          <a href="#/player" class="btn">Player</a>
          <a href="#/settings" class="btn">Settings</a>
          <a href="#/debug" class="btn hidden">Debug</a>
        </nav>
        <div class="ml-auto flex items-center gap-2">
          <button
            class="btn"
            aria-label="Toggle theme"
            onClick={() => setUI({ theme: theme === 'dark' ? 'light' : 'dark' })}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          {!tokens ? (
            <button class="btn-accent btn" onClick={() => loginWithSpotify()}>
              Login with Spotify
            </button>
          ) : (
            <button class="btn" onClick={() => logoutAndClear()}>Logout</button>
          )}
        </div>
      </div>
    </header>
  );
}