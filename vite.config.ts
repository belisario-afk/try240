import { defineConfig, loadEnv } from 'vite';
import preact from '@preact/preset-vite';
import glsl from 'vite-plugin-glsl';
import checker from 'vite-plugin-checker';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = mode === 'production' ? '/try240/' : '/';

  return {
    base,
    plugins: [
      preact(),
      glsl({
        watch: true,
        warnDuplicatedImports: false,
        include: ['**/*.glsl', '**/*.vert', '**/*.frag'],
      }),
      // Run only TypeScript checker; ESLint runs via `pnpm lint` separately.
      checker({
        typescript: true,
        // Disable ESLint integration to avoid ESLint v9 option incompatibility during Vitest/Vite runs
        // eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
      }),
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api/token': {
          target: 'https://accounts.spotify.com',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/token/, '/api/token'),
        },
      },
    },
    build: {
      sourcemap: true,
      target: 'es2020',
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __MOCK__: JSON.stringify(env.MOCK || 'false'),
      __SENTRY_DSN__: JSON.stringify(env.SENTRY_DSN || ''),
      __SPOTIFY_CLIENT_ID__: JSON.stringify(env.SPOTIFY_CLIENT_ID || ''),
      __TOKEN_EXCHANGE_URL__: JSON.stringify(env.TOKEN_EXCHANGE_URL || '/api/token'),
      __ENABLE_WEBGPU__: JSON.stringify(env.ENABLE_WEBGPU || 'false'),
    },
    optimizeDeps: {
      include: ['three', 'zustand'],
    },
  };
});