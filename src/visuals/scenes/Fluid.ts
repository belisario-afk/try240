import * as THREE from 'three';
import type { AppState } from '../../store/store';

export class SceneFluid {
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
      u_intensity: { value: 0.5 },
      u_res: { value: new THREE.Vector2(1, 1) }
    };
    const geom = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: `
      uniform vec2 u_res; uniform float u_time; uniform float u_intensity;
      // Simple dye advection-like shader (visual placeholder)
      float hash(vec2 p){ return fract(sin(dot(p,vec2(41.0,289.0)))*43758.5453); }
      void main(){
        vec2 uv = gl_FragCoord.xy/u_res;
        vec2 p = uv*2.0-1.0;
        float t = u_time*0.25;
        float v = 0.0;
        for(int i=0;i<5;i++){
          p = vec2(p.x + sin(p.y*2.1+t)*0.2, p.y + cos(p.x*2.3-t)*0.2);
          v += length(p);
        }
        v = sin(v*3.0 + t*2.0);
        vec3 col = 0.5 + 0.5*cos(vec3(0.0,2.0,4.0)+v + u_intensity);
        gl_FragColor = vec4(col, 1.0);
      }`,
      vertexShader: `void main(){ gl_Position = vec4(position,1.0); }`
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.mesh);
    this.resize(innerWidth, innerHeight);
  }

  resize(w: number, h: number) {
    const u = this.uniforms as any;
    u.u_res.value.set(w, h);
  }

  update(dt: number, st: AppState) {
    const u = this.uniforms as any;
    u.u_time.value = (u.u_time.value ?? 0) + dt * (1.0 + st.vj.macroSpeed);
    u.u_intensity.value = Math.min(1, st.vj.macroIntensity + (st.analysis.frame?.rms || 0.2) * 2.0);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}