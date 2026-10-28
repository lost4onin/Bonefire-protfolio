/**
 * Procedural surroundings for the landing bonfire (zero download): ash-dark ground with a subtle
 * noise texture, three charred logs in the fire, and ruin silhouettes (an arch, broken pillars)
 * standing back in the fog like the prototype's skyline. Low-poly on purpose: they read as shapes.
 */
import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
} from 'three';

function noiseTexture(base: Color): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 0.75 + Math.random() * 0.5;
    img.data[i * 4] = Math.min(255, base.r * 255 * v);
    img.data[i * 4 + 1] = Math.min(255, base.g * 255 * v);
    img.data[i * 4 + 2] = Math.min(255, base.b * 255 * v);
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(24, 24);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function createRuins(opts: {
  ash: Color;
  stone: Color;
  emberDeep: Color;
  fireOrigin: Vector3;
  shadows: boolean;
}): Group {
  const group = new Group();

  // ── ground ──
  const ground = new Mesh(
    new CircleGeometry(40, 48).rotateX(-Math.PI / 2),
    new MeshStandardMaterial({
      map: noiseTexture(opts.ash.clone().multiplyScalar(1.6)),
      roughness: 1,
      metalness: 0,
    }),
  );
  ground.receiveShadow = opts.shadows;
  group.add(ground);

  // ── charred logs, crossed in the ash, smouldering faintly ──
  const logMat = new MeshStandardMaterial({
    color: new Color('#120c09'),
    roughness: 0.95,
    emissive: opts.emberDeep,
    emissiveIntensity: 0.12,
  });
  const logGeo = new CylinderGeometry(0.045, 0.055, 0.62, 7).rotateZ(Math.PI / 2);
  [0, 2.1, 4.2].forEach((angle, i) => {
    const log = new Mesh(logGeo, logMat);
    log.position.set(opts.fireOrigin.x, opts.fireOrigin.y - 0.06 + i * 0.03, opts.fireOrigin.z);
    log.rotation.set(0, angle, 0.18);
    log.castShadow = log.receiveShadow = opts.shadows;
    group.add(log);
  });

  // ── ruins: silhouettes in the fog ──
  // darker than the fog: they should read as shapes, not surfaces
  const stoneMat = new MeshStandardMaterial({
    color: opts.stone.clone().multiplyScalar(0.35),
    roughness: 1,
    metalness: 0,
  });
  const add = (
    mesh: Mesh,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ) => {
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    group.add(mesh);
    return mesh;
  };

  const arch = new Group();
  const pillarGeo = new BoxGeometry(0.7, 4, 0.7).translate(0, 2, 0);
  for (const x of [-1.6, 1.6]) {
    const pillar = new Mesh(pillarGeo, stoneMat);
    pillar.position.x = x;
    arch.add(pillar);
  }
  const vault = new Mesh(new TorusGeometry(1.6, 0.36, 5, 12, Math.PI), stoneMat);
  vault.position.y = 4;
  arch.add(vault);
  arch.position.set(6, 0, -13);
  arch.rotation.y = -0.35;
  group.add(arch);

  const column = (r: number, h: number) =>
    new CylinderGeometry(r, r * 1.12, h, 8).translate(0, h / 2, 0);
  add(new Mesh(column(0.4, 3.2), stoneMat), [-6, 0, -11]);
  add(new Mesh(column(0.35, 1.4), stoneMat), [-3, 0, -15], [0.05, 0, 0.08]);
  add(new Mesh(column(0.42, 5.2), stoneMat), [-10.5, 0, -17]);
  add(new Mesh(column(0.38, 2.1), stoneMat), [9.5, 0, -10], [0, 0, -0.12]);
  add(new Mesh(new BoxGeometry(1.6, 0.4, 0.6), stoneMat), [-4.5, 0.2, -10], [0, 0.6, 0]);

  return group;
}
