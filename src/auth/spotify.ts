import { useAppStore } from '../store/store';
import { createPKCE, getPKCEVerifier } from './pkce';
import { backoff } from '../utils/network';

const CLIENT_ID = __SPOTIFY_CLIENT_ID__;
const TOKEN_EXCHANGE_URL = __TOKEN_EXCHANGE_URL__;

export function getRedirectUri() {
  // Use hash-router callback
  if (location.hostname.endsWith('github.io')) {
    return `${location.origin}/try240/callback`;
  }
  return `${location.protocol}//${location.host}/callback`;
}

export function getScopes(): string[] {
  return [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-read-email',
    'user-read-private'
  ];
}

export async function loginWithSpotify() {
  const { challenge, verifier } = await createPKCE();
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauth_state', state);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
    scope: getScopes().join(' ')
  });
  location.assign(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

export async function exchangeCodeForToken() {
  const url = new URL(location.href);
  const code = url.searchParams.get('code') || url.hash.match(/code=([^&]+)/)?.[1];
  const state = url.searchParams.get('state') || url.hash.match(/state=([^&]+)/)?.[1];
  const expected = sessionStorage.getItem('oauth_state');
  if (!code) throw new Error('Missing code.');
  if (!state || state !== expected) throw new Error('Invalid state.');
  const code_verifier = getPKCEVerifier();

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    code_verifier
  });

  // Use token-exchange endpoint (proxy) to avoid CORS. For dev, vite proxy handles /api/token.
  const res = await fetch(TOKEN_EXCHANGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  const tokens = {
    ...json,
    obtained_at: Date.now()
  };
  useAppStore.getState().setTokens(tokens);
  history.replaceState(null, '', '#/player');
  return tokens;
}

function tokenExpired(tokens: any) {
  if (!tokens) return true;
  const age = (Date.now() - tokens.obtained_at) / 1000;
  return age >= (tokens.expires_in || 3600) - 60;
}

export async function refreshTokenIfNeeded() {
  const s = useAppStore.getState();
  const t = s.tokens;
  if (!t) return;
  if (!tokenExpired(t)) return;
  if (!t.refresh_token) return;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: t.refresh_token
  });
  const res = await fetch(TOKEN_EXCHANGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) throw new Error('Failed to refresh token');
  const json = await res.json();
  const tokens = {
    ...t,
    ...json,
    obtained_at: Date.now()
  };
  s.setTokens(tokens);
}

export function getAuthHeader() {
  const t = useAppStore.getState().tokens;
  if (!t) throw new Error('No tokens.');
  return { Authorization: `Bearer ${t.access_token}` };
}

export async function api<T>(path: string, init?: RequestInit, retry = 0): Promise<T> {
  await refreshTokenIfNeeded();
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader(), ...(init?.headers || {}) };
  const url = `https://api.spotify.com/v1${path}`;
  const res = await fetch(url, { ...init, headers });
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After') || '1');
    await backoff(retryAfter * 1000 + 50);
    if (retry < 5) return api(path, init, retry + 1);
  }
  if (res.status === 401 && retry < 1) {
    await refreshTokenIfNeeded();
    return api(path, init, retry + 1);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  return res.json();
}

// Web Playback SDK integration
let player: any | null = null;

export async function ensurePlayer() {
  if (player) return player;
  await refreshTokenIfNeeded();
  await loadSpotifySDK();
  const token = useAppStore.getState().tokens?.access_token!;
  return new Promise((resolve) => {
    // @ts-ignore
    window.onSpotifyWebPlaybackSDKReady = () => {
      // @ts-ignore
      player = new window.Spotify.Player({
        name: 'try240 Visualizer Player',
        getOAuthToken: (cb: (t: string) => void) => cb(token),
        volume: useAppStore.getState().player.volume
      });
      player.addListener('ready', ({ device_id }: any) => {
        useAppStore.getState().setPlayer({ deviceId: device_id, isPremium: true });
      });
      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        useAppStore.getState().setPlayer({
          playing: !state.paused,
          positionMs: state.position
        });
      });
      player.addListener('initialization_error', ({ message }: any) => console.error(message));
      player.addListener('authentication_error', ({ message }: any) => console.error(message));
      player.addListener('account_error', ({ message }: any) => console.error(message));
      player.connect().then(() => resolve(player));
    };
  });
}

async function loadSpotifySDK() {
  if (document.getElementById('spotify-sdk')) return;
  const s = document.createElement('script');
  s.id = 'spotify-sdk';
  s.src = 'https://sdk.scdn.co/spotify-player.js';
  s.async = true;
  document.body.appendChild(s);
}

export async function getAvailableDevices(): Promise<{ id: string; name: string; is_active: boolean }[]> {
  const data = await api<{ devices: { id: string; name: string; is_active: boolean }[] }>('/me/player/devices');
  return data.devices;
}

export async function transferPlaybackToDevice(deviceId: string) {
  return api('/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], play: false })
  });
}

export async function play() {
  const st = useAppStore.getState();
  const deviceId = st.player.deviceId;
  if (player && deviceId) {
    await transferPlaybackToDevice(deviceId);
    await api(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, { method: 'PUT' });
    st.setPlayer({ playing: true });
  } else {
    throw new Error('Player not initialized or device not selected.');
  }
}

export async function pause() {
  await api('/me/player/pause', { method: 'PUT' });
  useAppStore.getState().setPlayer({ playing: false });
}

export async function seek(positionMs: number) {
  await api(`/me/player/seek?position_ms=${Math.round(positionMs)}`, { method: 'PUT' });
}

export async function setVolume(volume: number) {
  await api(`/me/player/volume?volume_percent=${Math.round(volume * 100)}`, { method: 'PUT' });
}
export function logoutAndClear() {
  useAppStore.getState().setTokens(undefined);
  location.hash = '#/';
}