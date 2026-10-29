# Decision log

Append-only. One entry per non-obvious decision: date, decision, why, alternatives rejected.
Claude Code: add an entry whenever you pick between real options, deviate from PLAN/DESIGN, or add a dependency.

---

### 2026-10-26: Concept: Souls-like / Lies of P portfolio

Bonfire landing, bonfire-to-bonfire warp navigation, sword cursor, black text boxes, Lies of P status-window profile. Professional underneath (recruiter-first rules in CLAUDE.md).

### 2026-10-26: Palette A "Ash and Ember"

Chosen over B (Gilded Puppet, brass), C (Moonlit Abyss, violet) and D (Blood and Bone, crimson). Ember `#E8A866` echoes the orange of Akrem's CV, so the paper and web identity match.

### 2026-10-26: Fonts: IM Fell English SC + Crimson Pro

Chosen over Cinzel+EB Garamond, Cormorant SC+Garamond, Marcellus SC+Spectral and Pirata One+EB Garamond. The old printed-book ink feel suits the lore. Constraint: IM Fell only at ≥16px.

### 2026-10-26: Projects = relics, case studies = trials, hackathons = bosses

Rather than everything-as-bosses (a carousel hides 2 of 3 projects) or everything-as-items (wastes the boss metaphor on real wins).

### 2026-10-26: Skill titles = epic + proof

"Python Master" style titles, always with plain label, rank and "Proven in" links. Rejected: epic-only (reads as inflated for a student), lore-epithets-only (too cryptic for recruiters).

### 2026-10-26: Scope: 2 weeks, ship everything at once

Including the Bard playlist, EN/FR and the achievement. Rejected: 1-week MVP + later v1.1.

### 2026-10-26: Stack: Astro 5 static + vanilla Three.js islands + GSAP + View Transitions, on Vercel

Static HTML for recruiters and SEO; 3D only where it earns its weight; no React needed. Rejected: Next.js (heavier, no need for SSR), plain HTML (no content collections or transitions), Framer/Webflow (no control over cursor, warp or 3D).

### 2026-10-26: Look-dev in code (`/lab`), not in a design tool

Akrem works in VS Code with Claude Code; style frames as real components avoid throwaway mockups.

### 2026-10-26: Portrait

Akrem's studio photo (violet backdrop), keyed and graded with `scripts/portrait_grade.py`: near-black, warm tint, ember rim light on the right, fades to black at the bottom.

### 2026-10-26: Phone number not published on the site

Spam risk. It stays in the PDF CV only.

### 2026-10-27: Akrem owns all infrastructure; Claude never deploys or reconfigures

Akrem created the GitHub repo (`lost4onin/Bonefire-protfolio`) and the Vercel account, and links the Vercel project himself. Deploys happen only through Git pushes (branch → preview, `main` → production). Claude Code writes code and proposes commits; repo/Vercel-changing commands are denied in `.claude/settings.json`. Rejected: Claude setting things up via CLI (Akrem wants full control over accounts).

### 2026-10-27: Akrem is the sole author; no AI attribution anywhere

Three layers: `.claude/settings.json` attribution set to empty (+ legacy `includeCoAuthoredBy: false`), explicit rules in CLAUDE.md, and a `commit-msg` hook in `.githooks/` (enabled by `npm install`) that strips Co-Authored-By / "Generated with Claude Code" lines as a safety net. Git identity changes and `--no-verify` are denied.

### 2026-10-26: Fonts via Fontsource npm packages

Self-hosted, no Google Fonts request at runtime (privacy, performance, no layout shift from a third party).

### 2026-10-27: M1: stay on Astro 5 despite `npm audit` findings

