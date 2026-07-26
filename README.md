# :train2::train2::train2: Subway Shanghai

Interactive Shanghai metro map.

**Stack:** Vite 6 + React 18  
**Live:** https://madneal.com/subway-shanghai/  
**中文说明:** [README-CHINESE.md](./README-CHINESE.md)

Originally a native JS map, later rewritten with Create React App, and now on Vite.

## Component structure

The map is a `Map` with four child pieces:

![map](https://camo.githubusercontent.com/5491a1b2fcde37cc7dc78ca4890b16316ae5d87d/687474703a2f2f6f7a666f346a6a78622e626b742e636c6f7564646e2e636f6d2f6d61702e706e67)

| Component | Role |
|-----------|------|
| **Label** | Station and line name text |
| **Station** | Normal and transfer stations |
| **Line** | Metro line paths |
| **InfoCard** | Timesheet, washroom, entrance, and elevator info |

![subway-react](https://user-images.githubusercontent.com/12164075/37656324-ace5c2b2-2c82-11e8-8b6a-b3c96e091c73.gif)

## Develop

```bash
npm install
npm start          # http://localhost:5173/subway-shanghai/
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
```

App base path is `/subway-shanghai/` (project GitHub Pages URL). Local dev uses the same base.

## Test

| Command | What it covers |
|---------|----------------|
| `npm test` | Unit + component tests (Vitest + Testing Library) |
| `npm run test:watch` | Same suite in watch mode |
| `npm run test:coverage` | Coverage report under `coverage/` |
| `npm run test:e2e` | Playwright smoke against production build |
| `npm run test:all` | unit tests → build → e2e |

First-time e2e browser install:

```bash
npx playwright install chromium
```

What the suites check:

- **Unit** — timesheet math (weekend last-train extension), pure helpers
- **Data** — line colors, stations/transfers/labels shape, stationInfo fields
- **Component** — map renders; click station opens info card; close works
- **E2E** — real Chromium against `vite preview` build output

## Deploy (GitHub Actions)

Production deploys from **`master`** via GitHub Actions (Pages source = **GitHub Actions**).

| Workflow | File | Triggers | What |
|----------|------|----------|------|
| **CI** | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | PR + push to `master` | `npm test` + `npm run build` |
| **Deploy GitHub Pages** | [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) | push to `master`, or manual **Run workflow** | test → build → publish Pages |

Merging a PR into `master` creates a push to `master`, so **Deploy** runs automatically after merge. You can also redeploy anytime from **Actions → Deploy GitHub Pages → Run workflow**.

### Pages settings (already applied for this repo)

1. **Settings → Pages → Build and deployment → Source** = **GitHub Actions**  
   (not “Deploy from a branch” / `gh-pages` — that breaks `actions/deploy-pages`)
2. Custom domain: `madneal.com`, HTTPS enforced
3. Workflow permissions include `pages: write` and `id-token: write`

### After a deploy

Hard-refresh https://madneal.com/subway-shanghai/ and confirm the HTML loads Vite assets:

```html
<script type="module" src="/subway-shanghai/assets/index-….js">
```

Not the old CRA paths (`/static/js/main.*.chunk.js` / `webpackJsonp`).

> Local `npm run deploy` (gh-pages branch) is legacy; prefer Actions so deploys stay consistent.

## LICENSE

[MIT](./LICENSE.md)
