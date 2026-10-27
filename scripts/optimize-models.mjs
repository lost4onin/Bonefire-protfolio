#!/usr/bin/env node
/**
 * 3D asset pipeline.  assets-src/models/**  →  public/models/*.glb
 *
 *   npm run models              optimise every .glb/.gltf in assets-src/models
 *   npm run models -- lumio     only files whose name contains "lumio"
 *   npm run models:inspect      report on what is already in public/models (no writes)
 *
 * What it does (gltf-transform "optimize"):
 *   - dedupe, prune, weld, simplify (gently), resample animations
 *   - meshopt geometry compression   → three: GLTFLoader.setMeshoptDecoder(MeshoptDecoder)
 *   - textures → WebP, max 2048px    (KTX2 needs the toktx binary; switch later if needed)
 * Then checks each output against the budget in docs/ASSETS.md and prints a report.
 *
 * FBX / OBJ / BLEND are NOT handled here: export them to .glb from Blender first
 * (File → Export → glTF 2.0, format "glTF Binary", +Y up, apply modifiers). See docs/ASSETS.md.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';

const SRC = 'assets-src/models';
const OUT = 'public/models';
const BUDGET = {
  fileKB: 1500, // per scene total; warn per file above this
  triangles: 100_000,
};

const args = process.argv.slice(2);
const inspectOnly = args.includes('--inspect-only');
const filter = args.find((a) => !a.startsWith('--'));

const bin = join('node_modules', '.bin', process.platform === 'win32' ? 'gltf-transform.cmd' : 'gltf-transform');
if (!existsSync(bin)) {
  console.error('gltf-transform not found. Run `npm install` first.');
  process.exit(1);
}
const run = (cmdArgs) => execFileSync(bin, cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];

/**
 * Triangle count read straight from the GLB's JSON chunk (no extra deps).
 * Sums triangle primitives (mode 4 / default) using index count, or vertex count if unindexed.
 * Counts each mesh once per node that instances it.
 */
function triangleCount(file) {
  try {
    const buf = readFileSync(file);
    if (buf.readUInt32LE(0) !== 0x46546c67) return null; // 'glTF'
    const jsonLen = buf.readUInt32LE(12);
    const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
    const acc = json.accessors ?? [];
    const meshTris = (json.meshes ?? []).map((mesh) =>
      mesh.primitives.reduce((sum, p) => {
        if ((p.mode ?? 4) !== 4) return sum;
        const count = p.indices !== undefined ? acc[p.indices].count : acc[p.attributes.POSITION].count;
        return sum + count / 3;
      }, 0),
    );
    const nodes = (json.nodes ?? []).filter((n) => n.mesh !== undefined);
    return nodes.length ? nodes.reduce((s, n) => s + meshTris[n.mesh], 0) : meshTris.reduce((a, b) => a + b, 0);
  } catch {
    return null;
  }
}

function report(file) {
  const kb = Math.round(statSync(file).size / 1024);
  const tris = triangleCount(file);
  const overSize = kb > BUDGET.fileKB;
  const overTris = tris !== null && tris > BUDGET.triangles;
  const flag = overSize || overTris ? '⚠ OVER BUDGET' : '✓';
  console.log(
    `${flag}  ${relative('.', file).padEnd(40)} ${String(kb).padStart(6)} KB   ` +
      `${tris === null ? '   ? tris' : `${Math.round(tris).toLocaleString()} tris`}`,
  );
  return overSize || overTris;
}

mkdirSync(OUT, { recursive: true });

if (inspectOnly) {
  const files = walk(OUT).filter((f) => extname(f) === '.glb');
  if (!files.length) console.log('No models in public/models yet.');
  files.forEach(report);
  process.exit(0);
}

const sources = walk(SRC).filter(
  (f) => ['.glb', '.gltf'].includes(extname(f).toLowerCase()) && (!filter || basename(f).includes(filter)),
);
const unsupported = walk(SRC).filter((f) => ['.fbx', '.obj', '.blend'].includes(extname(f).toLowerCase()));
if (unsupported.length) {
  console.log('Skipped (export to .glb from Blender first, see docs/ASSETS.md):');
  unsupported.forEach((f) => console.log('   ' + f));
}
if (!sources.length) {
  console.log(`No .glb/.gltf found in ${SRC}${filter ? ` matching "${filter}"` : ''}.`);
  process.exit(0);
}

let over = false;
for (const src of sources) {
  const out = join(OUT, basename(src, extname(src)).toLowerCase().replace(/[^a-z0-9-]+/g, '-') + '.glb');
  console.log(`→ ${src}`);
  run([
    'optimize',
    src,
    out,
    '--compress',
    'meshopt',
    '--texture-compress',
    'webp',
    '--texture-size',
    '2048',
  ]);
  over = report(out) || over;
}
console.log(over ? '\nSome files exceed the budget. Simplify in Blender or lower --texture-size.' : '\nAll within budget.');
