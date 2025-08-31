# try240 — Spotify Visualizer (Vite + TS + Three.js)

Production-ready, privacy‑respecting, audio‑reactive visualizer with PKCE login for Spotify, robust analysis, and VJ tools. Runs locally via Vite and deploys to GitHub Pages with CI.

Live path (after first deploy): https://belisario-afk.github.io/try240/

## Features
- PKCE login with Spotify (no client secret in frontend).
- Playback via Web Playback SDK (Premium) or control active device via Web API.
- 5 visual scenes: Particles, Fluid, Ray‑march Tunnel, Terrain, Typography. Palette‑synced and audio‑reactive.
- Director/VJ tools: scene presets, timeline cues, macro knobs, accessibility modes.
- Audio analysis: FFT (4096/8192), chroma, onset/beat, tempo estimate, debug overlay.
- Recording: export visuals + optional tab audio as WebM (via getDisplayMedia; see note).
- Progressive enhancement: WebGL2 baseline, fallbacks for limited hardware.
- Tailwind‑styled UI, Zustand state, IndexedDB cache.
- CI: lint + test + build + deploy to gh‑pages. Cached dependencies and vite cache.

## Repo and Hosting
- Repo: `belisario-afk/try240`
- Hosted on GitHub Pages branch `gh-pages` via Actions.
- SPA routing uses hash routes; `404.html` redirects to `index.html`.

## Quickstart

1) Prereqs
- Node 18/20, pnpm 9
- A Spotify application

2) Clone and install
```bash
pnpm install
cp .env.example .env
# edit .env with your Spotify Client ID
```

3) Run dev server
```bash
pnpm dev
# Dev URL: http://127.0.0.1:5173
```

4) Build preview
```bash
pnpm build && pnpm preview
```

5) Deploy
- Push to `main`. GitHub Actions builds and deploys to `gh-pages`. Visit https://belisario-afk.github.io/try240/

## Environment

Create `.env` with:
```
SPOTIFY_CLIENT_ID=927fda6918514f96903e828fcd6bb576
# Optional: Forward PKCE token exchange to Spotify token endpoint (no secret needed)
# For local dev, vite proxies /api/token -> https://accounts.spotify.com/api/token.
# For production (GitHub Pages), deploy the provided Cloudflare Worker (below) and set:
TOKEN_EXCHANGE_URL=https://<your-worker>.workers.dev/api/token
# Dev toggles
MOCK=true
ENABLE_WEBGPU=false
SENTRY_DSN=
```

Vite exposes these as defines:
- `__SPOTIFY_CLIENT_ID__`, `__TOKEN_EXCHANGE_URL__`, `__MOCK__`, `__ENABLE_WEBGPU__`, `__SENTRY_DSN__`.

## Spotify App Setup

In Spotify Dashboard:
- App Type: Web App
- Client ID: `927fda6918514f96903e828fcd6bb576`
- Redirect URIs:
  - Local: `http://127.0.0.1:5173/callback`
  - Prod (GitHub Pages): `https://belisario-afk.github.io/try240/callback`
- Scopes (minimal):
  - `user-read-playback-state`
  - `user-modify-playback-state`
  - `user-read-currently-playing`
  - `streaming`
  - `user-read-email`
  - `user-read-private`

Important: Use Authorization Code Flow with PKCE (no client secret in frontend). The token exchange call goes to your token-exchange endpoint (a CORS-friendly proxy) which forwards to Spotify’s token endpoint without adding secrets.

### Token-Exchange Proxy (Serverless)

Deploy one of these minimal proxies:

1) Cloudflare Worker (recommended)
```js
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== '/api/token') return new Response('Not found', { status: 404 });
    const body = await req.text();
    const resp = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    });
    const hdrs = new Headers(resp.headers);
    hdrs.set('access-control-allow-origin', '*');
    hdrs.set('access-control-allow-headers', '*');
    return new Response(resp.body, { status: resp.status, headers: hdrs });
  }
}
```
Set `TOKEN_EXCHANGE_URL=https://<your-worker>.workers.dev/api/token` in `.env`.

2) Vercel/Netlify function: same logic as above.

Never include a client secret; with PKCE it is not required.

## PKCE Flow

- App generates `code_verifier` and `code_challenge`, stores `code_verifier` in sessionStorage.
- Redirects to Spotify authorize with scopes and `code_challenge`.
- Callback at `/callback` extracts `code` and calls the token-exchange proxy with:
  - `client_id`, `grant_type=authorization_code`, `code`, `redirect_uri`, `code_verifier`.
- Receives `access_token` + `refresh_token`, stored client-side with expiry.
- Refresh uses `grant_type=refresh_token` (no secret).

## Playback

- Option A: Web Playback SDK. Button "Init Player" loads SDK and connects a device. Requires Premium.
- Option B: Web API device control. Device picker lists available devices; play/pause/seek/volume use Web API.

## Audio Analysis

Spotify’s SDK does not expose PCM; real-time analysis is provided via:
- Microphone input (user consent) to drive audio-reactive visuals; or
- Mock mode (`MOCK=true`) to simulate features for development; and
- Spotify Audio Features/Analysis endpoints can be optionally polled to seed auto‑cinematic mode (not included by default to limit rate).

