import * as Sentry from '@sentry/browser';

export function initSentry(dsn: string) {
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
}