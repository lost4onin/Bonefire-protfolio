/**
 * The fire: no model, all shaders. Flames are camera-facing (cylindrical billboard) planes with an
 * fbm-noise flame shader; embers and sparks are GPU points whose paths are computed in the vertex
 * shader from time + a per-point seed (zero CPU work per frame); one flickering PointLight
 * (the scene's only dynamic light) and a soft additive glow that lights up the fog.
 * Flame colours are art (like Bonfire2D's SVG fills); glow and embers use the ember tokens.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  PlaneGeometry,
  PointLight,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';

const FLAME_CORE = new Color('#fff0c8');
const FLAME_MID = new Color('#ff8a2a');
const FLAME_EDGE = new Color('#9c2a08');

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`;

/** Vertex shader for planes that turn around Y to face the camera; origin = bottom centre. */
const BILLBOARD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 centre = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 toCam = cameraPosition - centre;
    vec3 right = normalize(vec3(toCam.z, 0.0, -toCam.x));
    vec3 world = centre + right * position.x * length(modelMatrix[0].xyz) + vec3(0.0, position.y * length(modelMatrix[1].xyz), 0.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const FLAME_FRAG = /* glsl */ `
  uniform float uTime, uSeed, uIntensity;
  uniform vec3 uCore, uMid, uEdge;
  varying vec2 vUv;
  ${NOISE}
  void main() {
    float t = uTime + uSeed;
    float n = fbm(vec2(vUv.x * 3.0 + uSeed, vUv.y * 2.4 - t * 1.7));
    float x = (vUv.x - 0.5) * 2.0 + (n - 0.5) * 0.9 * vUv.y;
    float width = mix(0.78, 0.04, pow(vUv.y, 0.8));
    float shape = 1.0 - smoothstep(width * 0.5, width, abs(x));
    float top = 1.0 - smoothstep(0.3 + n * 0.4, 1.0, vUv.y);
    float bottom = smoothstep(0.0, 0.1, vUv.y);
    float f = clamp(shape * top * bottom * (0.6 + n * 0.8), 0.0, 1.0);
    vec3 col = mix(uEdge, uMid, smoothstep(0.1, 0.5, f));
    col = mix(col, uCore, smoothstep(0.55, 0.95, f));
    gl_FragColor = vec4(col * uIntensity, f);
  }
`;

const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - vec2(0.5, 0.42)) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 2.6) * uIntensity;
    gl_FragColor = vec4(uColor, a);
  }
`;

const POINTS_VERT = /* glsl */ `
  attribute vec4 aSeed; // x phase, y angle, z radius/size, w speed
  uniform float uTime, uRate, uHeight, uSpread, uSize;
  uniform vec3 uOrigin;
  varying float vAlpha;
  void main() {
    float life = fract(uTime * uRate * (0.6 + aSeed.w * 0.8) + aSeed.x);
    float a = aSeed.y * 6.2831 + life * (1.5 + aSeed.z * 3.0);
    float r = uSpread * aSeed.z * (0.25 + life);
    vec3 p = uOrigin;
    p.x += cos(a) * r + sin(uTime * 1.3 + aSeed.y * 20.0) * 0.06 * life;
    p.z += sin(a) * r;
    p.y += life * uHeight * (0.55 + aSeed.w * 0.6);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 - life * 0.75) * (0.4 + aSeed.z) / -mv.z;
    vAlpha = smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.5, 1.0, life));
  }
`;

const POINTS_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(uColor, a);
  }
`;

