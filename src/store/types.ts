export type Env = {
  version: string;
  mock: boolean;
  enableWebGPU: boolean;
  basePath: string;
};

export type TokenBundle = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
  refresh_token?: string;
  scope: string;
  obtained_at: number; // epoch ms
};

export type Track = {
  id: string;
  name: string;
  artists: string[];
  album: { id: string; name: string; images: { url: string; width: number; height: number }[] };
  duration_ms: number;
  preview_url?: string | null;
  uri: string;
};

export type AnalysisFrame = {
  ts: number; // seconds
  rms: number;
  loudnessLUFS: number;
  spectralCentroid: number;
  fft: Float32Array; // log-frequency energy
  chroma: Float32Array; // 12 bins
  onset: boolean;
  beat: boolean;
  bar: number; // bar count
  tempoBPM: number;
};

export type SceneId = 'particles' | 'fluid' | 'raymarch' | 'terrain' | 'typography';

export type UIState = {
  theme: 'dark' | 'light';
  highContrast: boolean;
  reducedMotion: boolean;
  epilepsySafe: boolean;
  debug: boolean;
  hud: boolean;
};

export type QualityState = {
  renderScale: number; // 1.0-2.0
  targetFPS: 30 | 60 | 120;
  msaa: 0 | 2 | 4 | 8;
  taa: boolean;
  ssgi: boolean;
  motionBlur: boolean;
  dof: boolean;
  bloom: boolean;
  raymarchSteps: 256 | 512 | 768 | 1024;
  softShadowSamples: 8 | 16 | 32 | 64;
};

export type VJState = {
  macroIntensity: number;
  macroBloom: number;
  macroGlitch: number;
  macroSpeed: number;
  liveMode: boolean;
  midiEnabled: boolean;
};

export type DirectorTimeline = {
  cues: { timeSec: number; scene: SceneId; params?: Record<string, number> }[];
  loops: { startSec: number; endSec: number }[];
  version: number;
};