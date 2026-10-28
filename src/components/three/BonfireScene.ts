/**
 * The landing's 3D bonfire. One renderer, one dynamic light (the fire), FogExp2 in palette colours.
 * Framing: the camera is placed so the fire fills the page's hearth element (the box where the 2D
 * bonfire sits) and a view offset pins it to that element's position, even while the page scrolls.
 * Motion: slow camera breathing + pointer parallax (desktop only); the fire stays pinned.
 * Quality: starts at the tier from sceneQuality.ts, FPS-probes the first ~2s and steps down
 * (high → low → onFallback = back to Bonfire2D). Pauses when the tab is hidden.
 * Lifecycle: dispose() frees every GPU resource; Scene3D calls it on astro:before-swap.
 * Main thread: heavy GPU work is spread out (async shader compile, one texture upload per idle
 * slice, shadow map rendered once) so Lighthouse's Total Blocking Time stays low.
 */
import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  FogExp2,
  HemisphereLight,
  LoadingManager,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Mesh,
  type MeshStandardMaterial,
  type Texture,
} from 'three';
import { TIERS, FPS_FLOOR, type Tier } from './sceneQuality';
import { createFire, type Fire } from './props/fire';
import { createRuins } from './props/ruins';
import { loadBonfire } from './loadBonfire';
import { disposeObject } from './dispose';

export interface Palette {
  void: Color;
  ash: Color;
  stone: Color;
  ember: Color;
  emberDeep: Color;
}

/** Palette A read from the CSS tokens (single source of truth: src/styles/tokens.css). */
export function paletteFromTokens(): Palette {
  const css = getComputedStyle(document.documentElement);
  const c = (token: string) => new Color(css.getPropertyValue(token).trim() || '#000');
  return {
    void: c('--c-void'),
    ash: c('--c-ash'),
    stone: c('--c-stone'),
    ember: c('--c-ember'),
    emberDeep: c('--c-ember-deep'),
  };
}

export interface SceneEvents {
  onProgress(fraction: number): void;
  /** the device can't hold even the low tier: show the 2D bonfire instead */
  onFallback(): void;
  /** the FPS probe stepped the scene down a tier */
  onTier?(tier: Tier): void;
  /** every byte has arrived: what the visitor waits on is over (GPU warm-up follows, unseen) */
  onDownloaded?(): void;
}

const FOV = 32;
const VISUAL_HEIGHT = 1.9; // metres from the ground to the flame tips, what the hearth should frame
const VIEW_DIR = new Vector3(0, 0.2, 1).normalize(); // camera sits in front, a little above
const PROBE_START = 0.6; // s after the first frame (skip shader warm-up)
const PROBE_END = 2.6;

/** Let the browser breathe between heavy steps (keeps each task short). */
const idle = () =>
  new Promise<void>((resolve) =>
    'requestIdleCallback' in window
      ? requestIdleCallback(() => resolve(), { timeout: 200 })
      : setTimeout(resolve, 0),
  );

