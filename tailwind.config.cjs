/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-bg)',
        foreground: 'var(--color-fg)',
        accent: 'var(--color-accent)'
      }
    }
  },
  plugins: []
};