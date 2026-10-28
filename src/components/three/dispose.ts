/**
 * Free everything a scene graph holds on the GPU: geometries, materials and every texture slot.
 * Call before dropping a scene (astro:before-swap), then renderer.dispose().
 */
import type { Material, Object3D, Texture } from 'three';

export function disposeObject(root: Object3D): void {
  const materials = new Set<Material>();
  root.traverse((obj) => {
    const mesh = obj as Object3D & {
      geometry?: { dispose(): void };
      material?: Material | Material[];
    };
    mesh.geometry?.dispose();
    if (mesh.material) [mesh.material].flat().forEach((m) => materials.add(m));
  });
  for (const m of materials) {
    for (const value of Object.values(m)) {
      if ((value as Texture | null)?.isTexture) (value as Texture).dispose();
    }
    // ShaderMaterial uniforms can hold textures too
    const uniforms = (m as Material & { uniforms?: Record<string, { value: unknown }> }).uniforms;
    if (uniforms)
      for (const u of Object.values(uniforms))
        if ((u.value as Texture | null)?.isTexture) (u.value as Texture).dispose();
    m.dispose();
  }
}
