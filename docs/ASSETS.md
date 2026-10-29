# Assets: pipeline, budgets, licences

```
assets-src/          raw sources, never served, committed (big binaries via Git LFS)
  portrait/          pilgrim-graded.png (transparent, graded)
  models/            .glb / .gltf drops (+ .blend / .fbx sources)
  bosses/            boss card art (raw)
  rings/             Armoury ring art (raw)
  cursor/            gauntlet cursor pack (.cur / .ani)
  audio/             raw recordings / downloads before trimming
public/              served as-is
  images/            pilgrim-portrait.webp, relics/, bosses/, armoury/rings/, cursor/  (output of `npm run images`)
                     bonfire-still.webp  (output of `npm run still`)
  models/            OPTIMISED .glb only (output of `npm run models`)
  audio/sfx/         short .ogg/.mp3 effects
  audio/music/       playlist tracks
  textures/          shared textures (noise, ground) as .webp/.ktx2
  cv/                akrem-medimagh-cv.pdf
```

## Git LFS: `assets-src/` only

`.gitattributes` routes raw binaries (`.glb .gltf .fbx .obj .blend .wav .mp3 .ogg .psd .ktx2`) through LFS **only under `assets-src/`**. Vercel does not fetch LFS objects, so an LFS file in `public/` or `src/` would deploy as a text pointer and break the site; web-ready files there are plain git, marked `binary`. Check with `git check-attr filter -- <path>` (`lfs` in `assets-src/`, `unspecified` elsewhere). GitHub free LFS: ~1 GB storage + 1 GB/month bandwidth (40.6 MB used as of 2026-10-28). Files over 100 MB outside LFS are rejected by GitHub.

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
2. `npm run models` (or `npm run models -- <name>` for one file). Output goes to `public/models/<name>.glb` with a size and triangle report. Options: `--name <out>` (output file name, one source only), `--texture-size <px>` (default 2048), `--drop-material <name>` (remove every part using that material; repeatable). Spec/gloss materials (old Sketchfab exports) are converted to metal/rough automatically, since three.js no longer reads them.
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

### Expected models from Akrem

Not delivered yet. Build placeholders that these can replace without rework.

| Model               | Used on                  | Delivery route                                                                                         |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Gauntlet (cursor)   | Every page, desktop only | **Not needed:** the 2D gauntlet cursor pack is final (`public/images/cursor/`, 2026-10-28)             |
| Bonfire scene props | `/` (M3)                 | **Delivered 2026-10-28**: `public/models/bonfire.glb` (see below). Flames and sparks are added in code |
| Relics (items)      | `/works` (M5)            | GLB through `npm run models`, ≤ 600 KB / ≤ 20k triangles each                                          |

### Landing bonfire (`public/models/bonfire.glb`)

From `assets-src/models/dark_souls_-_bonfire.glb`: `npm run models -- dark_souls_-_bonfire --name bonfire --texture-size 512 --drop-material boden`.
1,051 KB, 28,131 triangles, 6 meshes, 6 materials (WebP textures at 512px; 1024px would be 3.1 MB). The optimiser flattens node names, so address parts by **material name**: `steine` stone ring, `asche` ash, `knochen` bones, `schaedel` skull, `klinge` sword blade, `griff` sword hilt. The mossy `boden` ground disc is removed in the pipeline (`--drop-material boden`, Akrem 2026-10-28); M3 supplies its own ground. The coiled sword is kept (Akrem's call, see DECISIONS 2026-10-28). At load (`components/three/loadBonfire.ts`) the file's physical materials are rebuilt as `MeshStandardMaterial` with the same maps, tinted toward the palette; no shadows are cast. Not used: `bonfire__dark_souls_try2.glb` (602k triangles, sword and baked flames in one mesh), kept as a raw source.

### Model licence log

Shown to visitors on `/credits` (`src/data/credits.ts`).

| File                                             | Source URL                                                                          | Author        | Licence   | Status                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------- | --------- | ---------------------------------- |
| `assets-src/models/dark_souls_-_bonfire.glb`     | https://sketchfab.com/3d-models/dark-souls-bonfire-b0d68c8f4cd0487da3d1fb8327ab1044 | UselessViking | CC BY 4.0 | live (`public/models/bonfire.glb`) |
| `assets-src/models/bonfire__dark_souls_try2.glb` | https://sketchfab.com/3d-models/bonfire-dark-souls-a090bdd8ca6841d1855f3d998697706b | Livio Arango  | CC BY 4.0 | source-only (not used)             |

## Images

- Portrait: `scripts/portrait_grade.py` (instructions in the file header). Web version `public/images/pilgrim-portrait.webp` (≈70 KB, 910×1400, transparent).
- Landing still: `public/images/bonfire-still.webp` (≈15 KB, 1056×945) is one frame of the live 3D scene, shown in the hearth while the 3D loads, for good without 3D, and small on the loading screen. **`npm run still`** (`scripts/capture-still.mjs`, needs `npm run dev` or `preview` running) renders `/?quality=high` in the installed Chrome over the DevTools protocol, hides everything but the canvas, crops the `[data-still]` box from `index.astro` and encodes WebP with sharp. Re-run after any change to the landing scene (model, fire, ruins, palette) and copy the printed size into `bonfireStill` in `src/data/site.ts`. It shows the CC BY bonfire model, already credited on `/credits`.
- Relic and boss art: `.webp`, ≤ 1600px wide, ≤ 200 KB each. Use Astro `<Image />` for anything not already optimised.
- **`npm run images`** (`scripts/optimize-images.mjs`, sharp): processes the `JOBS` manifest at the top of the script. Presets `boss` (≤ 1200px wide, ≤ 200 KB WebP), `ring` (256×256 WebP + @2x when the source is big enough), `cursor` (reads `.cur`/`.ani`, trims, 32×32 + @2x PNG, writes hotspots to `src/data/cursor.ts`). Never upscales, strips metadata, skips existing outputs unless `--force`. Filter: `npm run images -- rings`.
- Boss art is named after what it shows (`yhorm.webp`), not the hackathon; the mapping lives in each `src/content/bosses/*.md` `image:` field. Current: GAICA → `abyss-watchers`, KILANI → `yhorm`, Sight Day → `dancer`, leanX → `vordt`; `lothric` spare. Several sources are small (Vordt 300px, Lothric 240px, Dancer 512px), so expect soft cards until better art arrives.
- Rings: `leadership` ← Knight's Ring, `coordination` ← Hornet Ring, `analysis` ← Hawk Ring. Sources are ~200×240, so only the 256px size exists (no @2x).

### Image licence log

| File(s)                                  | Source URL                     | Author                      | Licence                                 | Status                                                     |
| ---------------------------------------- | ------------------------------ | --------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| `assets-src/bosses/*` (5 renders)        | Dark Souls III (game / wiki)   | FromSoftware / Bandai Namco | All rights reserved; used as fan homage | live (4 on boss cards, `lothric` spare); may be replaced   |
| `assets-src/rings/*` (14 icons)          | Dark Souls III (game / wiki)   | FromSoftware / Bandai Namco | All rights reserved; used as fan homage | live (3 on Armoury rings); 11 source-only; may be replaced |
| `assets-src/cursor/*` (12 files)         | Fan cursor site (not recorded) | Fan-made                    | Free to use, per the author's site      | live (`public/images/cursor/`, wired in M2)                |
| `assets-src/portrait/pilgrim-graded.png` | Akrem's own photo              | Akrem Medimagh              | own work                                | live                                                       |

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
