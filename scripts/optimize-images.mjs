#!/usr/bin/env node
/**
 * Image pipeline.  assets-src/{bosses,rings,cursor}/**  →  public/images/**  (+ src/data/cursor.ts)
 *
 *   npm run images              process every job in JOBS below
 *   npm run images -- rings     only jobs whose preset or output contains "rings"
 *   npm run images -- --force   overwrite outputs that already exist (default: skip and say so)
 *
 * Presets:
 *   boss    → public/images/bosses/<out>.webp, ≤ 1200px wide, ≤ 200 KB, alpha kept
 *   ring    → public/images/armoury/rings/<id>.webp 256×256 (+ @2x 512×512 when the source is big enough)
 *   cursor  → public/images/cursor/<name>.png 32×32 + @2x 64×64, trimmed, transparent.
 *             Reads Windows .cur / .ani directly. Hotspots are written to src/data/cursor.ts.
 *
 * Rules: never upscale (a size that would need upscaling is skipped and reported), metadata stripped
 * (sharp drops it unless asked), kebab-case output names. Uses sharp, which ships with Astro.
 * Mapping source → output is a DATA decision: change JOBS, re-run with --force.
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, extname } from 'node:path';

const sharp = createRequire(import.meta.url)('sharp');

// ── What to process ────────────────────────────────────────────────────────────
// Boss art is named after what it depicts, not the hackathon, so a swap is a frontmatter edit.
const JOBS = [
  { preset: 'boss', src: 'assets-src/bosses/abyss_watchers.webp', out: 'abyss-watchers' },
  { preset: 'boss', src: 'assets-src/bosses/giant_yom.webp', out: 'yhorm' },
  { preset: 'boss', src: 'assets-src/bosses/dancer_of_the_borel_valley.jpg', out: 'dancer' },
  {
    preset: 'boss',
    src: 'assets-src/bosses/Vordt-enemies-dark-souls-3-wiki-guide.png',
    out: 'vordt',
  },
  {
    preset: 'boss',
    src: 'assets-src/bosses/Lord_of_cinder_lothric_younger_prince.png',
    out: 'lothric',
  },

  // Ring ids from src/data/armoury.ts
  { preset: 'ring', src: 'assets-src/rings/Knights_ring.png', out: 'leadership' },
  { preset: 'ring', src: 'assets-src/rings/Hornet_ring.png', out: 'coordination' },
  { preset: 'ring', src: 'assets-src/rings/Hawk_ring.png', out: 'analysis' },

  // hotspot: 'tip' = top-left-most opaque pixel, 'center' = centre of the drawn shape,
  //          [x, y] = pixel in the SOURCE image
  { preset: 'cursor', src: 'assets-src/cursor/default.cur', out: 'default', hotspot: 'tip' },
  { preset: 'cursor', src: 'assets-src/cursor/pointer.cur', out: 'pointer', hotspot: 'tip' },
  { preset: 'cursor', src: 'assets-src/cursor/grab.cur', out: 'grab', hotspot: 'center' },
  { preset: 'cursor', src: 'assets-src/cursor/grabbing.cur', out: 'grabbing', hotspot: 'center' },
  { preset: 'cursor', src: 'assets-src/cursor/wait.ani', out: 'wait', hotspot: 'tip' },
  { preset: 'cursor', src: 'assets-src/cursor/move.cur', out: 'move', hotspot: 'center' },
  { preset: 'cursor', src: 'assets-src/cursor/ew_resize.cur', out: 'ew-resize', hotspot: 'center' },
  { preset: 'cursor', src: 'assets-src/cursor/ns_resize.cur', out: 'ns-resize', hotspot: 'center' },
  {
    preset: 'cursor',
    src: 'assets-src/cursor/nesw_resize.cur',
    out: 'nesw-resize',
    hotspot: 'center',
  },
  {
    preset: 'cursor',
    src: 'assets-src/cursor/nwse_resize.cur',
    out: 'nwse-resize',
    hotspot: 'center',
  },
  { preset: 'cursor', src: 'assets-src/cursor/zoom-in.cur', out: 'zoom-in', hotspot: [37, 38] },
  { preset: 'cursor', src: 'assets-src/cursor/zoom-out.cur', out: 'zoom-out', hotspot: [37, 38] },
];

const BOSS = { dir: 'public/images/bosses', maxWidth: 1200, maxKB: 200 };
const RING = { dir: 'public/images/armoury/rings', size: 256 };
const CURSOR = { dir: 'public/images/cursor', size: 32, data: 'src/data/cursor.ts' };

// ── CLI ────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const force = args.includes('--force');
const filter = args.find((a) => !a.startsWith('--'));
const jobs = JOBS.filter((j) => !filter || j.preset.includes(filter) || j.out.includes(filter));

const kb = (file) => Math.round(statSync(file).size / 1024);
const rows = [];
const note = (src, out, status) =>
  rows.push({ src, out, status, before: existsSync(src) ? kb(src) : '', after: '' });

/** Write unless the file exists (then report it). Returns true when written. */
async function save(pipeline, out, src) {
  if (existsSync(out) && !force) {
    note(src, out, 'exists, skipped (use --force)');
    return false;
  }
  mkdirSync(dirname(out), { recursive: true });
  await pipeline.toFile(out);
  rows.push({ src, out, status: 'written', before: kb(src), after: kb(out) });
  return true;
}

