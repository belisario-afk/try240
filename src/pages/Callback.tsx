import { useEffect } from 'preact/hooks';
import { exchangeCodeForToken } from '../auth/spotify';
import { useAppStore } from '../store/store';

export function Callback() {
  const setTokens = useAppStore((s) => s.setTokens);
  const pushDebug = useAppStore((s) => s.pushDebug);

  useEffect(() => {
    (async () => {
      try {
        const tokens = await exchangeCodeForToken();
        setTokens(tokens);
        pushDebug('PKCE exchange completed.');
        location.replace('#/player');
      } catch (e: any) {
        pushDebug('PKCE callback error: ' + (e?.message || e));
        alert('Auth failed. See console for details.');
        location.replace('#/');
      }
    })();
  }, [setTokens, pushDebug]);

  return <div class="panel m-2 mt-24">Completing login…</div>;
}