function points(max: number, uniforms: Record<string, { value: unknown }>): Points {
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(max * 3), 3));
  const seeds = new Float32Array(max * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  geo.setAttribute('aSeed', new BufferAttribute(seeds, 4));
  const pts = new Points(
    geo,
    new ShaderMaterial({
      uniforms,
      vertexShader: POINTS_VERT,
      fragmentShader: POINTS_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  pts.frustumCulled = false; // positions live in the shader
  return pts;
}

export interface Fire {
  group: Group;
  light: PointLight;
  /** advance the animation; returns the current flicker (≈0.8–1.1) to drive emissive glow */
  update(time: number): number;
  setCounts(embers: number, sparks: number): void;
  setPixelScale(scale: number): void;
}

export function createFire(opts: {
  origin: Vector3;
  ember: Color;
  emberDeep: Color;
  embers: number;
  sparks: number;
}): Fire {
  const group = new Group();
  group.position.copy(opts.origin);
  const flames: ShaderMaterial[] = [];

  const flameGeo = new PlaneGeometry(1, 1).translate(0, 0.5, 0);
  const layers = [
    // kept below the sword's hilt: the coiled sword is the hero, the fire burns around it
    { w: 0.8, h: 0.95, x: 0, z: 0.02, seed: 0.0, i: 1.0 },
    { w: 0.58, h: 0.75, x: -0.17, z: -0.04, seed: 3.1, i: 0.85 },
    { w: 0.54, h: 0.7, x: 0.18, z: 0.05, seed: 7.7, i: 0.85 },
    { w: 0.4, h: 0.5, x: 0.02, z: 0.12, seed: 11.3, i: 1.1 },
  ];
  for (const l of layers) {
    const mat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: l.seed },
        uIntensity: { value: l.i },
        uCore: { value: FLAME_CORE },
        uMid: { value: FLAME_MID },
        uEdge: { value: FLAME_EDGE },
      },
      vertexShader: BILLBOARD_VERT,
      fragmentShader: FLAME_FRAG,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const m = new Mesh(flameGeo, mat);
    m.position.set(l.x, -0.04, l.z);
    m.scale.set(l.w, l.h, 1);
    m.frustumCulled = false;
    m.renderOrder = 2;
    flames.push(mat);
    group.add(m);
  }

  const glowMat = new ShaderMaterial({
    uniforms: { uColor: { value: opts.emberDeep }, uIntensity: { value: 0.9 } },
    vertexShader: BILLBOARD_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const glow = new Mesh(new PlaneGeometry(1, 1).translate(0, 0.5, 0), glowMat);
  glow.scale.set(5.5, 5.5, 1);
  glow.position.set(0, -1.8, -0.4);
  glow.renderOrder = 1;
  glow.frustumCulled = false;
  group.add(glow);

  const emberUniforms = {
    uTime: { value: 0 },
    uRate: { value: 0.22 },
    uHeight: { value: 3.2 },
    uSpread: { value: 0.35 },
    uSize: { value: 22 },
    uOrigin: { value: new Vector3(0, 0.05, 0) },
    uColor: { value: opts.ember },
  };
  const sparkUniforms = {
    uTime: { value: 0 },
    uRate: { value: 0.9 },
    uHeight: { value: 1.6 },
    uSpread: { value: 0.5 },
    uSize: { value: 12 },
    uOrigin: { value: new Vector3(0, 0.1, 0) },
    uColor: { value: FLAME_CORE },
  };
  const MAX_EMBERS = 400;
  const MAX_SPARKS = 60;
  const embers = points(MAX_EMBERS, emberUniforms);
  const sparks = points(MAX_SPARKS, sparkUniforms);
  embers.renderOrder = sparks.renderOrder = 3;
  group.add(embers, sparks);

  const light = new PointLight(opts.ember.clone().lerp(FLAME_MID, 0.4), 16, 0, 2);
  light.position.set(opts.origin.x, opts.origin.y + 0.35, opts.origin.z);

  const setCounts = (e: number, s: number) => {
    embers.geometry.setDrawRange(0, Math.min(e, MAX_EMBERS));
    sparks.geometry.setDrawRange(0, Math.min(s, MAX_SPARKS));
  };
  setCounts(opts.embers, opts.sparks);
  const baseSizes = [emberUniforms.uSize.value, sparkUniforms.uSize.value];

  return {
    group,
    light,
    setCounts,
    setPixelScale(scale) {
      emberUniforms.uSize.value = baseSizes[0]! * scale;
      sparkUniforms.uSize.value = baseSizes[1]! * scale;
    },
    update(time) {
      for (const f of flames) f.uniforms.uTime!.value = time;
      emberUniforms.uTime.value = time;
      sparkUniforms.uTime.value = time;
      const flicker =
        0.86 +
        0.07 * Math.sin(time * 7.3) +
        0.05 * Math.sin(time * 13.1 + 1.7) +
        0.04 * Math.sin(time * 23.7 + 0.4);
      light.intensity = 16 * flicker;
      glowMat.uniforms.uIntensity!.value = 0.85 * flicker;
      return flicker;
    },
  };
}