export class BonfireScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.05, 60);
  private clock = new Clock(false);
  private time = 0; // animation time: survives pauses without jumping
  private fire: Fire | null = null;
  private glowing: MeshStandardMaterial[] = [];
  private target = new Vector3(0, 0.8, 0);
  private raf = 0;
  private running = false;
  private disposed = false;
  private size = new Vector2();
  private anchorRect: DOMRect | null = null;
  private pointer = new Vector2();
  private pointerSmooth = new Vector2();
  private probe = { frames: 0, start: 0, elapsed: 0, done: false };
  private cleanups: (() => void)[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    private anchor: HTMLElement | null,
    private tier: Tier,
    private palette: Palette,
    private events: SceneEvents,
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: tier === 'high',
      powerPreference: 'high-performance',
    });
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.enabled = TIERS[tier].shadows;
    // the per-shader error-log queries force each compile to finish synchronously; dev only
    this.renderer.debug.checkShaderErrors = import.meta.env.DEV;

    // fog a touch LIGHTER than the ruins, so they read as silhouettes against it
    const fogColor = palette.ash.clone().multiplyScalar(1.7);
    this.scene.background = fogColor;
    this.scene.fog = new FogExp2(fogColor, 0.05);
    this.scene.add(new HemisphereLight(palette.ash.clone().multiplyScalar(4), palette.void, 0.8));

    this.listen(window, 'resize', () => this.resize());
    this.listen(window, 'scroll', () => this.measureAnchor(), { passive: true });
    this.listen(document, 'visibilitychange', () => (document.hidden ? this.stop() : this.start()));
    if (matchMedia('(hover: hover) and (pointer: fine)').matches)
      this.listen(
        window,
        'pointermove',
        (e) => {
          const p = e as PointerEvent;
          this.pointer.set((p.clientX / innerWidth) * 2 - 1, (p.clientY / innerHeight) * 2 - 1);
        },
        { passive: true },
      );
    this.resize();
  }

  /** Load the model and build the scene. Progress: 0.1 → 0.9 while bytes arrive. */
  async load(): Promise<void> {
    const manager = new LoadingManager();
    const shadows = TIERS[this.tier].shadows;
    const bonfire = await loadBonfire({
      manager,
      onBytes: (f) => this.events.onProgress(0.1 + f * 0.8),
      stone: this.palette.stone,
      ash: this.palette.ash,
      shadows,
    });
    if (this.disposed) return;
    this.events.onDownloaded?.();
    this.glowing = bonfire.glowing;
    this.scene.add(bonfire.object);
    this.scene.add(
      createRuins({
        ash: this.palette.ash,
        stone: this.palette.stone,
        emberDeep: this.palette.emberDeep,
        fireOrigin: bonfire.fireOrigin,
        shadows,
      }),
    );

    const settings = TIERS[this.tier];
    this.fire = createFire({
      origin: bonfire.fireOrigin,
      ember: this.palette.ember,
      emberDeep: this.palette.emberDeep,
      embers: settings.embers,
      sparks: settings.sparks,
    });
    this.scene.add(this.fire.group, this.fire.light);
    const light = this.fire.light;
    light.castShadow = shadows;
    light.shadow.mapSize.set(512, 512);
    light.shadow.bias = -0.002;
    light.shadow.camera.near = 0.05;
    light.shadow.camera.far = 10;
    // the shadow casters never move and the light doesn't either (only its intensity flickers):
    // render the cube shadow map once instead of 6 extra passes every frame
    light.shadow.autoUpdate = false;
    light.shadow.needsUpdate = true;

    this.target.set(bonfire.fireOrigin.x, VISUAL_HEIGHT * 0.42, bonfire.fireOrigin.z);
    this.applyPixelRatio();

    // upload textures one per idle slice, then compile shaders off the main thread where the
    // browser supports it (KHR_parallel_shader_compile), so the first frame doesn't block
    const textures = new Set<Texture>();
    this.scene.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      for (const m of [mesh.material].flat())
        for (const v of Object.values(m))
          if ((v as Texture | null)?.isTexture) textures.add(v as Texture);
    });
    for (const tex of textures) {
      await idle();
      if (this.disposed) return;
      this.renderer.initTexture(tex);
    }
    // compile one object per idle slice (with the scene's lights and fog), not all at once
    const objects: Mesh[] = [];
    this.scene.traverse((o) =>
      (o as Mesh).isMesh || (o as Mesh & { isPoints?: boolean }).isPoints
        ? objects.push(o as Mesh)
        : null,
    );
    for (const obj of objects) {
      await idle();
      if (this.disposed) return;
      await this.renderer.compileAsync(obj, this.camera, this.scene);
    }
    this.events.onProgress(0.95);
  }

  start(): void {
    if (this.running || this.disposed || document.hidden || !this.fire) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.frame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    this.clock.stop();
    cancelAnimationFrame(this.raf);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.cleanups.forEach((c) => c());
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  // ── internals ──

  private listen(
    target: EventTarget,
    type: string,
    fn: (e: Event) => void,
    opts?: AddEventListenerOptions,
  ) {
    target.addEventListener(type, fn, opts);
    this.cleanups.push(() => target.removeEventListener(type, fn, opts));
  }

  private frame() {
    const raw = this.clock.getDelta();
    const dt = Math.min(raw, 0.1); // animation only: a long frame must not make the fire jump
    this.time += dt;
    const t = this.time;
    const flicker = this.fire!.update(t);
    for (const m of this.glowing) m.emissiveIntensity = 0.55 + 0.6 * (flicker - 0.8);

    // breathing + parallax around the framed position; the view offset keeps the fire pinned
    this.pointerSmooth.lerp(this.pointer, 0.04);
    const distance = this.distance();
    const pos = VIEW_DIR.clone().multiplyScalar(distance).add(this.target);
    pos.x += Math.sin(t * 0.21) * 0.08 + this.pointerSmooth.x * 0.35;
    pos.y += Math.sin(t * 0.33) * 0.05 - this.pointerSmooth.y * 0.18;
    this.camera.position.copy(pos);
    this.camera.lookAt(this.target);
    this.pinToAnchor();

    this.renderer.render(this.scene, this.camera);
    this.measureFps(raw); // the probe needs real time, uncapped
  }

  /** Distance at which VISUAL_HEIGHT fills the hearth (≈1.15× its height), clamped. */
  private distance(): number {
    const hearthPx = this.anchorRect?.height ? this.anchorRect.height * 1.15 : this.size.y * 0.42;
    const d = (VISUAL_HEIGHT * this.size.y) / (2 * Math.tan((FOV * Math.PI) / 360) * hearthPx);
    return Math.min(Math.max(d, 3.2), 14);
  }

  private pinToAnchor() {
    const { x: w, y: h } = this.size;
    const r = this.anchorRect;
    const cx = r ? r.left + r.width / 2 : w / 2;
    const cy = r ? r.top + r.height * 0.55 : h / 2;
    this.camera.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h);
  }

  private measureAnchor() {
    const r = this.anchor?.getBoundingClientRect();
    this.anchorRect = r && r.height > 0 ? r : null;
  }

  private resize() {
    this.size.set(innerWidth, innerHeight);
    this.renderer.setSize(this.size.x, this.size.y, false);
    this.camera.aspect = this.size.x / this.size.y;
    this.camera.updateProjectionMatrix();
    this.applyPixelRatio();
    this.measureAnchor();
  }

  private applyPixelRatio() {
    const dpr = Math.min(devicePixelRatio, TIERS[this.tier].maxDpr);
    this.renderer.setPixelRatio(dpr);
    this.fire?.setPixelScale(dpr * (this.size.y / 900));
  }

  private measureFps(dt: number) {
    const p = this.probe;
    if (p.done) return;
    p.elapsed += dt;
    if (p.elapsed < PROBE_START) return;
    if (!p.frames) p.start = p.elapsed;
    p.frames++;
    if (p.elapsed < PROBE_END) return;
    const fps = p.frames / (p.elapsed - p.start);
    if (fps >= FPS_FLOOR[this.tier]) {
      p.done = true;
      return;
    }
    if (this.tier === 'high') {
      this.setTier('low');
      this.probe = { frames: 0, start: 0, elapsed: 0, done: false }; // re-probe the low tier
    } else {
      p.done = true;
      this.events.onFallback();
    }
  }

  private setTier(tier: Tier) {
    this.tier = tier;
    this.events.onTier?.(tier);
    const s = TIERS[tier];
    this.applyPixelRatio();
    this.fire?.setCounts(s.embers, s.sparks);
    if (!s.shadows && this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.enabled = false;
      if (this.fire) this.fire.light.castShadow = false;
      this.scene.traverse((o) => {
        const mesh = o as Mesh;
        if (mesh.isMesh) [mesh.material].flat().forEach((m: Material) => (m.needsUpdate = true));
      });
    }
  }
}
