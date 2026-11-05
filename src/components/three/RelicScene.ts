/**
 * The /works relic viewer: one relic at a time on a stone pedestal, turning slowly under one ember
 * light (the only dynamic light, flickering a little), and it can be dragged to turn. The canvas is
 * transparent, so the card's own glow and the page's fog show around the relic.
 * Models load with GLTFLoader + MeshoptDecoder (the `npm run models` output) and are cached per URL
 * while the page lives; each is scaled to stand RELIC_HEIGHT tall on the pedestal. A procedural
 * shard stands in when a model fails to load, and for testing (RelicViewer: ?quality=high).
 * Lifecycle: renders only while the canvas is on screen and the tab is visible; dispose() frees
 * every GPU resource (RelicViewer calls it on astro:before-swap). DPR capped by quality tier.
 */
import {
  ACESFilmicToneMapping,
  Box3,
  Clock,
  CylinderGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { TIERS, type Tier } from './sceneQuality';
import { disposeObject } from './dispose';
import type { Palette } from './palette';

// re-exported so RelicViewer gets it from this lazy chunk (palette.ts imports three)
export { paletteFromTokens } from './palette';

const RELIC_HEIGHT = 1; // metres: every relic is scaled to stand this tall (and at most this wide)
const LIFT = 0.08; // the relic floats this far above the pedestal, bobbing
const PEDESTAL = { radius: 0.62, height: 0.12 };
const FOV = 30;
const CAMERA = new Vector3(0, 0.95, 3.6);
const LOOK_AT = new Vector3(0, 0.5, 0);
const TURN_SPEED = 0.4; // rad/s while nobody drags it
const DRAG_TURN = 0.012; // rad per CSS pixel dragged
const LIGHT_INTENSITY = 9;

export class RelicScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.05, 30);
  private clock = new Clock(false);
  private light: PointLight;
  private pivot = new Group(); // turns and bobs; holds the shown relic
  private cache = new Map<string, Promise<Object3D>>();
  private shard: Object3D | null = null;
  private time = 0;
  private yaw = 0;
  private spin = TURN_SPEED;
  private drag: { x: number; t: number } | null = null;
  private onScreen = true;
  private raf = 0;
  private running = false;
  private disposed = false;
  private token = 0;
  private cleanups: (() => void)[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private tier: Tier,
    private palette: Palette,
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: tier === 'high',
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.debug.checkShaderErrors = import.meta.env.DEV;

    this.camera.position.copy(CAMERA);
    this.camera.lookAt(LOOK_AT);
    this.scene.add(new HemisphereLight(palette.ash.clone().multiplyScalar(5), palette.void, 0.9));
    this.light = new PointLight(palette.ember, LIGHT_INTENSITY, 8, 1.6);
    this.light.position.set(-1.1, 1.6, 1.5);
    this.scene.add(this.light, this.pedestal(), this.pivot);

    const resize = new ResizeObserver(() => this.resize());
    resize.observe(canvas);
    this.cleanups.push(() => resize.disconnect());
    const seen = new IntersectionObserver(([entry]) => {
      this.onScreen = !!entry?.isIntersecting;
      if (this.onScreen) this.start();
      else this.stop();
    });
    seen.observe(canvas);
    this.cleanups.push(() => seen.disconnect());
    this.listen(document, 'visibilitychange', () => (document.hidden ? this.stop() : this.start()));
    this.listenDrag();
    this.resize();
  }

  /** Show the relic at `url` (null = the stand-in shard). Resolves once it can be drawn. */
  async show(url: string | null): Promise<void> {
    const token = ++this.token;
    let relic: Object3D;
    try {
      relic = url ? await this.load(url) : this.standIn();
    } catch (err) {
      console.warn(`[relic3d] ${url} failed, showing a stand-in`, err);
      relic = this.standIn();
    }
    if (this.disposed || token !== this.token) return;
    this.pivot.clear();
    this.pivot.add(relic);
    await this.renderer.compileAsync(this.scene, this.camera);
    if (this.disposed || token !== this.token) return;
    this.renderer.render(this.scene, this.camera);
    this.start();
  }

  /** The chosen relic has no 3D: stop drawing until show() is called again. */
  pause(): void {
    this.token++;
    this.stop();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.cleanups.forEach((c) => c());
    this.pivot.clear();
    disposeObject(this.scene);
    // relics loaded but not on show right now
    for (const p of this.cache.values()) p.then(disposeObject, () => {});
    if (this.shard) disposeObject(this.shard);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  // ── internals ──

  private start() {
    if (this.running || this.disposed || document.hidden || !this.onScreen) return;
    if (!this.pivot.children.length) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.frame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private stop() {
    this.running = false;
    this.clock.stop();
    cancelAnimationFrame(this.raf);
  }

  private frame() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.time += dt;
    const t = this.time;
    // after a flick it coasts, then eases back to its slow turn
    if (!this.drag) this.spin += (TURN_SPEED - this.spin) * Math.min(1, dt * 1.2);
    this.yaw += this.spin * dt;
    this.pivot.rotation.y = this.yaw;
    this.pivot.position.y = LIFT + Math.sin(t * 1.1) * 0.025; // the pedestal's top is y = 0
    this.light.intensity = LIGHT_INTENSITY * (0.9 + 0.1 * Math.sin(t * 7.3) * Math.sin(t * 2.9));
    this.renderer.render(this.scene, this.camera);
  }

  private load(url: string): Promise<Object3D> {
    let p = this.cache.get(url);
    if (!p) {
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      p = loader.loadAsync(url).then((gltf) => this.fit(gltf.scene));
      this.cache.set(url, p);
      p.catch(() => this.cache.delete(url)); // try again next time it is chosen
    }
    return p;
  }

  /** Scale a model to RELIC_HEIGHT (no wider than that either), centred, its base at y = 0. */
  private fit(model: Object3D): Object3D {
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const scale = RELIC_HEIGHT / Math.max(size.y, size.x, size.z, 1e-6);
    const holder = new Group();
    model.scale.setScalar(scale);
    const centre = box.getCenter(new Vector3()).multiplyScalar(scale);
    model.position.set(-centre.x, -box.min.y * scale, -centre.z);
    holder.add(model);
    return holder;
  }

  /** A cut shard of dark glass with an ember heart, for relics without a model. */
  private standIn(): Object3D {
    if (this.shard) return this.shard;
    const geometry = new OctahedronGeometry(RELIC_HEIGHT * 0.3, 0);
    geometry.scale(1, 1.65, 1);
    geometry.translate(0, RELIC_HEIGHT * 0.3 * 1.65, 0);
    const material = new MeshStandardMaterial({
      color: this.palette.ash.clone().multiplyScalar(2.2),
      emissive: this.palette.emberDeep,
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.4,
      flatShading: true,
    });
    this.shard = new Mesh(geometry, material);
    return this.shard;
  }

  private pedestal(): Object3D {
    const { radius, height } = PEDESTAL;
    const stone = new MeshStandardMaterial({
      color: this.palette.stone.clone().multiplyScalar(1.6),
      roughness: 0.92,
      metalness: 0.05,
    });
    const base = new Mesh(new CylinderGeometry(radius, radius * 1.06, height, 48), stone);
    base.position.y = -height / 2;
    return base;
  }

  /** Drag (mouse, pen or a sideways swipe; vertical swipes still scroll the page) to turn it. */
  private listenDrag() {
    const c = this.canvas;
    this.listen(c, 'pointerdown', (e) => {
      const p = e as PointerEvent;
      this.drag = { x: p.clientX, t: performance.now() };
      c.setPointerCapture(p.pointerId);
    });
    this.listen(c, 'pointermove', (e) => {
      if (!this.drag) return;
      const p = e as PointerEvent;
      const now = performance.now();
      const turn = (p.clientX - this.drag.x) * DRAG_TURN;
      this.yaw += turn;
      this.spin = Math.max(-6, Math.min(6, turn / Math.max((now - this.drag.t) / 1000, 1 / 120)));
      this.drag = { x: p.clientX, t: now };
    });
    const release = () => (this.drag = null);
    this.listen(c, 'pointerup', release);
    this.listen(c, 'pointercancel', release);
  }

  private listen(target: EventTarget, type: string, fn: (e: Event) => void) {
    target.addEventListener(type, fn);
    this.cleanups.push(() => target.removeEventListener(type, fn));
  }

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, TIERS[this.tier].maxDpr));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (!this.running && this.pivot.children.length) this.renderer.render(this.scene, this.camera);
  }
}
