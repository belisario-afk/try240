import * as THREE from 'three';
import type { AppState } from '../../store/store';

export class SceneTerrain {
  private scene = new THREE.Scene();
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private mesh: THREE.Mesh;
  private uniforms: { [k: string]: THREE.IUniform };

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.renderer = renderer;
    this.camera = camera as THREE.PerspectiveCamera;
    this.camera.position.set(0, 2, 5);

    this.uniforms = {
      u_time: { value: 0 },
      u_bars: { value: 0 },
      u_intensity: { value: 0.5 }
    };
    const geom = new THREE.PlaneGeometry(20, 20, 256, 256);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      wireframe: false,
      vertexShader: `
      uniform float u_time; uniform float u_intensity; uniform float u_bars;
      varying vec3 vPos;
      float fbm(vec2 p){
        float v=0.0; float a=0.5; vec2 shift=vec2(100.0);
        for(int i=0;i<5;i++){ v+=a*fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); p*=2.0; a*=0.5; }
        return v;
      }
      void main(){
        vPos = position;
        float h = fbm(position.xz*0.3 + u_time*0.05) * (0.4 + u_intensity);
        vec3 p = position; p.y += h;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      }`,
      fragmentShader: `
      varying vec3 vPos;
      uniform float u_bars;
      void main(){
        float m = smoothstep(0.0,1.0,abs(sin(u_bars*0.5 + vPos.x*0.2)));
        vec3 col = mix(vec3(0.02,0.05,0.08), vec3(0.1,0.8,0.6), m);
        gl_FragColor = vec4(col,1.0);
      }`
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.mesh);

    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(2, 5, 2);
    this.scene.add(light);
  }

  resize(_w: number, _h: number) {}

  update(dt: number, st: AppState) {
    const u = this.uniforms as any;
    u.u_time.value = (u.u_time.value ?? 0) + dt;
    u.u_intensity.value = st.vj.macroIntensity + (st.analysis.frame?.rms || 0) * 0.8;
    u.u_bars.value = st.analysis.frame?.bar || 0;
    (this.camera as THREE.PerspectiveCamera).position.z = 5 + Math.sin((u.u_time.value ?? 0) * 0.3) * 0.5;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}