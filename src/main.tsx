import { render } from 'preact';
import { useEffect } from 'preact/hooks';
import './styles/index.css';
import { App } from './ui/App';
import { initSentry } from './observability/sentry';
import { useAppStore } from './store/store';
import { setupGlobalErrorHandlers } from './utils/errors';

// Initialize Sentry if DSN is provided
initSentry(typeof __SENTRY_DSN__ === 'string' ? __SENTRY_DSN__ : '');

setupGlobalErrorHandlers();

function Root() {
  const setEnv = useAppStore((s) => s.setEnv);
  useEffect(() => {
    setEnv({
      version: __APP_VERSION__,
      mock: __MOCK__ === 'true',
      enableWebGPU: __ENABLE_WEBGPU__ === 'true',
      basePath: import.meta.env.BASE_URL
    });
  }, [setEnv]);
  return <App />;
}

render(<Root />, document.getElementById('root')!);