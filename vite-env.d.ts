/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __MOCK__: string;
declare const __SENTRY_DSN__: string;
declare const __SPOTIFY_CLIENT_ID__: string;
declare const __TOKEN_EXCHANGE_URL__: string;
declare const __ENABLE_WEBGPU__: string;

interface Window {
  Spotify?: any;
}