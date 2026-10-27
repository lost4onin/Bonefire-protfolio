# Milestones

The build order. Each milestone = one branch `feat/m<n>-<slug>` = one PR = one Vercel preview.
Tick boxes as you go. A milestone is **done** only when every box is ticked and `/verify` passes.
Target: launch in ~2 weeks (see the schedule at the bottom).

Legend: 🧱 build · 🎨 visual · 🔊 sound · 📄 content needed from Akrem · ✅ done

---

## ✅ M0 — Foundations (delivered in the starter zip)

- [x] Astro 5 + TS strict project, path alias `@/*`, Prettier, VS Code settings
- [x] Tokens (`src/styles/tokens.css`) for palette A, IM Fell English SC + Crimson Pro, spacing, motion, z-layers
- [x] `BaseLayout`, `WorldLayout` (fog, grain, vignette, header, footer status, key prompts, sword cursor), `PlainLayout`
- [x] UI primitives: `TextBox`, `RuneButton`, `KeyPrompt`, `Frame`; world: `Fog`, `Bonfire2D`, `SwordCursor`
- [x] Content collections `relics` (3) + `bosses` (4) seeded from the CV, `src/data/*` (site, pilgrim, armoury, tips)
- [x] `/cv` recruiter page complete · `/lab` style guide · `404` · placeholder landing with a working travel list
- [x] Model pipeline `npm run models` · portrait graded (`public/images/pilgrim-portrait.webp`)

---

## M1 — Verify, version, deploy 🧱 (Day 3, ~1–2 h)

The starter was written **without npm access**, so nothing has been installed or built yet.

- [x] `npm install` succeeds. If a version range doesn't resolve, bump to the nearest existing version and log it in DECISIONS.md
- [x] `npm run build` passes (`astro check` 0 errors). Fix anything that fails. Common suspects:
  - Fontsource import paths (`@fontsource-variable/crimson-pro/wght-italic.css`) → check `node_modules` for the actual file names
  - `content.config.ts` loader/schema API vs the installed Astro version
  - scoped style on components receiving `class` (see `Frame` vs `TextBox`)