Starter installed and built with no fixes (astro 5.18.2, three 0.170, gsap 3.15, TS 5.9); lockfile committed. `npm audit` reports 5 issues (esbuild dev-server file read on Windows, sharp/libvips, zod) whose only fix is Astro 7 (major). None reach visitors: the site is static, sharp/zod run only at build time on our own content, and the dev server listens on localhost only (don't use `--host` on untrusted networks). Re-check at M12; an Astro 7 upgrade would be its own decision. Rejected: `npm audit fix --force` mid-project.

### 2026-10-27: Cursor becomes a gauntlet from Akrem's model

Replaces the sword (placeholder until the model arrives). States: idle, point, press, grab/catch, more as Akrem defines them. **Akrem chose to trial it as a live Three.js cursor first**, a deliberate exception to "Three.js only on `/` and `/works`", limited to desktop fine pointers, lazy-loaded, persisted across pages. If measurements show it slows the site (Lighthouse below target or frame drops), downgrade to pre-rendered per-state sprites from the same model, or another alternative. Rejected for now: going straight to sprites without trying 3D.

### 2026-10-27: Current UI is a placeholder; CV and names will change

Akrem plans a major UI pass after his models (gauntlet, bonfire, relics) arrive, and will update the CV and in-world names. So: no pixel polish on placeholder visuals, facts and names only in data, routes/slugs independent of display names. Tracked in CLAUDE.md → "Things in flux".

### 2026-10-27: `Frame` forwards extra attributes like `TextBox`

So a parent's scoped styles on `<Frame class="…">` apply (Astro passes the scope as a `data-astro-cid-*` attribute).

### 2026-10-28: Raw assets committed; Git LFS scoped to `assets-src/`

Raw sources (models, boss/ring art, cursor pack) stay in the repo so the pipeline is reproducible. Big binaries go through LFS, but **only under `assets-src/`**: Vercel doesn't fetch LFS objects, so LFS files in `public/` would deploy as pointer files. Web-ready files are plain git marked `binary`. Also fixed: `* text=auto eol=lf` used to sit last in `.gitattributes` and overrode `-text` on GLBs; it's now first. 40.6 MB of LFS added (two GLBs), well inside the free 1 GB.

### 2026-10-28: Game-derived art is live by Akrem's choice (exception to "Original work only")

Akrem decided to use Dark Souls III boss renders on the hackathon cards and DS3 ring icons on the Armoury rings, and to keep the coiled sword on the bonfire model, as fan homage. All are credited on `/credits` (`src/data/credits.ts`) and may be replaced later; swapping is a data-only change (boss art is named by subject, mapped in frontmatter; rings by skill id in the `JOBS` manifest). Known risk, accepted: a DMCA takedown of the public repo or site; recruiters might see it as unoriginal. Rejected: keeping them source-only and drawing etched SVGs (DESIGN §7) now. The gauntlet cursor pack is fan-made and free to use per its author.

### 2026-10-28: Landing bonfire = "Dark Souls - Bonfire" by UselessViking (CC BY 4.0)

Chosen over "Bonfire / Dark Souls" by Livio Arango: 28k vs 602k triangles, clean separate meshes (stones, ash, bones, skull, blade, hilt, ground), vs try2's sword and baked flame cards in one mesh. Spec/gloss materials converted to metal/rough (three.js dropped spec/gloss in r147); textures at 512px (1.2 MB) because 1024px is 3.1 MB, over budget. Flames and sparks are added in code (M3). Attribution on `/credits`.

### 2026-10-28: `npm run models` runs the gltf-transform CLI through node

Spawning `node_modules/.bin/gltf-transform.cmd` fails with EINVAL on Windows since Node 20.12 (CVE-2024-27980 fix), so the script now runs `@gltf-transform/cli/bin/cli.js` with `process.execPath`. Works on every OS.

### 2026-10-28: M2: the gauntlet cursor pack is final; no 3D cursor

Akrem confirmed the 2D pack is the final cursor. `components/world/Cursor.astro` (renamed from `SwordCursor`) is a state machine on one element (`data-state`: idle, point, press, grab, grabbable, wait during warps, text over fields) with per-state art and hotspots from `src/data/cursor.ts`. The 3D gauntlet trial in MILESTONES M2 is marked superseded. At Akrem's request, CLAUDE.md (non-negotiable #5, "Things in flux"), PLAN, DESIGN and ASSETS were updated to match. The pack's source is credited generically ("fan-made"); Akrem asked not to be asked for it again.

### 2026-10-28: M2: warp on every internal page change; loader only when there is work

Akrem's call: the warp covers all navigation (including "Skip the journey" → `/cv`), so it lives in `BaseLayout` with a named `transition:persist="warp"` (an unnamed persist got a different id in `PlainLayout`, so the veil was dropped). Astro's own animation is off (`transition:animate="none"` on `<html>`). Pages without their own entry get a title card from `otherPlaces`/`placeFor()` in `site.ts`. The loader shows only after a page calls `window.__loader.expect()` (M3's scene), so 2D pages never show it. Built with CSS + small inline scripts; GSAP not needed. Measured on the production build: ~1.17s per warp; 270ms cross-fade, no title card, with reduced motion.

### 2026-10-28: M2: JS reads duration tokens through `durationMs()`

The production CSS minifier rewrites `300ms` as `.3s`; `parseFloat` then read 0.3ms and every JS timer collapsed to zero in production only. `src/lib/tokens.ts` → `durationMs()` handles both units.

### 2026-10-28: M2: landing travel menu is inline HTML; the `M` menu is a native `<dialog>`

Inline on `/` so the navigation is real, crawlable HTML that works without JS; elsewhere a `<dialog>` with `showModal()` for the focus trap and ESC, focus returned manually. Also fixed (pre-existing): the 2D bonfire glow widened phones' layout viewport to ~500px; `main` now clips horizontal overflow.

### 2026-10-28: M2 polish: longer warp, idle gauntlet, solid header and footer

Akrem's calls after trying M2:

- **Warp ≈ 1.9s** (500 in · 800 title · 600 out, the prototype's rhythm; `--dur-warp` max raised from 1.2s to 2s) so the journey is felt. Reduced motion is still a 150ms cross-fade. Trade-off accepted: "Skip the journey" → `/cv` also takes ~1.9s.
- **Cursor:** still for `--dur-idle` (5s) → `idling` (the pack's flexing animation) until it moves. A long press only becomes `grab` over `[data-cursor="grab"]` or during a native drag; over anything else it stays `press`.
- **Header and footer are solid bars in the page flow** (`position: sticky`, `--c-void` + hairline), replacing fixed gradient overlays that content showed through. On phones only the footer stays pinned (compact: status line, then email · CV · Credits), and the header scrolls away, so the chrome doesn't take a third of the screen.

### 2026-10-28: M3: how the 3D landing stays fast

Measured with Lighthouse 12 on a real Intel UHD GPU and on SwiftShader (what no-GPU machines and lab tools use). Each choice below came from a profile, not a guess:

- **Boot after the content's paint:** the three chunk is fetched only after `load`, `document.fonts.ready`, the browser's LCP entry and an idle slice. Fetching earlier competed with the fonts and cost ~15 mobile points.
- **Model materials rebuilt as `MeshStandardMaterial`:** the file's KHR_materials_specular/ior made them `MeshPhysicalMaterial`, whose shaders took seconds to compile on software renderers.
- **No shadows on either tier:** a point-light cube shadow adds 6 passes and heavier shaders for a subtle effect. ASSETS.md already says one dynamic light, everything else ambient.
- **GPU work spread out:** one texture upload per idle slice, per-object `compileAsync`, and `checkShaderErrors` off in production (the error-log queries forced each compile to finish synchronously).
- **Software WebGL → 2D:** `failIfMajorPerformanceCaveat` plus a renderer-name check (SwiftShader, llvmpipe, Basic Render), run in a Worker on an OffscreenCanvas, because even a 1×1 context blocked the main thread for ~1s on software. Those visitors never download three.js. `?quality=` still forces 3D for testing.
- **Loader covers the download only:** `expect()` starts after the deliberate wait and `done()` fires when the bytes have arrived. Counting the warm-up made a loading screen drop over already-visible content on every visit.
- **FPS probe on real time:** it used the frame delta capped for animation (0.1s), so at 5 fps it never stepped down; it now uses the raw delta (verified high → low → 2D).

Rejected: delaying 3D until user input (the bonfire is the hook), and a separate low-tier model (only one exists).

### 2026-10-28: M3: 3D fire framed onto the page, not the page onto the fire

The canvas fills the screen behind the page; the camera distance and a view offset put the fire exactly where the 2D bonfire sits (`[data-hearth]`), tracked on scroll and resize. The layout, the intro and the menu are unchanged, and the 2D bonfire cross-fades out when the first 3D frame is drawn. The flames are kept below the sword's hilt so the coiled sword reads as the hero.

### 2026-10-28: M4: The Pilgrim (`/about`)

- **Portrait in the scene layer, not the page flow (desktop).** It sits under the CSS fog, grain and vignette, so it bleeds into the dark the way the Lies of P window does, and it stays put while the sheet scrolls. Width `min(54vh, 40vw)` keeps the head clear of the sticky header. Phones and tablets (< 960px) get the same image as an in-flow banner cropped to the face (same URL, one download).
- **No GSAP on `/about`.** The radar morph is a ~20-line rAF tween (`--dur-morph`, an easeOutBack twin of `--ease-ember`); GSAP would have added ~25 KB to a 2D page. The page adds ~3 KB of its own JS (Tabs + Radar). Lighthouse 12 on the production build: desktop and mobile 100 / 100 / 100 / 100.
- **Works without JS.** Tabs render every panel; inactive ones get `hidden`, and a `<noscript><style>` shows them all, stacked under their headings, and shows the radar's data tables. With JS nothing flashes (panels are hidden in the HTML).
- **Notes (†):** a tooltip on hover/focus where there is a mouse, a line under the label on touch screens. The note is real text in the `<dt>`, so screen readers and crawlers always get it.
- **Radar labels are HTML over the SVG**, so IM Fell stays at 16px however small the chart; flat-top hexagon like the reference. The SVG is `aria-hidden`; each data set is also a `<table>`.
- **`[ESC] Back` goes to `/`** (closing the status window returns you to the bonfire), not `history.back()`, which could throw a visitor off the site. `KeyPrompt` gained `href`: the prompt is a real link and its key clicks it, ignored while typing or while a dialog/popover is open. M6 and the 404 reuse it.
- **Display names and plain labels for every block** live in `pilgrim.ts` → `sections`; the "?" text in `selfAssessed`, built from `scales`. Akrem asked to keep every name and number as it is for now; the review box in MILESTONES stays open.
- **Dynamic slot names aren't allowed in Astro**, so `Tabs` renders each panel's named slot in its frontmatter (`Astro.slots.render`).

### 2026-10-29: Fixes after M4: clean URLs, Nexus shadows, see-through chrome, the landing's still

- **`vercel.json` with `cleanUrls: true`.** Astro builds `about.html` (`build.format: 'file'`), and without `cleanUrls` Vercel only serves it at `/about.html`: production answered 404 for `/about`, `/cv` and `/credits` (checked with curl; `/` worked, so nobody had noticed). `trailingSlash: false` matches Astro's `'never'`. Chosen over switching Astro to `build.format: 'directory'`, which would also work but changes every output path. This is repo config, deployed by Akrem's push; nothing changed in the Vercel dashboard.
- **Nexus shadows (Akrem's pick).** Cold blue-black pooling along the top and bottom edges and in the corners, a pale cold haze in the fog; the middle stays clear so the fire keeps its warmth. Two atmosphere-only tokens (`--c-shade`, `--c-haze`); the one-accent rule still holds for UI.
- **See-through header and footer.** The solid `--c-void` bars cut the vignette and the `/about` portrait. Now neither has a background: they float in the edge shadow. The sticky header (desktop) gets a frosted scrim that a CSS scroll timeline fades in over the first `--sp-6` of scroll, so pages that don't scroll (the 3D landing) never pay for a backdrop blur. Without scroll-timeline support the scrim is simply always on.
- **Footer at the very end, rising into place (Akrem: "follows the scroll a bit until a certain limit").** Not pinned any more; its contents trail `--sp-8` below and fade in while the footer enters the view (`view-timeline`, `animation-range: entry`), and settle exactly at the page end. The footer clips them, so the effect never lengthens the page. CSS only, zero JS; no motion with reduced motion; browsers without scroll timelines show a plain footer. Akrem accepted that email and CV now live only there ("Skip the journey" → `/cv` still heads every page); non-negotiable #1 is reworded in CLAUDE.md.
- **The Radar's hidden data table was lengthening `/about` by 67px** (a `<table>` ignores `height: 1px` and `overflow`, so the visually hidden table kept its full height below the radar). The pinned footer used to hide that; now the table is pinned to the panel's top.
- **Keyframe names are global.** `/about`'s ember `rise` was overriding `TravelMenu`'s `rise`, so the Travel dialog jerked upward on `/about`. Renamed to `ember-rise`, `bonfire-ember` (Bonfire2D) and `footer-rise`.
- **The landing's still replaces the 2D bonfire (Akrem: never show the 2D fire, not even while the 3D loads).** `npm run still` renders the real scene in the installed Chrome (GPU via ANGLE, `?quality=high`), hides everything but the canvas and crops the `[data-still]` box. Its position is defined once, in `index.astro`'s CSS, as a fraction of the hearth, and the camera frames the fire onto the hearth, so still and live fire line up at any viewport size. On the first frame the canvas fades in under the still, then the still fades out, so the light never dips. It stays for good without 3D, and the loading screen shows it small (lazy, cached by then). 14.6 KB WebP. Rejected: a full-screen poster, which can't match the 3D framing across aspect ratios, and an empty "kindling" hearth, which leaves visitors without WebGL with no fire at all. The script drives Chrome through the DevTools protocol over Node's built-in WebSocket, so it adds no dependency.
