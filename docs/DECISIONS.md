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
