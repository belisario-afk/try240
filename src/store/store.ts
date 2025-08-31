import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysisFrame, DirectorTimeline, Env, QualityState, SceneId, TokenBundle, UIState, VJState } from './types';

type PlayerState = {
  isPremium: boolean;
  deviceId?: string;
  playing: boolean;
  positionMs: number;
  volume: number;
  currentTrack?: import('./types').Track;
};

export type AppState = {
  env: Env;
  tokens?: TokenBundle;
  scenes: { active: SceneId; next?: SceneId; crossfade: number; available: SceneId[] };
  ui: UIState;
  quality: QualityState;
  vj: VJState;
  director: DirectorTimeline;
  analysis: {
    frame: AnalysisFrame | null;
    tempoBPM: number | null;
    bar: number;
    beatNow: boolean;
    stats: { fps: number; gpuMemMB?: number; audioLatencyMs?: number };
    debugLog: string[];
  };
  player: PlayerState;

  // actions
  setEnv: (env: Partial<Env>) => void;
  setTokens: (t?: TokenBundle) => void;
  logout: () => void;
  setActiveScene: (id: SceneId) => void;
  scheduleScene: (id: SceneId) => void;
  setUI: (p: Partial<UIState>) => void;
  setQuality: (p: Partial<QualityState>) => void;
  setVJ: (p: Partial<VJState>) => void;
  setDirector: (d: Partial<DirectorTimeline>) => void;
  pushDebug: (line: string) => void;
  updateAnalysis: (f: Partial<AnalysisFrame> & { ts?: number }) => void;
  setPlayer: (p: Partial<PlayerState>) => void;
};

const defaultState: Pick<AppState, 'ui' | 'quality' | 'vj' | 'director'> = {
  ui: {
    theme: 'dark',
    highContrast: false,
    reducedMotion: false,
    epilepsySafe: true,
    debug: false,
    hud: true
  },
  quality: {
    renderScale: 1.0,
    targetFPS: 60,
    msaa: 4,
    taa: true,
    ssgi: false,
    motionBlur: false,
    dof: false,
    bloom: true,
    raymarchSteps: 512,
    softShadowSamples: 16
  },
  vj: {
    macroIntensity: 0.6,
    macroBloom: 0.5,
    macroGlitch: 0.1,
    macroSpeed: 1.0,
    liveMode: false,
    midiEnabled: false
  },
  director: {
    cues: [],
    loops: [],
    version: 1
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      env: { version: '0', mock: false, enableWebGPU: false, basePath: '/' },
      tokens: undefined,
      scenes: { active: 'particles', next: undefined, crossfade: 0, available: ['particles', 'fluid', 'raymarch', 'terrain', 'typography'] },
      ...defaultState,
      analysis: {
        frame: null,
        tempoBPM: null,
        bar: 0,
        beatNow: false,
        stats: { fps: 0 },
        debugLog: []
      },
      player: { isPremium: false, playing: false, positionMs: 0, volume: 0.5 },

      setEnv: (env) => set((s) => ({ env: { ...s.env, ...env } })),
      setTokens: (t) => set({ tokens: t }),
      logout: () => set({ tokens: undefined }),
      setActiveScene: (id) => set((s) => ({ scenes: { ...s.scenes, active: id, next: undefined, crossfade: 0 } })),
      scheduleScene: (id) => set((s) => ({ scenes: { ...s.scenes, next: id, crossfade: 0 } })),
      setUI: (p) => set((s) => ({ ui: { ...s.ui, ...p } })),
      setQuality: (p) => set((s) => ({ quality: { ...s.quality, ...p } })),
      setVJ: (p) => set((s) => ({ vj: { ...s.vj, ...p } })),
      setDirector: (d) => set((s) => ({ director: { ...s.director, ...d } })),
      pushDebug: (line) =>
        set((s) => {
          const debugLog = s.analysis.debugLog.concat(line).slice(-200);
          return { analysis: { ...s.analysis, debugLog } };
        }),
      updateAnalysis: (f) =>
        set((s) => {
          const now = performance.now() / 1000;
          const frame: any = { ...(s.analysis.frame || {}), ...f, ts: f.ts ?? now };
          return { analysis: { ...s.analysis, frame } };
        }),
      setPlayer: (p) => set((s) => ({ player: { ...s.player, ...p } }))
    }),
    {
      name: 'try240-store',
      partialize: (s) => ({
        ui: s.ui,
        quality: s.quality,
        vj: s.vj,
        director: s.director,
        scenes: s.scenes
      })
    }
  )
);