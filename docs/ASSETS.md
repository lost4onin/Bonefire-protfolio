# Assets: pipeline, budgets, licences

```
assets-src/          raw sources, never served (Git LFS for big binaries)
  portrait/          original.png (studio photo), pilgrim-graded.png (transparent, graded)
  models/            .glb / .gltf drops (+ .blend / .fbx sources)
  audio/             raw recordings / downloads before trimming
public/              served as-is
  images/            pilgrim-portrait.webp, relics/, bosses/
  models/            OPTIMISED .glb only (output of `npm run models`)
  audio/sfx/         short .ogg/.mp3 effects
  audio/music/       playlist tracks
  textures/          shared textures (noise, ground) as .webp/.ktx2
  cv/                akrem-medimagh-cv.pdf
```

## 3D models

### Budgets (per scene)

|                    | Budget                                         |
| ------------------ | ---------------------------------------------- |
| Total model weight | ≤ 1.5 MB (landing), ≤ 600 KB per relic         |
| Triangles          | ≤ 100k (landing), ≤ 20k per relic              |
| Textures           | ≤ 2048px, WebP; 1024 for relics                |
| Dynamic lights     | 1 (the fire), everything else baked or ambient |
| Draw calls         | aim < 50                                       |

### Workflow for a model Akrem drops in

1. Put it in `assets-src/models/` (`.glb` preferred).
   - `.fbx` / `.obj` / `.blend`: open in **Blender**, then File → Export → glTF 2.0, Format _glTF Binary (.glb)_, Include _Selected Objects_, Transform _+Y Up_, Geometry _Apply Modifiers_, Materials _Export_. Save the `.glb` next to the source.
2. `npm run models` (or `npm run models -- <name>` for one file). Output goes to `public/models/<name>.glb` with a size and triangle report.
3. Over budget? Decimate in Blender (Modifier → Decimate, ratio 0.3–0.6), bake details into a normal map, or lower `--texture-size` in `scripts/optimize-models.mjs`.
4. Load it in Three.js with meshopt:
   ```ts
   import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
   import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
   const loader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
   ```
5. Note the model's source and licence in the table below.

### Models Claude builds from scratch

Two routes, pick per asset:

- **Procedural in code** (`src/components/three/props/*.ts`): stones, logs, ground, ruin pillars, simple sword. Zero download, fully tweakable. Default for M3.
- **Blender Python script** (`scripts/blender/*.py`, run with `blender -b -P script.py`) that builds and exports a `.glb`, which then goes through the pipeline. Use for anything that needs sculpted detail or baked textures.
- Style: stylised low-poly, flat or lightly textured, dark materials that read as silhouettes against fog. Detail goes where the firelight hits.

### Model licence log

| File       | Source | Author | Licence |
| ---------- | ------ | ------ | ------- |
| (none yet) |        |        |         |

## Images

- Portrait: `scripts/portrait_grade.py` (instructions in the file header). Web version `public/images/pilgrim-portrait.webp` (≈70 KB, 910×1400, transparent).
- Relic and boss art: `.webp`, ≤ 1600px wide, ≤ 200 KB each. Use Astro `<Image />` for anything not already optimised.
- OG card: `public/og-image.jpg`, 1200×630 (M11).

## Audio

### Budgets

| Type      | Format                                                              | Size                       |
| --------- | ------------------------------------------------------------------- | -------------------------- |
| SFX       | `.ogg` (+ `.mp3` fallback for Safari < 17 if needed), mono, 44.1kHz | ≤ 60 KB each               |
| Fire loop | `.ogg`, seamless loop, 20–40s                                       | ≤ 400 KB                   |
| Music     | `.ogg`/`.mp3` 128 kbps                                              | streamed, `preload="none"` |

### Sources (licence-safe only)

- **Freesound.org**: filter by **CC0** for SFX (fire crackle, whoosh, metal tick).
- **Pixabay Sound Effects / Music**: free for commercial use under the Pixabay Content License ("medieval", "lute", "lofi medieval").
- **Musopen**: public-domain classical recordings (check each recording's licence: some are CC BY).
- UI ticks can be **synthesised in Web Audio** (0 KB).
- **Never:** YouTube rips, game soundtracks, "royalty-free" tracks without a written licence.

### Licence log (`public/audio/LICENSES.md` is generated from this in M10)

| File       | Source URL | Author | Licence |
| ---------- | ---------- | ------ | ------- |
| (none yet) |            |        |         |
