import * as THREE from 'three';
import type { AppState } from '../../store/store';

export class SceneRaymarch {
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
      u_steps: { value: 512 },
      u_bpm: { value: 120.0 },
      u_intensity: { value: 0.5 },
      u_res: { value: new THREE.Vector2(innerWidth, innerHeight) }
    };
    const geom = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: `
      precision highp float;
      uniform vec2 u_res; uniform float u_time; uniform float u_intensity; uniform float u_bpm; uniform int u_steps;
      float sdTorus( vec3 p, vec2 t ) { vec2 q = vec2(length(p.xz)-t.x,p.y); return length(q)-t.y; }
      float map(vec3 p){
        float k = 0.6 + 0.4*sin(u_time*0.5);
        p.xy *= mat2(cos(k),-sin(k),sin(k),cos(k));
        return sdTorus(p, vec2(1.2, 0.3+0.2*sin(u_time)));
      }
      void main(){
        vec2 uv = (gl_FragCoord.xy/u_res)*2.0-1.0;
        vec3 ro = vec3(0.0,0.0,-3.5);
        vec3 rd = normalize(vec3(uv,1.5));
        float t=0.0; float d; vec3 p;
        vec3 col = vec3(0.0);
        for(int i=0;i<1024;i++){
          if(i>=u_steps) break;
          p = ro + rd*t;
          d = map(p);
          if(d<0.001){ 
            float glow = 0.2 + 0.8*exp(-abs(d)*10.0);
            col += glow*vec3(0.2,1.0,0.6)*u_intensity;
            break;
          }
          t += d*0.5;
          col += 0.005*vec3(0.02,0.03,0.04);
        }
        gl_FragColor = vec4(col,1.0);
      }`,
      vertexShader: `void main(){ gl_Position = vec4(position,1.0); }`
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.mesh);
  }

  resize(w: number, h: number) {
    const u = this.uniforms as any;
    u.u_res.value.set(w, h);
  }

  update(dt: number, st: AppState) {
    const u = this.uniforms as any;
    u.u_time.value = (u.u_time.value ?? 0) + dt * (0.6 + st.vj.macroSpeed * 0.4);
    u.u_intensity.value = Math.min(1, st.vj.macroIntensity + (st.analysis.frame?.rms || 0.2) * 1.5);
    u.u_bpm.value = st.analysis.frame?.tempoBPM || 120;
    u.u_steps.value = st.quality.raymarchSteps;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}