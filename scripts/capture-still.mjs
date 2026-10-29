#!/usr/bin/env node
/**
 * The landing's still: one frame of the live 3D bonfire, saved as the image the hearth shows while
 * the 3D loads, and for good where there is no 3D (no WebGL, reduced motion, Save-Data, weak phones).
 * The loading screen's small fire is the same image.
 *
 *   npm run dev                      (or npm run preview) in another terminal, then
 *   npm run still                    capture from http://localhost:4321
 *   npm run still -- <url>           capture from another running copy of the site
 *   npm run still -- --full=<file>   also save the whole frame as PNG (to judge the crop)
 *
 * Re-run whenever the scene changes (model, fire, ruins, palette): the still must match the 3D.
 * The crop is the still's own box on the page ([data-still] in index.astro), so its position and
 * size live only in that CSS. Drives the installed Chrome through the DevTools protocol over Node's
 * built-in WebSocket, so no dependency (set CHROME_PATH if Chrome isn't found). Encodes with sharp,
 * which ships with Astro.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sharp = createRequire(import.meta.url)('sharp');

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith('--')) ?? 'http://localhost:4321').replace(/\/$/, '');
const FULL = args.find((a) => a.startsWith('--full='))?.slice('--full='.length);
const OUT = 'public/images/bonfire-still.webp';
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 }; // a common desktop, 2× for sharp screens
const SETTLE_MS = 1800; // after the first 3D frame: embers fill the air (the FPS probe ends at 2.6s)
const QUALITY = 78;

function findChrome() {
  const local = process.env.LOCALAPPDATA;
  const found = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    local && join(local, 'Google/Chrome/Application/chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => p && existsSync(p));
  if (!found) throw new Error('Chrome not found: set CHROME_PATH to its executable');
  return found;
}

/** Minimal DevTools protocol client: send(method, params, session) and once(event, session). */
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error(`cannot reach Chrome at ${url}`));
  });
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    const call = pending.get(msg.id);
    if (call) {
      pending.delete(msg.id);
      if (msg.error) call.reject(new Error(msg.error.message));
      else call.resolve(msg.result);
    } else listeners.forEach((fn) => fn(msg));
  };
  return {
    send: (method, params = {}, sessionId) =>
      new Promise((resolve, reject) => {
        pending.set(++id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params, sessionId }));
      }),
    once: (method, sessionId) =>
      new Promise((resolve) => {
        const fn = (msg) => {
          if (msg.method !== method || msg.sessionId !== sessionId) return;
          listeners.delete(fn);
          resolve(msg.params);
        };
        listeners.add(fn);
      }),
    close: () => ws.close(),
  };
}

async function devToolsPort(profile, chrome) {
  const file = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100; i++) {
    if (chrome.exitCode !== null) throw new Error('Chrome exited during start-up');
    if (existsSync(file)) {
      const [port, path] = readFileSync(file, 'utf8').trim().split('\n');
      if (port && path) return `ws://127.0.0.1:${port}${path}`;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Chrome did not open its DevTools port');
}

// ── page-side steps (stringified and run in the page) ──────────────────────────
const rendererName = () => {
  const gl = document.createElement('canvas').getContext('webgl2');
  const info = gl?.getExtension('WEBGL_debug_renderer_info');
  return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : 'unknown';
};
/** only the canvas may show: no text, fog, vignette, loader or cursor baked into the still */
const isolateCanvas = () => {
  const style = document.createElement('style');
  style.textContent = 'body > :not(.scene-layer) { visibility: hidden !important; }';
  document.head.append(style);
};
const waitForLive = (settle) =>
  new Promise((resolve, reject) => {
    const start = performance.now();
    const tick = () => {
      const canvas = document.getElementById('scene3d');
      const mode = canvas?.dataset.mode;
      if (mode === '2d')
        return reject(new Error(`the scene fell back to 2D (${canvas.dataset.reason})`));
      if (canvas?.dataset.live)
        return setTimeout(() => {
          if (canvas.dataset.mode === 'high') resolve(canvas.dataset.mode);
          else reject(new Error(`the scene stepped down to "${canvas.dataset.mode}"`));
        }, settle);
      if (performance.now() - start > 30000) return reject(new Error('no 3D frame after 30s'));
      setTimeout(tick, 100);
    };
    tick();
  });
const stillBox = () => {
  const el = document.querySelector('[data-still]');
  if (!el) throw new Error('no [data-still] element on the landing');
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height };
};

// ── run ────────────────────────────────────────────────────────────────────────
const profile = mkdtempSync(join(tmpdir(), 'ff-still-'));
const gpu = process.platform === 'win32' ? ['--use-angle=d3d11'] : [];
const chrome = spawn(
  findChrome(),
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--mute-audio',
    '--enable-gpu',
    '--ignore-gpu-blocklist',
    ...gpu,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let browser;
try {
  browser = await connect(await devToolsPort(profile, chrome));
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const page = (method, params) => browser.send(method, params, sessionId);
  const run = async (fn, arg) => {
    const { result, exceptionDetails } = await page('Runtime.evaluate', {
      expression: `(${fn})(${JSON.stringify(arg ?? null)})`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails)
      throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  };

  await page('Page.enable');
  await page('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, mobile: false });
  const loaded = browser.once('Page.loadEventFired', sessionId);
  await page('Page.navigate', { url: `${BASE}/?quality=high` });
  await loaded;

  const renderer = await run(rendererName);
  console.log(`renderer: ${renderer}`);
  if (/swiftshader|llvmpipe|software/i.test(renderer))
    console.warn('  software WebGL: the frame is right, but the FPS probe may step the scene down');

  await run(isolateCanvas);
  await run(waitForLive, SETTLE_MS);
  const box = await run(stillBox);

  if (FULL) {
    const { data } = await page('Page.captureScreenshot', { format: 'png', fromSurface: true });
    writeFileSync(FULL, Buffer.from(data, 'base64'));
    console.log(`full frame → ${FULL}  (still box ${JSON.stringify(box)})`);
  }

  const { data } = await page('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    clip: { ...box, scale: 1 },
  });
  const info = await sharp(Buffer.from(data, 'base64'))
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(OUT);
  console.log(`${OUT}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
} finally {
  await browser?.send('Browser.close').catch(() => {});
  browser?.close();
  if (chrome.exitCode === null) {
    const kill = setTimeout(() => chrome.kill(), 3000);
    await new Promise((r) => chrome.once('exit', r));
    clearTimeout(kill);
  }
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
