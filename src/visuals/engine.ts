import * as THREE from 'three';
import { useAppStore } from '../store/store';
import { SceneParticles } from './scenes/Particles';
import { SceneFluid } from './scenes/Fluid';
import { SceneRaymarch } from './scenes/Raymarch';
import { SceneTerrain } from './scenes/Terrain';
import { SceneTypography } from './scenes/Typography';

export function initVisualEngine(container: HTMLElement) {
  // Canvas and renderer
  const canvas = document.createElement('canvas');
  canvas.id = 'vis-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const store = useAppStore.getState();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: store.quality.msaa > 0 });
  renderer.setPixelRatio(Math.min(devicePixelRatio, store.quality.renderScale));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--color-bg') || '#000'));

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const scenes: Record<string, any> = {
    particles: new SceneParticles(renderer, camera),
    fluid: new SceneFluid(renderer, camera),
    raymarch: new SceneRaymarch(renderer, camera),
    terrain: new SceneTerrain(renderer, camera),
    typography: new SceneTypography(renderer, camera)
  };

  let running = true;
  const onResize = () => {
    renderer.setPixelRatio(Math.min(devicePixelRatio, useAppStore.getState().quality.renderScale));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    Object.values(scenes).forEach((s) => s.resize(innerWidth, innerHeight));
  };
  addEventListener('resize', onResize);

  let last = performance.now();
  const loop = () => {
    if (!running) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const st = useAppStore.getState();

    const active = scenes[st.scenes.active];
    if (st.scenes.next) {
      const cf = (st.scenes.crossfade ?? 0) + dt / 2; // 2s crossfade
      if (cf >= 1) {
        st.setActiveScene(st.scenes.next);
      } else {
        st.scenes.crossfade = cf;
      }
    }

    active.update(dt, st);
    active.render();

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return function stop() {
    running = false;
    removeEventListener('resize', onResize);
    renderer.dispose();
    canvas.remove();
  };
}