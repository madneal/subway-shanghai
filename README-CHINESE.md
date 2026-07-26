# :train2::train2::train2: 上海地铁线路图

交互式上海地铁线路图。

**技术栈：** Vite 6 + React 18  
**线上地址：** https://madneal.com/subway-shanghai/  
**English:** [README.md](./README.md)

早期版本用原生 JS，后用 Create React App 重构，现已迁移到 Vite。

## 地图数据

线路示意图与首末班车时间来自 **高德地图** 公开地铁接口（上海 `3100`）：

| 文件 | 作用 |
|------|------|
| `src/data/Data.js` | 线路颜色、名称、SVG 路径 |
| `src/data/stations.json` | 普通站点 |
| `src/data/transfers.json` | 换乘站 |
| `src/data/labels.json` | 线路/站名文字 |
| `src/data/stationInfo.json` | 各站时刻表等 |
| `src/data/meta.json` | 边界、viewBox、生成信息 |

从上游刷新：

```bash
npm run update-data   # scripts/update-metro-data.mjs
```

会重新拉取高德绘图与 info 数据并覆盖上述文件（含 **1–18 号线**、**浦江线**、**磁浮线**、**市域机场线**）。卫生间/电梯/出入口等设施字段不在高德接口中，可能为空，后续可再接官方数据源。

## 组件结构

将整个地图看作一个 `Map` 组件，再拆成 4 个子组件：

![map.png](http://ozfo4jjxb.bkt.clouddn.com/map.png)

| 组件 | 作用 |
|------|------|
| **Label** | 站名、线路名等文字 |
| **Station** | 普通站与换乘站 |
| **Line** | 地铁线路路径 |
| **InfoCard** | 时刻表、卫生间、出入口、无障碍电梯 |

## 本地开发

```bash
npm install
npm start          # http://localhost:5173/subway-shanghai/
npm run build      # 产物在 dist/
npm run preview    # 本地预览生产构建
```

站点 base 为 `/subway-shanghai/`（GitHub Pages 项目路径），本地开发也使用同一路径。

## 测试

| 命令 | 说明 |
|------|------|
| `npm test` | 单元 + 组件测试（Vitest + Testing Library） |
| `npm run test:watch` | 监听模式 |
| `npm run test:coverage` | 覆盖率报告 → `coverage/` |
| `npm run test:e2e` | Playwright，对生产构建做冒烟测试 |
| `npm run test:all` | 单测 → 构建 → e2e |

首次跑 e2e 需安装浏览器：

```bash
npx playwright install chromium
```

覆盖范围概览：

- **单元** — 时刻表加减时间、周末末班车延长等
- **数据** — 线路颜色、站点/换乘/标签与 stationInfo 结构
- **组件** — 地图渲染、点击站点打开信息卡、关闭按钮
- **E2E** — 真实 Chromium 访问 `vite preview` 产物

## 部署（GitHub Actions）

生产环境由 **`master`** 上的 GitHub Actions 自动部署（Pages 源为 **GitHub Actions**）。

| 工作流 | 文件 | 触发时机 | 做什么 |
|--------|------|----------|--------|
| **CI** | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | PR、push 到 `master` | `npm test` + `npm run build` |
| **Deploy GitHub Pages** | [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) | push 到 `master`，或手动 Run workflow | 测试 → 构建 → 发布 Pages |

合并 PR 到 `master` 会触发对 `master` 的 push，因此 **Deploy 会在合并后自动跑**。也可在 **Actions → Deploy GitHub Pages → Run workflow** 手动重发。

### Pages 设置（本仓库已配置）

1. **Settings → Pages → Source** = **GitHub Actions**  
   （不要选 “Deploy from a branch” / `gh-pages`，否则 `deploy-pages` 会报 *Deployments are only allowed from gh-pages*）
2. 自定义域名 `madneal.com`，开启 HTTPS
3. Workflow 已声明 `pages: write`、`id-token: write`

### 部署后自检

硬刷新 https://madneal.com/subway-shanghai/，页面源码应是 Vite：

```html
<script type="module" src="/subway-shanghai/assets/index-….js">
```

而不是旧的 CRA（`/static/js/main.*.chunk.js` / `webpackJsonp`）。

> 本地 `npm run deploy`（推 `gh-pages` 分支）为遗留方式，日常请用 Actions，避免和自动部署不一致。

## LICENSE

[MIT](./LICENSE.md)