Implemented:
- FFT: 8192 (default), 4096 selectable in code.
- Log-frequency bands, chroma (12), spectral centroid, RMS, simple onset/beat worker and tempo estimation (autocorrelation placeholder).
- Debug overlay shows FFT, tempo, beat markers, bars.

## Recording

- Press "r" to start and "s" to stop recording.
- Records canvas via `canvas.captureStream(60)`.
- For audio: prompt to capture tab audio with `getDisplayMedia({ audio: true })`. Chrome/Edge recommended. If permission not granted, recording will be video-only.

Note: DRM/audio capture rules vary; for best results, record tab audio.

## Scenes

- Particles: GPU points with curl-like motion; color follows palette; intensity from RMS.
- Fluid 2D sim (shader-based placeholder): dye advection effect reacting to intensity.
- Ray-marched SDF tunnel: kaleidoscopic neon; steps configurable; intensity from RMS; tempo aware.
- Terrain: heightfield displacement; tempo-locked camera rails; light pulsing.
- Typography: variable-like block reacting to centroid and RMS; glitch control.

Scenes hot-swap at phrase boundaries (simulated in worker; wire real grid when available). Crossfade over ~2s.

## Director / VJ

- Macro knobs: intensity, bloom, glitch, speed.
- Accessible defaults: epilepsy-safe on by default, reduced motion and high contrast toggles.
- Timeline and presets persistence stubbed via Zustand persist and IDB (extend as needed).

## Accessibility

- Epilepsy-safe: caps brightness, reduces flashes.
- Reduced motion: global flag to slow/disable certain effects.
- High-contrast: increases contrast, reduces bloom.
- Keyboard-accessible controls, ARIA labels on buttons.

## CI / GitHub Actions

Workflow:
- Checkout → cache (pnpm + vite) → install → lint → unit tests → build → upload artifact → optional e2e (mock) → deploy to Pages.
- Pages deploys `/dist` to `gh-pages`.
- Artifacts: dist uploaded for debugging.
- Node matrix: 18 and 20. Playwright tests across Chromium/Firefox/WebKit.

## Dev DX

- Strict TypeScript everywhere.
- ESLint + Prettier configured.
- Husky + lint-staged precommit.
- Vitest unit tests for PKCE + tempo.
- Playwright e2e: load → change scene → record (mock mode).
- Vite checker for TS + ESLint in dev.
- Bundle analyzer script prints largest files.

## Base Path

Vite `base` is `/try240/` for production (GitHub Pages). Hash-routing ensures deep links work. `404.html` redirects to `#/`.

## Security & Privacy

- No client secrets in repo.
- Do not log access tokens. They are kept in memory/persist (Zustand persist excludes tokens).
- Client secret rotation:
  1. Rotate in Spotify Dashboard.
  2. Update any server-side usages (not used here).
  3. Revoke compromised tokens in Dashboard.
- Revoke tokens: Remove refresh tokens in user’s account/apps; users can revoke app access.
- Never commit `.env` with any secrets.

## Troubleshooting

- Web Playback SDK not ready:
  - Ensure Premium account; click "Init Player".
  - Accept playback device in Spotify client if prompted (device transfer).
- CORS on token exchange:
  - Use local dev proxy (/api/token via Vite).
  - For production, deploy the Cloudflare Worker and set `TOKEN_EXCHANGE_URL`.
- White/black screen:
  - Check WebGL2 support (chrome://gpu). Fallback shaders are lightweight.
  - Update GPU drivers; toggle "Reduced motion".
- Audio not reactive:
  - Grant microphone permission or enable Mock mode.
  - Recording with audio needs getDisplayMedia with audio.
- Rate limits (429):
  - The app retries with exponential backoff; consider reducing polling.
- Shader errors:
  - Open DevTools; shader compile errors are surfaced in console.
- Performance:
  - Lower render scale, MSAA; set target FPS 30.
  - Close other GPU-intensive tabs.
- MIDI mapping:
  - Stubbed; extend via Web MIDI API and map to VJ macros.

## Developer Debugging & Profiling

- Chrome performance panel: record 10s during playback; look for "scripting" spikes in visuals.
- WebAudio: use chrome://webrtc-internals if capturing tab audio.
- WebGL State: enable "WebGL insights" extensions; capture frame in Performance tab.
- Shader profiling: tweak raymarch steps and shadow samples in Quality panel.
- Memory: Performance monitor overlay; Chrome Task Manager for GPU memory.
- Network: Verify token refresh and retry logic on 401/429 in DevTools.

## Acceptance Test Checklist

- [ ] PKCE login flow functions (login + token refresh) without any client secret in repo.
- [ ] Playback via Web Playback SDK for Premium; API control otherwise.
- [ ] 5 scenes implemented, palette-synced, audio-reactive.
- [ ] Scene crossfades at phrase boundaries (simulated beat grid; replace with real when available).
- [ ] Quality panel affects visuals and performance (render scale, MSAA, raymarch steps).
- [ ] Director/VJ controls persist across sessions (Zustand persist).
- [ ] Recording exports WebM; with tab audio when granted.
- [ ] Accessibility toggles: epilepsy-safe, reduced-motion, high-contrast.
- [ ] No secrets committed.

## Local Mock Mode

Set `MOCK=true` in `.env` to enable simulated analysis and skip Spotify. Useful for UI/visuals dev and CI.

## Contributing

- pnpm install
- pnpm dev
- pnpm test
- pnpm test:e2e

## License

MIT © belisario-afk