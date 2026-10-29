---
description: Bring a 3D model from assets-src/models into the site (e.g. /add-model ruined-arch for the landing)
argument-hint: <file name or part of it> [where it goes]
---

Integrate the 3D model **$ARGUMENTS**.

1. Find it in `assets-src/models/`. If it's `.fbx` / `.obj` / `.blend`, stop and give me the exact Blender export steps from `docs/ASSETS.md` (I'll export the `.glb`).
2. Run `npm run models -- <name>` and show me the size and triangle report. If it's over budget (`docs/ASSETS.md`), propose concrete fixes (decimate ratio, texture size) before going further.
3. Inspect it: scale (1 unit = 1 m), orientation (+Y up), pivot, material count, whether it has animations. Report anything odd.
4. Ask me for the source and licence if I haven't given them, and add the row to the model licence log in `docs/ASSETS.md`.
5. Wire it into the right scene (default: the landing in `src/components/three/`) with `GLTFLoader` + `MeshoptDecoder` through the shared `LoadingManager`, so the loader shows real progress. Match the scene's materials and lighting: dark, rough, lit only by the fire.
6. Dispose of it properly on page swap. Keep a procedural fallback if the file fails to load.
7. If it changed the landing scene, run `npm run still` (with `npm run dev` running) so the still in the hearth matches the 3D again, and copy the printed size into `bonfireStill` in `src/data/site.ts`.
8. Tell me what to look at in `npm run dev`.
