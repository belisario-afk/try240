export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (e) => {
    console.error('Global error', e.error || e.message || e);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection', e.reason || e);
  });
}