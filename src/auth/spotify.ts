import { useAppStore } from '../store/store';
import { createPKCE, getPKCEVerifier } from './pkce';
import { backoff } from '../utils/network';
import * as ENV from '../env';

const CLIENT_ID = ENV.SPOTIFY_CLIENT_ID;
const TOKEN_EXCHANGE_URL = ENV.TOKEN_EXCHANGE_URL;

export function getRedirectUri() {
  // On GitHub Pages, use a path (no hash) and rely on 404.html SPA fallback.
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
  const { challenge } = await createPKCE();
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
  if (res.status === 204) return undefined as unknown as T;
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
      player = new (window as any).Spotify.Player({
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

export type Device = { id: string; name: string; is_active: boolean };

export async function getAvailableDevices(): Promise<Device[]> {
  const data = await api<{ devices: Array<{ id: string; name: string; is_active: boolean }> }>(
    '/me/player/devices',
    { method: 'GET' }
  );
  return (data.devices || []).map((d) => ({ id: d.id, name: d.name, is_active: d.is_active }));
}

export async function play(deviceId?: string) {
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';
  await api<void>(`/me/player/play${qs}`, { method: 'PUT' });
  useAppStore.getState().setPlayer({ playing: true });
}

export async function pause() {
  await api<void>('/me/player/pause', { method: 'PUT' });
  useAppStore.getState().setPlayer({ playing: false });
}

export async function seek(positionMs: number) {
  const qs = `?position_ms=${Math.max(0, Math.floor(positionMs))}`;
  await api<void>(`/me/player/seek${qs}`, { method: 'PUT' });
  useAppStore.getState().setPlayer({ positionMs: Math.max(0, Math.floor(positionMs)) });
}

export async function setVolume(v: number) {
  const percent = Math.round(Math.min(1, Math.max(0, v)) * 100);
  await api<void>(`/me/player/volume?volume_percent=${percent}`, { method: 'PUT' });
  useAppStore.getState().setPlayer({ volume: percent / 100 });
}

export function logoutAndClear() {
  try {
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('pkce_verifier');
  } catch {}
  const s = useAppStore.getState();
  (s as any).setTokens?.(undefined);
  s.setPlayer({ playing: false, positionMs: 0, deviceId: undefined as any });
  if (location.hostname.endsWith('github.io')) {
    location.hash = '#/';
  } else {
    location.assign('/');
  }
  try {
    // @ts-ignore
    player?.disconnect?.();
  } catch {}
  player = null;
}