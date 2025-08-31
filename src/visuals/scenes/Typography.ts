import * as THREE from 'three';
import type { AppState } from '../../store/store';

export class SceneTypography {
  private scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private mesh: THREE.Mesh;
  private uniforms: { [k: string]: THREE.IUniform };

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.renderer = renderer;
    this.camera = camera;

    this.uniforms = {
      u_time: { value: 0 },
      u_centroid: { value: 0.2 },
      u_rms: { value: 0.1 },
      u_glitch: { value: 0.1 },
      u_res: { value: new THREE.Vector2(innerWidth, innerHeight) }
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: `
      precision mediump float;
      uniform vec2 u_res; uniform float u_time; uniform float u_centroid; uniform float u_rms; uniform float u_glitch;
      float sdBox(vec2 p, vec2 b){ vec2 q = abs(p) - b; return length(max(q,0.0)) + min(max(q.x,q.y),0.0); }
      void main(){
        vec2 uv = (gl_FragCoord.xy/u_res)*2.0-1.0;
        float t = u_time;
        float g = step(0.9, fract(sin(dot(uv,vec2(12.9898, 78.233))+t)*43758.5453 + u_glitch));
        float w = 0.6 + 0.3*sin(t*2.0 + u_centroid*3.1415);
        float s = sdBox(uv, vec2(w, 0.2 + u_rms));
        float m = smoothstep(0.02, 0.0, s);
        vec3 base = mix(vec3(0.9,0.9,1.0), vec3(0.2,1.0,0.6), u_centroid);
        vec3 col = mix(base, vec3(1.0,0.2,0.4), g*0.1);
        gl_FragColor = vec4(col*m,1.0);
      }`,
      vertexShader: `void main(){ gl_Position = vec4(position,1.0); }`
    });
    const geom = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.mesh);
  }

  resize(w: number, h: number) {
    const u = this.uniforms as any;
    u.u_res.value.set(w, h);
  }

  update(dt: number, st: AppState) {
    const rms = st.analysis.frame?.rms || 0;
    const centroid = (st.analysis.frame?.spectralCentroid || 500) / 5000;
    const u = this.uniforms as any;
    u.u_time.value = (u.u_time.value ?? 0) + dt * (0.7 + st.vj.macroSpeed);
    u.u_rms.value = rms;
    u.u_centroid.value = centroid;
    u.u_glitch.value = st.vj.macroGlitch;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}