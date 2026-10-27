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

### 2026-10-27: `Frame` forwards extra attributes like `TextBox`
So a parent's scoped styles on `<Frame class="…">` apply (Astro passes the scope as a `data-astro-cid-*` attribute).