// ── Windows cursor decoding (.cur = ICO with hotspot, .ani = RIFF of .cur frames) ──
/** First image of a .cur buffer → { png, hotspot } (PNG-compressed entries only). */
function decodeCur(buf) {
  const size = buf.readUInt32LE(6 + 8);
  const offset = buf.readUInt32LE(6 + 12);
  const png = buf.subarray(offset, offset + size);
  if (png.readUInt32BE(0) !== 0x89504e47) throw new Error('cursor entry is BMP, not PNG');
  return { png, hotspot: [buf.readUInt16LE(6 + 4), buf.readUInt16LE(6 + 6)] };
}

/** .ani → { frames: [{png, hotspot}], sequence: number[], stepMs: number } */
function decodeAni(buf) {
  const frames = [];
  let sequence = null;
  let rates = null;
  let jiffies = 6;
  const walk = (start, end) => {
    for (let p = start; p < end;) {
      const id = buf.toString('ascii', p, p + 4);
      const size = buf.readUInt32LE(p + 4);
      const body = buf.subarray(p + 8, p + 8 + size);
      if (id === 'LIST') walk(p + 12, p + 8 + size);
      else if (id === 'icon') frames.push(decodeCur(body));
      else if (id === 'anih') jiffies = body.readUInt32LE(28) || jiffies;
      else if (id === 'seq ')
        sequence = [...Array(size / 4)].map((_, i) => body.readUInt32LE(i * 4));
      else if (id === 'rate') rates = [...Array(size / 4)].map((_, i) => body.readUInt32LE(i * 4));
      p += 8 + size + (size & 1);
    }
  };
  walk(12, buf.length);
  if (rates && new Set(rates).size > 1)
    console.warn('   ⚠ .ani has per-step rates; using the first');
  return {
    frames,
    sequence: sequence ?? frames.map((_, i) => i),
    stepMs: Math.round(((rates?.[0] ?? jiffies) * 1000) / 60),
  };
}

/**
 * Bounding box of the drawn shape, plus the top-left-most opaque pixel.
 * Threshold 64, not 0: the source pack has faint stray pixels (alpha 1–40) left over from other cursors.
 */
async function alphaBox(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
  let tip = null;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a > 64)
        [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
      if (a > 128 && (!tip || x + y < tip[0] + tip[1])) tip = [x, y];
    }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, tip };
}

const union = (a, b) => {
  const left = Math.min(a.left, b.left);
  const top = Math.min(a.top, b.top);
  return {
    left,
    top,
    width: Math.max(a.left + a.width, b.left + b.width) - left,
    height: Math.max(a.top + a.height, b.top + b.height) - top,
    tip: a.tip,
  };
};

/** Crop to box, shrink to fit `size`, pin to the top-left, pad to size×size. */
const cursorImage = (png, box, size) => {
  const scale = Math.min(1, size / Math.max(box.width, box.height));
  return sharp(png)
    .extract({ left: box.left, top: box.top, width: box.width, height: box.height })
    .resize(Math.max(1, Math.round(box.width * scale)), Math.max(1, Math.round(box.height * scale)))
    .extend({
      right: size - Math.round(box.width * scale),
      bottom: size - Math.round(box.height * scale),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 });
};

// ── Presets ────────────────────────────────────────────────────────────────────
async function boss(job) {
  const out = `${BOSS.dir}/${job.out}.webp`;
  const meta = await sharp(job.src).metadata();
  if (meta.width < 600) console.warn(`   ⚠ ${job.src} is only ${meta.width}px wide (not upscaled)`);
  // Lower quality until it fits the size budget.
  for (const quality of [82, 74, 66, 58, 50]) {
    const buf = await sharp(job.src)
      .resize({ width: BOSS.maxWidth, withoutEnlargement: true })
      .webp({ quality, alphaQuality: 90, effort: 6 })
      .toBuffer();
    if (buf.length / 1024 <= BOSS.maxKB || quality === 50) {
      await save(sharp(buf), out, job.src);
      return;
    }
  }
}

