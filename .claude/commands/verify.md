---
description: Run the definition-of-done checks before calling work finished
---

Run the definition-of-done checks for the current work. Report each item as ✅ / ❌ with a one-line reason. Fix ❌ items you can fix, then re-run.

**Build**
- `npm run build` passes (`astro check`: 0 errors, 0 warnings you introduced)
- `npm run format:check` passes (run `npm run format` if not)

**Non-negotiables (CLAUDE.md)**
- Name, role, email, CV link and "Skip the journey" are visible on every world page touched
- Facts render as HTML without JS (check the built HTML in `dist/` for the key text)
- Every in-world label has its plain label next to it
- No banned phrases (DESIGN.md §8), no copied game assets
- No raw hex / px font sizes / ms durations in components (grep the diff); new values are tokens
- No invented facts or numbers; missing ones are `TODO(Akrem)`

**Accessibility**
- Every interactive element is reachable and operable by keyboard; focus is visible; dialogs trap and restore focus
- Images have `alt` (decorative = `alt=""` / `aria-hidden`); SVG charts have a text alternative
- Body text contrast ≥ 4.5:1 (use tokens in DESIGN.md §1)
- Touch targets ≥ 44px; works at 360px wide
- `prefers-reduced-motion` honoured (no warp, no particles, no camera drift)

**Performance**
- 2D pages: no Three.js in the network panel; only the layout's small scripts
- 3D pages: renderer disposed on `astro:before-swap`, loop paused when hidden, fallback works with WebGL disabled
- New images/models/audio within ASSETS.md budgets (`npm run models:inspect` for models)

**Git**
- On a `feat/…` or `fix/…` branch, not `main`
- `git config core.hooksPath` is `.githooks`
- No AI attribution anywhere in the diff or the proposed commit message (`Co-Authored-By`, "Generated with", claude.ai / claude.com links)
- No infra changes (no `vercel.json` or project settings edits unless Akrem asked)

**Sound** (once M10 exists)
- Nothing plays without a user choice; the choice persists across reloads

Then give me a short "how to check it yourself" list: routes to open and what to try.
