import * as Sentry from '@sentry/browser';

function isGitHubPagesHost() {
  try {
    return typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
  } catch {
    return false;
  }
}

function isOptInEnabled() {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem('sentry') === 'on';
  } catch {
    return false;
  }
}

export function initSentry(dsn: string) {
  // Do not initialize if DSN is missing
  if (!dsn) return;

  // On GitHub Pages, disable Sentry by default to avoid adblock console noise.
  // You can opt-in at runtime with: localStorage.setItem('sentry', 'on')
  if (isGitHubPagesHost() && !isOptInEnabled()) return;

  try {
    Sentry.init({
      dsn,
      // Reduce network activity
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      // Avoid integrations that can post automatically on startup
      integrations: (defaults) =>
        defaults.filter((i: any) => !['BrowserTracing', 'Replay'].includes(i?.name)),
      // These may not exist in all versions; safe to ignore if unsupported
      // @ts-ignore
      autoSessionTracking: false,
      // @ts-ignore
      sendClientReports: false
    });
  } catch {
    // Swallow any init errors
  }
}