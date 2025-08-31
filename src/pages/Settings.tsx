import { useAppStore } from '../store/store';

export function Settings() {
  const env = useAppStore((s) => s.env);
  const ui = useAppStore((s) => s.ui);
  return (
    <section class="panel m-2 mt-24">
      <h2 class="text-lg font-semibold">Settings</h2>
      <div class="mt-2 text-sm">
        <div>Version: {env.version}</div>
        <div>Mock mode: {env.mock ? 'on' : 'off'}</div>
        <div>Theme: {ui.theme}</div>
      </div>
      <div class="mt-4 text-xs opacity-80">
        Configure environment via .env and optional token exchange endpoint for PKCE.
      </div>
    </section>
  );
}