- [x] `npm run dev`: `/`, `/cv`, `/lab`, `/does-not-exist` (404) render with the right fonts and palette
- [ ] Sword cursor appears on desktop, native cursor on touch emulation; it survives a client-side navigation
- [x] `git config core.hooksPath` prints `.githooks` (set by `npm install`'s `prepare` script) — the attribution-stripping hook is active
- [ ] Claude proposes the first commit message (no attribution); **Akrem** commits and pushes `main` to `lost4onin/Bonefire-protfolio`
- [ ] **Akrem** imports the repo in Vercel, sets Node 22.x, turns on Deployment Protection for production (DEPLOYMENT.md checklist 2–4) — Claude only guides
- [ ] Production build is green on Vercel; Akrem pastes the URL → Claude puts it in `astro.config.mjs` `site` and `docs/DEPLOYMENT.md`
- [ ] Update CLAUDE.md "Status"

## M2 — Loading screen, intro, travel menu, warp 🧱🎨 (Days 4–5)

Spec: PLAN.md §2, §5 · DESIGN.md → Motion, Text box · prototype: `docs/references/prototype-landing.dc.html`

- [ ] **Loader** (`components/world/Loader.astro`): inline HTML/CSS, no deps. `Bonfire2D size≈72` **bottom-left**, thin ember progress line, rotating tips from `src/data/tips.ts` (every ~3.5s, fade). Shown only if loading > 400ms; hard timeout 6s → continue with fallback; `Space`/click skips. Exposes `window.__loader.progress(0..1)` / `.done()` for the 3D scene to drive (M3)
- [ ] **Intro flow** on `/`: text box "A lone flame burns…" + `Rest at the flame` → "Flame Rekindled" banner (≈2s, original wording) → Travel menu. Plays **once per visitor** (`localStorage` key `ff.introSeen`); returning visitors land on the Travel menu directly
- [ ] **Travel menu** component (`components/ui/TravelMenu.astro`): lists `bonfires` from `site.ts` with lore name + plain label + one-line lore; keyboard: ↑/↓ to move, Enter to go, `M` toggles it from any page, `ESC` closes. Proper `role="dialog"`, focus trap, focus returns to the trigger
- [ ] **Warp transition**: on travel, fade to black (`--dur-fade`) → location title card with the destination's `name` (`--dur-title`) → new page fades in. Built with Astro View Transitions (custom animation) + GSAP if needed. **Total ≤ 1.2s**. Reduced motion → simple 150ms cross-fade, no title card
- [ ] `WorldLayout` header gets a small "Travel" button (touch users have no `M` key)
- [ ] Sword cursor: "point" state over interactive elements (slight rotation), "slash" on click (exists)
- [ ] `/lab` specimens: Loader (forced visible), TravelMenu, title card
- [ ] Mobile: everything usable at 360px wide; Travel menu becomes a bottom sheet

## M3 — 3D bonfire landing 🧱🎨 (Days 4–5, overlaps M2)

Spec: PLAN.md §1, §8 · ASSETS.md budgets · match the `Bonfire2D` silhouette and the prototype mood

- [ ] `components/three/BonfireScene.ts` + `Scene3D.astro` island (loaded with a dynamic `import()` after first paint, only on `/`)
- [ ] Scene: ring of stones, planted sword, logs, ruined arch/pillars silhouettes, ground plane. Start **procedural / low-poly** (built in code); swap in Akrem's models later via the pipeline
- [ ] Fire: GPU particles or animated shader sprites (additive blending) + a flickering `PointLight` (the only dynamic light). Embers rising. No fire *model*
- [ ] Atmosphere: `FogExp2` in palette colours, subtle camera breathing/drift, slight parallax on pointer move (desktop only)
- [ ] Quality tiers (`sceneQuality.ts`): high / low by `hardwareConcurrency`, `deviceMemory`, DPR, and an FPS probe in the first 2s; low = fewer particles, DPR 1, no shadows
- [ ] Fallback to `Bonfire2D` when: no WebGL, `prefers-reduced-motion`, `saveData`, or low tier + mobile
- [ ] Drives the M2 loader via `THREE.LoadingManager` (real progress)
- [ ] Lifecycle: pause when tab hidden; `dispose()` geometry/materials/textures/renderer on `astro:before-swap`
- [ ] Budget met: landing JS (excluding three chunk) small; total landing transfer ≤ ~1.5 MB on high tier; Lighthouse Perf ≥ 85

## M4 — The Pilgrim (`/about`) 🧱🎨📄 (Day 6)

Spec: PLAN.md §3 · reference `docs/references/ref-liesofp-status-window.png` + `ref-hex-radar.png` · data `src/data/pilgrim.ts`

- [ ] 📄 Akrem reviews and adjusts every number in `pilgrim.ts` (attributes, abilities, radar) and the briefing text
- [ ] Layout like the reference: **portrait left** (`/images/pilgrim-portrait.webp`, large, bleeding into the dark; subtle pointer parallax), **stat columns right**, **top bar** counters (`topBar`), `[ESC] Back` prompt bottom-right
- [ ] Columns: Briefing · Attributes · Combat Abilities · Tongues — Lies of P list style (label left, value right, hairline under section titles). Each value has a tooltip/`title` with its `note` when present
- [ ] **Radar** (`components/ui/Radar.astro`): inline SVG hexagon, 5 grid rings, 6 labelled axes, ember polygon with low-opacity fill; tabs **Software / AI** morph the polygon (CSS/GSAP tween of points). Accessible: a visually-hidden `<table>` of the same values
- [ ] Small "?" explaining "self-assessed, 1–20 / 0–10" (honesty rule)
- [ ] Tabs **Status / Chronicle / Oaths** with `Q` / `E` keys + clickable tabs (`role="tablist"`). Chronicle = timeline from `chronicle`; Oaths = covenant cards from `oaths`
- [ ] Mobile: portrait becomes a top banner (cropped to face), columns stack, radar full width

## M5 — Hall of Works inventory (`/works`) 🧱🎨📄 (Day 7)

Spec: PLAN.md §2 · reference `docs/references/ref-item-description-card.png` · collection `relics`

- [ ] Inventory layout: **left** list/grid of relic slots (icon + relic name + project name), **right** item description panel: pedestal art / 3D relic, `relicName` + `project`, `lore`, `Skill: <name>` + text, `Scaling:` grades, stack chips, links, **Enter the trial** button
- [ ] Selection with mouse, arrows, and touch; URL hash (`#lumio`) keeps the selection shareable
- [ ] Empty "???" slots to suggest more relics to come (max 3, subtle)
- [ ] **3D relic viewer** (optional per relic): if `model` is set, a small rotating Three.js view on a pedestal; otherwise the `image`. Same lifecycle rules as M3
- [ ] 📄 Images for each relic in `public/images/relics/` (screenshots or art)
- [ ] Mobile: list becomes horizontal scroll of slots above the panel

## M6 — The Trial (`/works/[slug]`) 🧱📄 (Day 8)

- [ ] `getStaticPaths` from `relics`; render the Markdown body with styled H2 sections **The Foe → The Arms → The Battle → Victory → Spoils**
- [ ] Header: relic name + project + role + team + period + links; "Boss defeated" link if `boss` is set
- [ ] **Fog-gate transition** when entering from the inventory (a wall of fog that the camera passes through, ≤ 1s)
- [ ] Prev / next relic navigation; `ESC` back to the Hall
- [ ] Re-enable project links on `/cv` (see TODO in `cv.astro`)
- [ ] 📄 Akrem fills every `TODO(Akrem)` in `src/content/relics/*.md`

## M7 — Bosses Vanquished (`/victories`) 🧱🎨📄 (Day 9)

- [ ] Horizontal **card deck** of the 4 bosses (scroll-snap, drag, arrows, keyboard). Each card: boss illustration, `bossName`, `bossEpithet`, plain `event`, `placement`, date
- [ ] Click/Enter **flips** the card: challenge line, Markdown body, link to the relic when `relic` is set
- [ ] "VANQUISHED" stamp treatment (original wording, ember/bone, not red serif pastiche)
- [ ] Boss art: etched/woodcut style SVG or illustrations (consistent with Armoury icons); placeholder silhouettes until art exists
- [ ] 📄 Hackathon details (date, team, brief, what you built) in `src/content/bosses/*.md`

## M8 — The Armoury (`/armoury`) 🧱🎨📄 (Day 9)

Spec: PLAN.md §4 · data `src/data/armoury.ts`

- [ ] Equipment grid grouped by slot (Weapons / Catalysts / Armour / Rings) with plain subtitles
- [ ] Tile: etched SVG icon + **title** + plain **label** + rank. Selecting opens the description panel (same pattern as M5): lore, rank, **Proven in** links (relics/bosses)
- [ ] 🎨 Draw the icons (`src/components/armoury/icons/*.svg`): one consistent engraved/woodcut line style, single colour (`currentColor`), 64×64 viewBox
- [ ] 📄 Akrem confirms ranks (max 1–2 "Master"/"Champion")

## M9 — Messenger's Post (`/contact`) + 404 polish 🧱 (Day 10)

- [ ] Email (copy-to-clipboard button), GitHub, LinkedIn, CV download
- [ ] Short form (name, email, message) posting to Web3Forms with `PUBLIC_WEB3FORMS_KEY`; honeypot field; inline validation; success/error in the text box style; works without JS (plain POST)
- [ ] 404: title fade, thicker fog, `ESC`/button home

## M10 — Sound 🔊 (Day 11)

Spec: PLAN.md §6 · ASSETS.md → Audio

- [ ] `components/world/AudioDirector` (persisted across pages): Web Audio context, master/music/fire/sfx gains, preferences in `localStorage`
- [ ] First "Rest at the flame" click asks **"Rest with sound?" [Yes] [In silence]**; choice remembered; a sound toggle always available in the header
- [ ] SFX: fire crackle loop (landing, ducks on other pages), warp whoosh, menu open/close, hover tick, select, tab switch, vanquished chime. UI ticks may be synthesized in Web Audio (0 KB)
- [ ] **The Wandering Bard**: small lute widget (play/pause/next, track name, music vol, fire vol), playlist JSON in `src/data/playlist.ts`, keeps playing across navigation (`transition:persist`)
- [ ] `public/audio/LICENSES.md` lists every file: source URL, author, licence
- [ ] Nothing ever plays before a user gesture or against the saved choice; audio pauses when the tab is hidden

## M11 — Extras (Day 12)

- [ ] "All flames lit" achievement toast when all 6 bonfires visited (localStorage), original wording
- [ ] OG share card `public/og-image.jpg` (1200×630: bonfire + name + role) — can be generated by a script rendering `/lab`-style markup with Playwright
- [ ] Analytics: Vercel Web Analytics (or Umami) — privacy-friendly, no cookie banner needed
- [ ] EN / FR toggle (`/fr/...` routes via Astro i18n, strings in `src/i18n/`). FR copy reviewed by Akrem
- [ ] `sitemap` + `robots.txt`

## M12 — QA and launch (Days 13–14)

- [ ] `/verify` on every route; Lighthouse targets met (Perf ≥85 3D / ≥95 others; A11y ≥95; SEO ≥95)
- [ ] Playwright screenshots of every route at 1440×900 and 390×844, reviewed
- [ ] Keyboard-only run through the whole site; screen-reader smoke test (VoiceOver/NVDA) on `/`, `/about`, `/cv`
- [ ] Reduced-motion, no-WebGL (Chrome flag), slow 3G throttling, `saveData` all behave
- [ ] All `TODO(Akrem)` resolved or hidden (`draft: true`); no lorem, no fake numbers
- [ ] **Akrem** adds the custom domain on Vercel and turns production Deployment Protection off; Claude updates `site`; final CV PDF in `public/cv/`
- [ ] `git log --format='%an %b' | grep -i -E 'claude|anthropic'` returns nothing (Akrem is the only author)
- [ ] Remove or protect `/lab`; tag `v1.0.0` 🔥

---

### Schedule (2 weeks)

| Day | Milestone |
|---|---|
| 1–2 | Content gathering by Akrem (CONTENT.md "Open content") + M1 |
| 3 | M1 finish, start M2 |
| 4–5 | M2 + M3 |
| 6 | M4 |
| 7 | M5 |
| 8 | M6 |
| 9 | M7 + M8 |
| 10 | M9 |
| 11 | M10 |
| 12 | M11 |
| 13–14 | M12 |
