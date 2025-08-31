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