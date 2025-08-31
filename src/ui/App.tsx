import { Router, Route } from './router';
import { HeaderBar } from './components/HeaderBar';
import { PlayerControls } from './components/PlayerControls';
import { ScenePicker } from './components/ScenePicker';
import { QualityPanel } from './components/QualityPanel';
import { VJPanel } from './components/VJPanel';
import { DebugOverlay } from './components/DebugOverlay';
import { Settings } from '../pages/Settings';
import { Callback } from '../pages/Callback';
import { Home } from '../pages/Home';
import { Player } from '../pages/Player';
import { useAppStore } from '../store/store';

export function App() {
  const theme = useAppStore((s) => s.ui.theme);
  const highContrast = useAppStore((s) => s.ui.highContrast);
  const epilepsySafe = useAppStore((s) => s.ui.epilepsySafe);
  return (
    <div
      data-theme={theme}
      data-contrast={highContrast ? 'high' : 'normal'}
      data-epilepsy-safe={epilepsySafe ? 'on' : 'off'}
      class="h-full"
    >
      <HeaderBar />
      <div id="vis-container" aria-hidden="true"></div>
      <main class="fixed inset-x-0 bottom-0 z-20">
        <div class="m-2 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <PlayerControls />
          <ScenePicker />
          <QualityPanel />
          <VJPanel />
        </div>
      </main>
      <DebugOverlay />
      <Router>
        <Route path="/" component={Home} />
        <Route path="/player" component={Player} />
        <Route path="/settings" component={Settings} />
        <Route path="/callback" component={Callback} />
      </Router>
    </div>
  );
}