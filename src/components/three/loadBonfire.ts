/**
 * Loads Akrem's bonfire (public/models/bonfire.glb: stones, ash, bones, skull, coiled sword) with
 * GLTFLoader + MeshoptDecoder through a LoadingManager, reporting byte progress for the loader.
 * Normalises it (ground at y = 0, ~1.2 m across), pulls its tan textures toward the ash palette
 * and keeps the ash/sword emissive maps so they can glow with the fire.
 * If the file fails, a procedural ring of stones stands in so the scene still works.
 * Part names are material names (the optimiser flattens node names): steine, asche, knochen,
 * schaedel, klinge (blade), griff (hilt). See docs/ASSETS.md.
 */
import {
  Box3,
  Color,
  DodecahedronGeometry,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  CylinderGeometry,
  Vector3,
  type Material,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const MODEL_URL = '/models/bonfire.glb';
const TARGET_WIDTH = 1.2; // metres across the stone ring
const TINT = new Color(0.62, 0.55, 0.5); // darken + warm the model's textures toward palette A

export interface Bonfire {
  object: Group;
  /** where the flames sit: top-centre of the ash */
  fireOrigin: Vector3;
  /** materials with emissive maps (ash embers, sword) to pulse with the fire */
  glowing: MeshStandardMaterial[];
  fromModel: boolean;
}

/**
 * The file's KHR_materials_specular / _ior turn every part into a MeshPhysicalMaterial, whose shader
 * is much heavier to compile (up to seconds on software renderers). Rebuild each as a plain
 * MeshStandardMaterial with the same maps, darkened toward the palette.
 */
function treat(material: Material, glowing: MeshStandardMaterial[]): Material {
  const src = material as MeshStandardMaterial;
  if (!src.isMeshStandardMaterial) return material;
  const m = new MeshStandardMaterial({
    name: src.name,
    map: src.map,
    normalMap: src.normalMap,
    normalScale: src.normalScale,
    aoMap: src.aoMap,
    roughnessMap: src.roughnessMap,
    emissiveMap: src.emissiveMap,
    color: src.color.clone().multiply(TINT),
    roughness: Math.max(src.roughness, 0.85),
    metalness: 0,
    transparent: src.transparent,
    alphaTest: src.alphaTest,
    side: src.side,
  });
  if (m.emissiveMap) {
    m.emissive.set(0xffffff);
    glowing.push(m);
  }
  src.dispose();
  return m;
}

function fallback(stone: Color, ash: Color): Bonfire {
  const object = new Group();
  const rockMat = new MeshStandardMaterial({ color: stone, roughness: 1 });
  const rockGeo = new DodecahedronGeometry(0.11, 0);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const rock = new Mesh(rockGeo, rockMat);
    rock.position.set(Math.cos(a) * 0.48, 0.06, Math.sin(a) * 0.48);
    rock.rotation.set(a, a * 2, 0);
    rock.scale.setScalar(0.8 + ((i * 7) % 5) * 0.08);
    rock.castShadow = rock.receiveShadow = true;
    object.add(rock);
  }
  const ashPile = new Mesh(
    new CylinderGeometry(0.32, 0.42, 0.12, 12).translate(0, 0.06, 0),
    new MeshStandardMaterial({ color: ash.clone().multiplyScalar(2), roughness: 1 }),
  );
  ashPile.receiveShadow = true;
  object.add(ashPile);
  return { object, fireOrigin: new Vector3(0, 0.12, 0), glowing: [], fromModel: false };
}

export async function loadBonfire(opts: {
  manager: LoadingManager;
  onBytes: (fraction: number) => void;
  stone: Color;
  ash: Color;
  shadows: boolean;
}): Promise<Bonfire> {
  const loader = new GLTFLoader(opts.manager).setMeshoptDecoder(MeshoptDecoder);
  try {
    const gltf = await loader.loadAsync(MODEL_URL, (e) => {
      if (e.lengthComputable && e.total) opts.onBytes(e.loaded / e.total);
    });
    const root = gltf.scene;
    const glowing: MeshStandardMaterial[] = [];
    root.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => treat(m, glowing))
        : treat(mesh.material, glowing);
      mesh.castShadow = mesh.receiveShadow = opts.shadows;
    });

    // normalise: centred, ground at y = 0, TARGET_WIDTH across
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const scale = TARGET_WIDTH / Math.max(size.x, size.z);
    const object = new Group();
    root.scale.setScalar(scale);
    root.position.set(
      -((box.min.x + box.max.x) / 2) * scale,
      -box.min.y * scale,
      -((box.min.z + box.max.z) / 2) * scale,
    );
    object.add(root);
    object.updateMatrixWorld(true);

    // fire sits on the ash pile
    let ashBox: Box3 | null = null;
    object.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh && (mesh.material as Material).name === 'asche')
        ashBox = new Box3().setFromObject(mesh);
    });
    const fireOrigin = ashBox
      ? (() => {
          const b = ashBox as Box3;
          const c = b.getCenter(new Vector3());
          return new Vector3(c.x, b.max.y - 0.03, c.z);
        })()
      : new Vector3(0, 0.3, 0);

    return { object, fireOrigin, glowing, fromModel: true };
  } catch (err) {
    console.warn('[bonfire] model failed to load, using procedural stones', err);
    return fallback(opts.stone, opts.ash);
  }
}
