# CLAUDE.md — The First Flame (Akrem Medimagh's portfolio)

You are working on a **Souls-like / Lies of P–themed developer portfolio** for Akrem Medimagh,
a 2nd-year Software Engineering student at INSAT (Tunis) seeking a **summer 2026 internship**.
The audience is **recruiters**. The theme is the hook; the content is the point.

> Read this file fully at the start of every session. Then read the doc for the task at hand:
>
> - `docs/MILESTONES.md` — **what to build next**, with acceptance criteria (source of truth for progress)
> - `docs/PLAN.md` — the approved product plan (site map, features, rationale)
> - `docs/DESIGN.md` — tokens, typography rules, motion, components, voice/lore rules
> - `docs/CONTENT.md` — every fact from the CV and where it lives in the code
> - `docs/ASSETS.md` — 3D/audio/image pipeline and budgets
> - `docs/DEPLOYMENT.md` — GitHub + Vercel setup (owned by Akrem), how deploys work, what you may and may not do
> - `docs/DECISIONS.md` — log of decisions; **append** when you make a non-trivial one
> - `docs/references/` — the reference images Akrem chose (Lies of P status window, item card, radar) and the approved prototype

## The non-negotiables

1. **Recruiter-first.** Name, role, email, CV download and "Skip the journey" (→ `/cv`) are visible on every world page. Projects, contact and CV must be reachable in **< 10 seconds** from any page, on a phone, with sound off.
2. **Real content is real HTML.** All facts render server-side as semantic HTML (works without JS, crawlable, screen-reader friendly). JS only _enhances_ (3D, transitions, sound, cursor).
3. **Lore never hides facts.** Every in-world name has its plain label next to it: "Hall of Works · Projects", "Python Master · Python". Never make a recruiter decode the theme.
4. **Original work only.** No FromSoftware / Round8 assets, logos, fonts, sounds, or verbatim phrases ("YOU DIED", "Bonfire Lit", "Victory Achieved", "Enemy Felled"…). Homage, not copy. Our phrases: "Flame Rekindled", "Vanquished", "Lost in the Fog". **Akrem's exception (2026-10-28):** Dark Souls III boss and ring art on the boss/ring cards, and the fan-made bonfire model with its coiled sword, are live by his choice, credited on `/credits` and possibly replaced later. Don't flag these again; anything _new_ that is game-derived still needs his OK. See `docs/DECISIONS.md`.
5. **Performance budget.** 2D pages ship ~0 KB JS beyond the shared layout. Three.js loads **only** on `/` and `/works` (island, lazy). Each 3D scene ≤ 1.5 MB of models, ≤ 100k triangles. Lighthouse Perf ≥ 85 (3D pages) / ≥ 95 (others), A11y ≥ 95.
6. **Accessible by default.** Keyboard reachable, visible focus (ember outline), `prefers-reduced-motion` respected (tokens already collapse durations), touch targets ≥ 44px, contrast ≥ 4.5:1 for body text. Custom cursor only on `(hover: hover) and (pointer: fine)`.
7. **Never autoplay audio.** Sound starts only after an explicit user choice ("Rest with sound?"). Remember the choice in `localStorage`, wrapped in try/catch.
8. **Honesty in numbers.** Stats, ranks and radar values are Akrem's self-assessment. Never invent metrics, users, accuracy figures or dates. Missing facts stay as `TODO(Akrem)` and are listed in `docs/CONTENT.md` → "Open content".

## Stack

- **Astro 5** (static output) + **TypeScript strict**. Path alias `@/*` → `src/*`.
- **Three.js** (vanilla, no R3F) as client islands in `src/components/three/`. Meshopt-compressed GLB.
- **GSAP** for timelines (warp, title cards); **Astro View Transitions** (`<ClientRouter />` in `BaseLayout`) for page changes. Use `transition:persist` for anything that must survive navigation (cursor, audio player).
- **Fonts** self-hosted via Fontsource: `IM Fell English SC` (display, ≥16px only) + `Crimson Pro Variable` (everything else).
- **Content Collections** (`src/content.config.ts`): `relics` (projects + case studies) and `bosses` (hackathons). Structured non-collection data lives in `src/data/*.ts`.
- Hosting: **Vercel** (static, zero-config). Contact form: Web3Forms (key in `.env`).

