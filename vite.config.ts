import { defineConfig, loadEnv } from 'vite';
import preact from '@preact/preset-vite';
import glsl from 'vite-plugin-glsl';
import checker from 'vite-plugin-checker';
import fs from 'node:fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = mode === 'production' ? '/try240/' : '/';

  return {
    base,
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
      __MOCK__: JSON.stringify(env.MOCK ?? ''),
      __SENTRY_DSN__: JSON.stringify(env.SENTRY_DSN ?? ''),
      __SPOTIFY_CLIENT_ID__: JSON.stringify(env.SPOTIFY_CLIENT_ID ?? ''),
      __TOKEN_EXCHANGE_URL__: JSON.stringify(env.TOKEN_EXCHANGE_URL ?? '/api/token'),
      __ENABLE_WEBGPU__: JSON.stringify(env.ENABLE_WEBGPU ?? 'false')
    },
    plugins: [
      preact(),
      glsl({ include: ['**/*.glsl', '**/*.vert', '**/*.frag'] }),
      checker({ typescript: true }),
      {
        name: 'gh-pages-404-fallback',
        closeBundle() {
          try {
            if (fs.existsSync('dist/index.html')) {
              fs.copyFileSync('dist/index.html', 'dist/404.html');
            }
          } catch (e) {
            console.warn('Failed to create 404.html fallback', e);
          }
        }
      }
    ]
  };
});