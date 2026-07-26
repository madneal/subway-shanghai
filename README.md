# :train2::train2::train2: Subway Shanghai

Interactive Shanghai metro map. Originally rebuilt on Create React App; now runs on **Vite + React 18**.

Live site: https://neal1991.github.io/subway-shanghai/

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
npm run deploy     # build + publish dist/ to gh-pages
```

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

[MIT](https://github.com/neal1991/subway-shanghai/blob/master/LICENSE.md)