async function ring(job) {
  const meta = await sharp(job.src).metadata();
  const longest = Math.max(meta.width, meta.height);
  for (const [suffix, size] of [
    ['', RING.size],
    ['@2x', RING.size * 2],
  ]) {
    const out = `${RING.dir}/${job.out}${suffix}.webp`;
    if (longest < size * 0.9) {
      note(job.src, out, `not made: source ${meta.width}×${meta.height} would need upscaling`);
      continue;
    }
    await save(
      sharp(job.src)
        .resize(size, size, {
          fit: 'contain',
          withoutEnlargement: true,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 85, alphaQuality: 95, effort: 6 }),
      out,
      job.src,
    );
  }
}

const cursorEntries = [];

async function cursor(job) {
  const buf = readFileSync(job.src);
  const isAni = extname(job.src).toLowerCase() === '.ani';
  const anim = isAni ? decodeAni(buf) : { frames: [decodeCur(buf)] };
  const boxes = await Promise.all(anim.frames.map((f) => alphaBox(f.png)));
  const box = boxes.reduce(union); // one box for every frame, so an animation doesn't jitter

  const hs =
    job.hotspot === 'tip'
      ? box.tip
      : job.hotspot === 'center'
        ? [box.left + box.width / 2, box.top + box.height / 2]
        : job.hotspot;
  const scale = Math.min(1, CURSOR.size / Math.max(box.width, box.height));
  const hotspot = [0, 1].map((i) =>
    Math.min(CURSOR.size - 1, Math.max(0, Math.round((hs[i] - [box.left, box.top][i]) * scale))),
  );

  const names = isAni ? anim.frames.map((_, i) => `${job.out}-${i}`) : [job.out];
  for (const [i, name] of names.entries()) {
    const png = anim.frames[i].png;
    await save(cursorImage(png, box, CURSOR.size), `${CURSOR.dir}/${name}.png`, job.src);
    await save(cursorImage(png, box, CURSOR.size * 2), `${CURSOR.dir}/${name}@2x.png`, job.src);
  }
  const url = (n) => `/${CURSOR.dir.replace(/^public\//, '')}/${n}`;
  cursorEntries.push({
    name: job.out,
    src: url(`${names[0]}.png`),
    src2x: url(`${names[0]}@2x.png`),
    hotspot,
    ...(isAni && {
      frames: names.map((n) => ({ src: url(`${n}.png`), src2x: url(`${n}@2x.png`) })),
      sequence: anim.sequence,
      stepMs: anim.stepMs,
    }),
  });
}

function writeCursorData() {
  const body = cursorEntries
    .map(
      (c) =>
        '  ' +
        JSON.stringify(c)
          .replace(/"(\w+)":/g, '$1: ')
          .replace(/"/g, "'"),
    )
    .join(',\n');
  writeFileSync(
    CURSOR.data,
    `/**
 * Cursor images and hotspots. GENERATED by \`npm run images\` (scripts/optimize-images.mjs): edit the
 * JOBS manifest there and re-run, don't edit this file by hand.
 * Source: assets-src/cursor/ (fan-made gauntlet pack, see docs/ASSETS.md → licence log).
 * \`hotspot\` is [x, y] in 32px space (multiply by 2 for the @2x image). Animated cursors list their
 * frames; \`sequence\` is the frame order and \`stepMs\` the time per step.
 * Not wired into the UI yet (M2).
 */

export type CursorFrame = { src: string; src2x: string };
export type CursorImage = CursorFrame & {
  name: string;
  hotspot: [number, number];
  frames?: CursorFrame[];
  sequence?: number[];
  stepMs?: number;
};

export const cursors: CursorImage[] = [
${body},
];
`,
  );
  console.log(`   wrote ${CURSOR.data}`);
}

// ── Run ────────────────────────────────────────────────────────────────────────
const presets = { boss, ring, cursor };
for (const job of jobs) {
  console.log(`→ ${job.src}`);
  await presets[job.preset](job);
}
// Cursor data only makes sense with the full cursor set.
if (
  jobs.filter((j) => j.preset === 'cursor').length ===
  JOBS.filter((j) => j.preset === 'cursor').length
)
  writeCursorData();

console.log('');
for (const r of rows)
  console.log(
    `${r.status === 'written' ? '✓' : '·'}  ${r.out.padEnd(48)} ${String(r.before).padStart(4)} KB → ${String(r.after).padStart(4)} KB  ${r.status === 'written' ? '' : r.status}`,
  );
