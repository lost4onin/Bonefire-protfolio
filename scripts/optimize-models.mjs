#!/usr/bin/env node
/**
 * 3D asset pipeline.  assets-src/models/**  →  public/models/*.glb
 *
 *   npm run models              optimise every .glb/.gltf in assets-src/models
 *   npm run models -- lumio     only files whose name contains "lumio"
 *   npm run models -- dark_souls_-_bonfire --name bonfire --texture-size 512
 *                               write public/models/bonfire.glb, textures capped at 512px
 *   … --drop-material boden     remove every primitive using that material (repeatable)
 *   npm run models:inspect      report on what is already in public/models (no writes)
 *
 * What it does (gltf-transform "optimize"):
 *   - dedupe, prune, weld, simplify (gently), resample animations
 *   - meshopt geometry compression   → three: GLTFLoader.setMeshoptDecoder(MeshoptDecoder)
 *   - textures → WebP, max 2048px    (KTX2 needs the toktx binary; switch later if needed)
 *   - spec/gloss materials (KHR_materials_pbrSpecularGlossiness, common in Sketchfab exports)
 *     are converted to metal/rough first: three.js dropped spec/gloss support in r147
 * Then checks each output against the budget in docs/ASSETS.md and prints a report.
 *
 * FBX / OBJ / BLEND are NOT handled here: export them to .glb from Blender first
 * (File → Export → glTF 2.0, format "glTF Binary", +Y up, apply modifiers). See docs/ASSETS.md.
 */
import { execFileSync } from 'node:child_process';
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  statSync,
  mkdirSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { tmpdir } from 'node:os';

const SRC = 'assets-src/models';
const OUT = 'public/models';
const BUDGET = {
  fileKB: 1500, // per scene total; warn per file above this
  triangles: 100_000,
};

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const inspectOnly = args.includes('--inspect-only');
const outName = flag('--name');
const textureSize = flag('--texture-size') ?? '2048';
const dropMaterials = args.flatMap((a, i) => (a === '--drop-material' ? [args[i + 1]] : []));
const VALUE_FLAGS = ['--name', '--texture-size', '--drop-material'];
const filter = args.find((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(args[i - 1]));

// Run the CLI's JS entry with node directly: spawning the .cmd shim on Windows fails with
// EINVAL since Node 20.12 (CVE-2024-27980) unless a shell is used.
const bin = join('node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js');
if (!existsSync(bin)) {
  console.error('gltf-transform not found. Run `npm install` first.');
  process.exit(1);
}
const run = (cmdArgs) =>
  execFileSync(process.execPath, [bin, ...cmdArgs], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];

/** Extensions used by a GLB, read from its JSON chunk. */
function extensionsUsed(file) {
  const buf = readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) return [];
  return (
    JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString('utf8')).extensionsUsed ?? []
  );
}

/**
 * Copy a GLB without the primitives that use any of `names` (material names). Edits only the JSON
 * chunk; `optimize` then prunes the orphaned accessors, materials and textures.
 */
function withoutMaterials(src, names, out) {
  const buf = readFileSync(src);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  const drop = new Set(
    (json.materials ?? []).flatMap((m, i) => (names.includes(m.name) ? [i] : [])),
  );
  const missing = names.filter((n) => !(json.materials ?? []).some((m) => m.name === n));
  if (missing.length) throw new Error(`No material named ${missing.join(', ')} in ${src}`);
  const emptied = new Set();
  json.meshes.forEach((mesh, i) => {
    mesh.primitives = mesh.primitives.filter((p) => !drop.has(p.material));
    if (!mesh.primitives.length) emptied.add(i);
  });
  // A mesh with no primitives is invalid glTF: remove it and renumber node → mesh references.
  const newIndex = [];
  json.meshes = json.meshes.filter((_, i) => {
    newIndex[i] = emptied.has(i) ? undefined : i - [...emptied].filter((e) => e < i).length;
    return !emptied.has(i);
  });
  json.nodes.forEach((n) => {
    if (n.mesh === undefined) return;
    if (newIndex[n.mesh] === undefined) delete n.mesh;
    else n.mesh = newIndex[n.mesh];
  });
  let text = JSON.stringify(json);
  text += ' '.repeat((4 - (Buffer.byteLength(text) % 4)) % 4);
  const jsonChunk = Buffer.from(text);
  const rest = buf.subarray(20 + jsonLen); // BIN chunk, untouched
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + jsonChunk.length + rest.length, 8);
  header.writeUInt32LE(jsonChunk.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16); // 'JSON'
  writeFileSync(out, Buffer.concat([header, jsonChunk, rest]));
}

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
        const count =
          p.indices !== undefined ? acc[p.indices].count : acc[p.attributes.POSITION].count;
        return sum + count / 3;
      }, 0),
    );
    const nodes = (json.nodes ?? []).filter((n) => n.mesh !== undefined);
    return nodes.length
      ? nodes.reduce((s, n) => s + meshTris[n.mesh], 0)
      : meshTris.reduce((a, b) => a + b, 0);
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
  (f) =>
    ['.glb', '.gltf'].includes(extname(f).toLowerCase()) &&
    (!filter || basename(f).includes(filter)),
);
const unsupported = walk(SRC).filter((f) =>
  ['.fbx', '.obj', '.blend'].includes(extname(f).toLowerCase()),
);
if (unsupported.length) {
  console.log('Skipped (export to .glb from Blender first, see docs/ASSETS.md):');
  unsupported.forEach((f) => console.log('   ' + f));
}
if (!sources.length) {
  console.log(`No .glb/.gltf found in ${SRC}${filter ? ` matching "${filter}"` : ''}.`);
  process.exit(0);
}

if (outName && sources.length > 1) {
  console.error(`--name needs exactly one matching source, found ${sources.length}.`);
  process.exit(1);
}

let over = false;
for (const src of sources) {
  const out = join(
    OUT,
    (outName ?? basename(src, extname(src))).toLowerCase().replace(/[^a-z0-9-]+/g, '-') + '.glb',
  );
  console.log(`→ ${src}`);
  const temps = [];
  let input = src;
  if (dropMaterials.length) {
    const next = join(tmpdir(), `dropped-${basename(src)}`);
    console.log(`   dropping material(s): ${dropMaterials.join(', ')}`);
    withoutMaterials(input, dropMaterials, next);
    temps.push((input = next));
  }
  if (extensionsUsed(src).includes('KHR_materials_pbrSpecularGlossiness')) {
    const next = join(tmpdir(), `metalrough-${basename(src)}`);
    console.log('   spec/gloss materials → metal/rough');
    run(['metalrough', input, next]);
    temps.push((input = next));
  }
  run([
    'optimize',
    input,
    out,
    '--compress',
    'meshopt',
    '--texture-compress',
    'webp',
    '--texture-size',
    textureSize,
  ]);
  temps.forEach((t) => rmSync(t));
  over = report(out) || over;
}
console.log(
  over
    ? '\nSome files exceed the budget. Simplify in Blender or lower --texture-size.'
    : '\nAll within budget.',
);
