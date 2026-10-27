# Deployment: GitHub + Vercel

**Owner: Akrem.** Akrem created the GitHub repo and the Vercel account, and links the Vercel project himself.
Claude Code writes code and proposes commits; it **never** creates, links or reconfigures the repo or the Vercel project, and never deploys by hand. Deploys happen automatically when Akrem pushes.

|                  |                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Repo             | https://github.com/lost4onin/Bonefire-protfolio (personal account: Vercel Hobby can't connect to repos owned by GitHub _organisations_) |
| Default branch   | `main` = production                                                                                                                     |
| Hosting          | Vercel, Hobby (free) plan, Git integration                                                                                              |
| Framework preset | Astro (auto-detected). Build `npm run build`, output `dist`, install `npm install`                                                      |
| Node             | 22.x (Project Settings → Build and Deployment → Node.js Version)                                                                        |
| Production URL   | `TODO(Akrem)`: paste here after linking, and in `astro.config.mjs` → `site`                                                             |
| Custom domain    | `TODO(Akrem)` at launch (M12)                                                                                                           |

## How a deploy happens

```
git push origin feat/m3-bonfire   →  Vercel builds  →  Preview URL (unique per branch/commit)
merge PR into main                →  Vercel builds  →  Production URL
```

- Every push to any branch builds a **preview**. Opening a PR makes Vercel comment the preview link on it.
- Merging into `main` builds **production**.
- A failed build never replaces the live site; the previous deployment stays up. Logs are in the Vercel dashboard → Deployments → the failed one.
- Any older deployment can be promoted back to production in one click (Deployments → ⋯ → Promote).

## Akrem's one-time setup checklist (M1)

1. [ ] Clone the repo, copy the starter files in, `npm install` (this also enables the git hook), commit, push `main` (see README → Getting started).
2. [ ] vercel.com → **Add New… → Project** → Import `lost4onin/Bonefire-protfolio` → Framework _Astro_ (auto) → **Deploy**.
3. [ ] Settings → Build and Deployment → Node.js Version **22.x**.
4. [ ] Settings → **Deployment Protection** → Vercel Authentication **on for production too** until launch (so the half-built site isn't public). Use _Shareable Links_ to show it to friends.
5. [ ] Copy the production URL into this file and into `astro.config.mjs` → `site`.
6. [ ] (M9) Settings → Environment Variables → `PUBLIC_WEB3FORMS_KEY` for Production + Preview.
7. [ ] (M11) Analytics tab → enable Web Analytics.
8. [ ] (M12) Domains → add the custom domain, set DNS at the registrar, turn Deployment Protection off for production, update `site`.

## What Claude Code may do

- Run the build locally and fix build errors (`npm run build` is exactly what Vercel runs).
- Read deploy logs **after asking**: `npx vercel inspect <deployment-url> --logs`, `npx vercel ls`.
- Tell Akrem precisely which dashboard setting to change and why.

## What Claude Code must not do

- `gh repo create/delete`, `vercel link`, `vercel git connect`, `vercel deploy`, `vercel --prod`, `vercel domains …`, `vercel project …`, or changing project settings.
- Push, merge or force-push unless Akrem explicitly asks for that specific action.
- Add any AI attribution to commits or PRs (see CLAUDE.md → Repo, hosting and git rules).

## Free-plan limits (Hobby, checked 2026-10-27)

Personal / non-commercial use only · 100 GB Fast Data Transfer per month · 100 deployments per day · 100 MB CLI upload · Deployment Protection (Vercel Authentication) for preview **and** production · Web Analytics 50k events per month. A static Astro site is far below all of these. Source: vercel.com/docs/plans/hobby-plan, vercel.com/docs/limits.
