// Guard against missing Vite defines and use import.meta.env fallbacks
export const APP_VERSION =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : (import.meta as any)?.env?.APP_VERSION ?? '0.0.0';

export const MOCK =
  typeof __MOCK__ !== 'undefined' ? __MOCK__ : (import.meta as any)?.env?.MOCK ?? '';

export const SENTRY_DSN =
  typeof __SENTRY_DSN__ !== 'undefined' ? __SENTRY_DSN__ : (import.meta as any)?.env?.VITE_SENTRY_DSN ?? '';

export const SPOTIFY_CLIENT_ID =
  typeof __SPOTIFY_CLIENT_ID__ !== 'undefined'
    ? __SPOTIFY_CLIENT_ID__
    : (import.meta as any)?.env?.VITE_SPOTIFY_CLIENT_ID ??
      (import.meta as any)?.env?.SPOTIFY_CLIENT_ID ??
      '';

export const TOKEN_EXCHANGE_URL =
  typeof __TOKEN_EXCHANGE_URL__ !== 'undefined'
    ? __TOKEN_EXCHANGE_URL__
    : (import.meta as any)?.env?.VITE_TOKEN_EXCHANGE_URL ??
      (import.meta as any)?.env?.TOKEN_EXCHANGE_URL ??
      '/api/token';

export const ENABLE_WEBGPU =
  typeof __ENABLE_WEBGPU__ !== 'undefined' ? __ENABLE_WEBGPU__ : (import.meta as any)?.env?.ENABLE_WEBGPU ?? 'false';