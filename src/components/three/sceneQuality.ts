/**
 * Decides how the landing renders: 'high' / 'low' 3D tiers, or '2d' (the Bonfire2D fallback).
 * NO three.js import here: this runs before the 3D chunk is fetched, so 2D visitors never download it.
 *
 * 2d when: no hardware WebGL (none, or software-rendered: no GPU, blocked driver, VM), reduced
 * motion, Save-Data, or a low-tier phone.
 * Tier guess from hardwareConcurrency, deviceMemory and DPR; BonfireScene then runs an FPS probe
 * in its first 2s and steps down (high → low → 2d) if the device can't keep up.
 * Debug / comparison: `/?quality=high|low|2d` forces a mode.
 */

export type Tier = 'high' | 'low';
export type Mode = Tier | '2d';

export interface TierSettings {
  maxDpr: number;
  embers: number;
  sparks: number;
  shadows: boolean;
}

export const TIERS: Record<Tier, TierSettings> = {
  // shadows off on both tiers: a point-light cube shadow makes every lit shader much heavier to
  // compile and render, for a subtle effect (ASSETS.md: one dynamic light, everything else ambient)
  high: { maxDpr: 1.5, embers: 400, sparks: 60, shadows: false },
  low: { maxDpr: 1, embers: 120, sparks: 20, shadows: false },
};

/** Frame-rate floors for the probe: below these, step down a tier. */
export const FPS_FLOOR: Record<Tier, number> = { high: 45, low: 24 };

/**
 * True only for GPU-backed WebGL. `failIfMajorPerformanceCaveat` makes the browser refuse a context
 * it would render in software (SwiftShader, llvmpipe…): there the scene is slow and CPU-hungry, and
 * the 2D bonfire serves the visitor better. Some setups don't flag their software renderer as a
 * caveat, so known ones are also caught by name. The probe context is released immediately.
 * It runs in a Worker (OffscreenCanvas) when possible: creating even a 1×1 context can block the
 * main thread for a second while a software renderer starts. Main-thread fallback otherwise.
 * If the real renderer still fails later, Scene3D catches it and keeps the 2D bonfire.
 */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/** Self-contained so it can run as a Worker (via a Blob URL) or inline. */
function probe(canvas: HTMLCanvasElement | OffscreenCanvas): string | null {
  const opts = { failIfMajorPerformanceCaveat: true };
  const gl = (canvas.getContext('webgl2', opts) ??
    canvas.getContext('webgl', opts)) as WebGLRenderingContext | null;
  if (!gl) return null;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return name;
}

async function probeInWorker(): Promise<string | null> {
  const src = `const probe = ${probe.toString()};
    let r = null; try { r = probe(new OffscreenCanvas(1, 1)); } catch (e) {}
    postMessage(r);`;
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  const worker = new Worker(url);
  return new Promise<string | null>((resolve, reject) => {
    const cap = setTimeout(() => reject(new Error('probe timeout')), 3000);
    worker.onmessage = (e) => {
      clearTimeout(cap);
      resolve(e.data as string | null);
    };
    worker.onerror = (e) => {
      clearTimeout(cap);
      reject(e);
    };
  }).finally(() => {
    worker.terminate();
    URL.revokeObjectURL(url);
  });
}

async function hasHardwareWebGL(): Promise<boolean> {
  let name: string | null;
  try {
    name =
      typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'
        ? await probeInWorker()
        : probe(document.createElement('canvas'));
  } catch {
    try {
      name = probe(document.createElement('canvas'));
    } catch {
      return false;
    }
  }
  return name !== null && !SOFTWARE_RENDERER.test(name);
}

export async function pickMode(): Promise<{ mode: Mode; reason: string }> {
  const forced = new URLSearchParams(location.search).get('quality');
  if (forced === 'high' || forced === 'low' || forced === '2d')
    return { mode: forced, reason: 'forced by ?quality' };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches)
    return { mode: '2d', reason: 'reduced motion' };
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return { mode: '2d', reason: 'save-data' };
  if (!(await hasHardwareWebGL())) return { mode: '2d', reason: 'no hardware WebGL' };

  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8; // not exposed by Safari / Firefox: assume capable
  const phone = matchMedia('(pointer: coarse)').matches;
  const strong = cores >= 6 && memory >= 4 && !(phone && devicePixelRatio > 2.5);
  if (strong) return { mode: 'high', reason: `${cores} cores, ${memory} GB` };
  if (phone) return { mode: '2d', reason: 'low-tier phone' };
  return { mode: 'low', reason: `${cores} cores, ${memory} GB` };
}