## Commands

```bash
npm install            # first time
npm run dev            # http://localhost:4321  (/lab = style guide)
npm run build          # astro check + build — must pass before every commit
npm run preview        # serve the production build
npm run format         # prettier
npm run models         # optimise assets-src/models/* → public/models/*.glb + budget report
npm run models:inspect # budget report for what is already in public/models
npm run images         # assets-src/{bosses,rings,cursor} → public/images/** + src/data/cursor.ts (manifest in the script)
```

## Project map

```
src/
  layouts/   BaseLayout (head, fonts, ClientRouter) → WorldLayout (game pages) | PlainLayout (/cv)
  components/
    ui/      TextBox, RuneButton, KeyPrompt, Frame, TravelMenu, TitleCard  ← reuse these; extend before inventing
    world/   Fog, Bonfire2D, Cursor, Loader, Warp          ← atmosphere, shared across pages
    three/   (M3+) scene modules, loaders, quality tiers
    armoury/icons/ (M8) etched SVG skill icons
  content/   relics/*.md, bosses/*.md                     ← schemas in src/content.config.ts
  data/      site.ts (identity, bonfires/nav), pilgrim.ts, armoury.ts, tips.ts, credits.ts, cursor.ts (generated)
  pages/     index (landing), cv (DONE), credits, lab (style guide), 404
  styles/    tokens.css (ONLY place for raw values), global.css
scripts/     optimize-models.mjs, optimize-images.mjs, portrait_grade.py
.githooks/   commit-msg (strips AI attribution; enabled by `npm install`)
.claude/     settings.json (permissions, attribution off), commands/ (custom slash commands)
assets-src/  raw source files (never served, committed; LFS for big binaries, ONLY here: Vercel doesn't fetch LFS)
public/      served as-is: images/, models/, audio/, cv/
docs/        the plan, design, content, milestones, decisions, references
```

## Conventions

- **Tokens only.** No raw hex / px font sizes / ms durations in components: use `var(--c-*)`, `var(--fs-*)`, `var(--sp-*)`, `var(--dur-*)`. Need a new value? Add a token in `src/styles/tokens.css` and mention it in `docs/DESIGN.md`. (Exception: SVG illustration fills inside art components like `Bonfire2D`.)
- **Scoped styles** in each `.astro` file. Global CSS only for resets and the few utilities in `global.css` (`.label`, `.dim`, `.num`, `.sr-only`).
- **Components:** props typed with `interface Props`, a top-of-file JSDoc saying what it is and where it's used. Prefer Astro components with a small `<script>`; no UI framework.
- **Scripts in components** must survive view transitions: run init on `astro:page-load`, guard against double-binding, clean up on `astro:before-swap` when they own animation loops / WebGL contexts.
- **Three.js:** one renderer per page, `dispose()` everything on `astro:before-swap`, cap DPR at 1.5 (1 on low tier), pause the loop when the tab is hidden, always ship a static fallback (`Bonfire2D` or an image) for no-WebGL / reduced-motion / low-power.
- **Copy voice:** in-world lines are short, archaic-but-clear, second person ("Rest here, traveller"). Facts are plain modern English. See `docs/DESIGN.md` → Voice.
- **New UI primitive?** Add a specimen to `/lab` first, then use it on a page.
- **Data flows one way:** `/cv` and the game pages read the same `src/data` + collections, so facts never drift. Never duplicate a fact in a template.

## Repo, hosting and git rules (READ BEFORE ANY GIT COMMAND)

- **GitHub repo:** https://github.com/lost4onin/Bonefire-protfolio (personal account, branch `main`). **Akrem created it and owns it.**
- **Vercel:** Akrem created the account and **links the project himself** (Git integration, so every push deploys: branch = preview URL, `main` = production). See `docs/DEPLOYMENT.md`.
- **You never set up or reconfigure infrastructure.** Do not create, link, rename or delete GitHub repos or Vercel projects; do not run `vercel link`, `vercel git`, `vercel deploy`, `vercel --prod`, `vercel domains`, `gh repo create`. Deploys happen only through Akrem's pushes. If something needs a dashboard change (env var, domain, protection), **tell Akrem exactly what to click**. Read-only diagnosis (`npx vercel inspect <url> --logs`, `npx vercel ls`) is OK after asking.
- **Akrem is the sole author and contributor. Never credit yourself:**
  - No `Co-Authored-By:` trailer, no "Generated with Claude Code" footer, no Claude/Anthropic links, no session links, in **commit messages, PR titles/descriptions, code comments, docs or changelogs**.
  - Never change git identity: no `git config user.*`, no `--author`, no `--global` config.
  - Never bypass hooks (`--no-verify` / `-n`). A `commit-msg` hook in `.githooks/` strips AI attribution as a safety net (enabled by `npm install` via the `prepare` script); don't rely on it, just don't write attribution.
  - `.claude/settings.json` sets `attribution` to empty for commits and PRs; never override it.
