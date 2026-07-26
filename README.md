# :train2::train2::train2: Subway Shanghai

Interactive Shanghai metro map. Originally rebuilt on Create React App; now runs on **Vite + React 18**.

Live site: https://madneal.com/subway-shanghai/

## Component structure

The whole map is a `Map` component with four child pieces:

![map](https://camo.githubusercontent.com/5491a1b2fcde37cc7dc78ca4890b16316ae5d87d/687474703a2f2f6f7a666f346a6a78622e626b742e636c6f7564646e2e636f6d2f6d61702e706e67)

* **Label** — station and line name text
* **Station** — normal and transfer stations
* **Line** — metro line paths
* **InfoCard** — timesheet, washroom, entrance, and elevator info

![subway-react](https://user-images.githubusercontent.com/12164075/37656324-ace5c2b2-2c82-11e8-8b6a-b3c96e091c73.gif)

## Develop

```bash
npm install
npm start          # Vite dev server (http://localhost:5173/subway-shanghai/)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run deploy     # optional local deploy via gh-pages branch (prefer Actions)
```

## Deploy with GitHub Actions

Pushing to `master` runs two workflows:

| Workflow | File | When | What |
|----------|------|------|------|
| **CI** | `.github/workflows/ci.yml` | PR + push to `master` | `npm test` + `npm run build` |
| **Deploy GitHub Pages** | `.github/workflows/deploy-pages.yml` | push to `master` / manual | test → build → publish Pages |

### One-time GitHub settings

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. If you use a custom domain (`madneal.com`):
   - Set **Custom domain** to `madneal.com`
   - Keep DNS pointing at GitHub and enable **Enforce HTTPS**
4. Under **Settings → Actions → General → Workflow permissions**, allow the default workflow `GITHUB_TOKEN` to deploy Pages (the workflow already sets `pages: write` + `id-token: write`).

### First deploy / redeploy

- Merge to `master`, or open **Actions → Deploy GitHub Pages → Run workflow**.
- After it is green, open https://madneal.com/subway-shanghai/ and confirm the HTML loads `/subway-shanghai/assets/index-*.js` (Vite), not `/static/js/main.*.chunk.js` (old CRA).

## Test

Three layers, from fast to full:

| Command | What it covers |
|---------|----------------|
| `npm test` | Unit + component tests (Vitest + Testing Library) — timesheet math, data integrity, map click → info card |
| `npm run test:watch` | Same suite in watch mode while coding |
| `npm run test:coverage` | Coverage report under `coverage/` |
| `npm run test:e2e` | Playwright smoke against the production build (`vite preview`) — load map, open/close station card |
| `npm run test:all` | Unit tests → production build → e2e |

First-time e2e setup (install browser once):

```bash
npx playwright install chromium
```

## LICENSE

[MIT](https://github.com/madneal/subway-shanghai/blob/master/LICENSE.md)
