import * as THREE from 'three';
import type { AppState } from '../../store/store';

export class SceneParticles {
  private scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private particles: THREE.Points;
  private uniforms: { [k: string]: THREE.IUniform };

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.renderer = renderer;
    this.camera = camera;

    const geom = new THREE.BufferGeometry();
    const N = 20000;
    const positions = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.uniforms = {
      u_time: { value: 0 },
      u_intensity: { value: 0.5 },
      u_color: { value: new THREE.Color('#1db954') }
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
      uniform float u_time; uniform float u_intensity;
      varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(p.y*0.5 + u_time)*0.1*u_intensity;
        p.y += cos(p.x*0.5 + u_time)*0.1*u_intensity;
        vA = u_intensity;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        gl_PointSize = 2.0 + 6.0*u_intensity;
      }`,
      fragmentShader: `
      uniform vec3 u_color; varying float vA;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = dot(uv,uv);
        float a = smoothstep(0.25, 0.0, d) * vA;
        gl_FragColor = vec4(u_color, a);
      }`
    });

    this.particles = new THREE.Points(geom, mat);
    this.scene.add(this.particles);
  }

  resize(_w: number, _h: number) {}

  update(dt: number, st: AppState) {
    const u = this.uniforms as any;
    u.u_time.value = (u.u_time.value ?? 0) + dt * (0.5 + st.vj.macroSpeed);
    u.u_intensity.value = Math.min(1, st.vj.macroIntensity + (st.analysis.frame?.rms || 0) * 2);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent') || '#1db954';
    (u.u_color.value as THREE.Color).set(accent.trim());
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}