- **Commits:** only when Akrem asks or approves. Conventional style (`feat(m3): …`, `fix: …`, `docs: …`, `chore: …`), imperative, ≤ 72-char subject, body explains _why_. One logical change per commit.
- **Push / merge:** Akrem does it (or explicitly asks you to, case by case). Never force-push, never rewrite `main` history.
- **Branches:** `feat/m<n>-<slug>` per milestone, `fix/<slug>` for fixes. Never commit directly to `main`.

## Workflow (how Akrem and you work)

1. Akrem picks the next milestone from `docs/MILESTONES.md` (or uses `/start-milestone M<n>`).
2. Create a branch `feat/m<n>-<slug>`. Start in **plan mode**: restate the acceptance criteria, list files to touch, flag open questions **before** coding.
3. Build in small, reviewable steps. Run `npm run dev` and describe what Akrem should look at.
4. Before saying "done": run `/verify` (build, check, a11y/perf checklist), tick the boxes in `docs/MILESTONES.md`, append to `docs/DECISIONS.md` if you chose something non-obvious.
5. Propose a commit message (no attribution, see above) and commit once Akrem approves. **Akrem pushes** → Vercel builds a preview → he checks it → he merges to `main` → production.

**Ask Akrem** (don't guess) when: a fact is missing from the CV/docs, a visual choice isn't covered by DESIGN.md, a dependency would be added, or a change would break a non-negotiable.

## Things in flux (check before every milestone)

The current UI is a **placeholder**. Major UI updates are coming, so build for change and don't polish placeholder visuals.

- **Cursor = gauntlet pack (final, 2026-10-28).** `components/world/Cursor.astro`: 2D images from Akrem's fan-made cursor pack (`assets-src/cursor/` → `npm run images`), a state machine on one element (`data-state`: idle, point, press, grab, grabbable, wait, text), desktop fine pointers only. No 3D cursor. Don't ask Akrem for the pack's source again; it is credited generically on `/credits`.
- **3D models pending** (bonfire scene props, relics). Build procedural/placeholder versions behind a loader so a GLB drops in through `/add-model` without rework. See `docs/ASSETS.md` → Expected models.
- **The CV will change.** A CV update must be a **data-only edit** (`src/data/*`, `src/content/*`) plus replacing the PDF. Never hard-code a fact in a template. When the new CV arrives, re-diff `docs/CONTENT.md` → "CV facts" first.
- **In-world names will change** (section names, relic/boss/covenant names, skill titles, lore lines). They live only in data. Routes and slugs are separate from display names, so a rename never breaks a URL; if a route itself must change, add a redirect.
- **Before a big UI change**, ask Akrem whether that area is still placeholder or has final art/copy.

## Status

- ✅ **M0 Foundations**: tokens, fonts, layouts, UI primitives, content collections seeded from the CV, `/cv` complete, `/lab`, 404, model pipeline, portrait graded.
- ✅ **M1 Verify, version, deploy**: install and build green with no fixes, commit-msg hook active, Vercel linked by Akrem. Production: https://bonefire-protfolio.vercel.app (Deployment Protection on until launch).
- ✅ **M2 Loading, intro, travel, warp**: loader API for M3, once-per-visitor intro, Travel menu (inline + `M` dialog, bottom sheet on phones), warp on every page change (~1.9s), gauntlet cursor state machine (pack is final, no 3D cursor).
- ⏭ Next: **M3** (3D bonfire: `public/models/bonfire.glb`, flames and sparks in code, drive `window.__loader`). Keep "Things in flux" above in mind.
