/**
 * Download official Shanghai Metro station data and store it LOCALLY under
 * src/data/official/. This is the only step that hits m.shmetro.com.
 *
 * Runtime / production never call these APIs — the app only reads the
 * committed JSON under src/data/.
 *
 * Usage:
 *   node scripts/fetch-official-data.mjs
 *   npm run fetch-official
 *
 * Sources (from https://m.shmetro.com/workspace/shmetrotest/view_csdt.aspx):
 *   - metromap.aspx                      station list + map locations
 *   - metromap.aspx?func=lines            line colors
 *   - metromap.aspx?func=stationInfo      toilet / elevator / entrance
 *   - metromap.aspx?func=fltimeA          first/last train times
 */

import {
  writeFileSync,
  mkdirSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'src', 'data', 'official');

const BASE = 'https://m.shmetro.com/interface/metromap/metromap.aspx';
const UA =
  'Mozilla/5.0 (compatible; subway-shanghai-data-bot/1.0; +https://github.com/madneal/subway-shanghai)';

const CONCURRENCY = 6;
const RETRIES = 3;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  let lastErr;
  for (let i = 0; i < RETRIES; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function stationCodeFromLocationId(id) {
  // "ST10000000080-SDGL" → "10000000080-SDGL"
  // "ST11-XZ" → "11-XZ"
  if (!id || !id.startsWith('ST')) return null;
  return id.slice(2);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('Fetching official map locations…');
  const map = await fetchJson(BASE);
  const locations = map?.levels?.[0]?.locations || [];
  writeFileSync(
    join(OUT_DIR, 'map-locations.json'),
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        mapSvg: map?.levels?.[0]?.map || null,
        mapwidth: map?.mapwidth,
        mapheight: map?.mapheight,
        locations,
      },
      null,
      2
    ) + '\n'
  );
  console.log(`  ${locations.length} locations`);

  console.log('Fetching line colors…');
  const lines = await fetchJson(`${BASE}?func=lines`);
  writeFileSync(
    join(OUT_DIR, 'lines.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), lines }, null, 2) +
      '\n'
  );
  console.log(`  ${lines.length} lines`);

  // Unique station codes
  const codes = [];
  const seen = new Set();
  for (const loc of locations) {
    const code = stationCodeFromLocationId(loc.id);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    codes.push({ code, title: loc.title, id: loc.id, x: loc.x, y: loc.y });
  }
  console.log(`Fetching stationInfo + fltime for ${codes.length} stations…`);

  // Resume support: merge into existing stations.json if present
  const stationsPath = join(OUT_DIR, 'stations.json');
  const stations = existsSync(stationsPath)
    ? JSON.parse(readFileSync(stationsPath, 'utf8')).stations || {}
    : {};

  let ok = 0;
  let fail = 0;
  await mapPool(codes, CONCURRENCY, async (item, index) => {
    // Skip already-fetched if --resume and has both fields
    if (
      process.argv.includes('--resume') &&
      stations[item.code]?.info &&
      stations[item.code]?.fltime
    ) {
      ok += 1;
      return;
    }
    try {
      const [info, fltime] = await Promise.all([
        fetchJson(
          `${BASE}?func=stationInfo&station_code=${encodeURIComponent(item.code)}`
        ),
        fetchJson(
          `${BASE}?func=fltimeA&station_code=${encodeURIComponent(item.code)}`
        ),
      ]);
      stations[item.code] = {
        locationId: item.id,
        title: item.title,
        mapX: item.x,
        mapY: item.y,
        info: Array.isArray(info) ? info : [],
        fltime: Array.isArray(fltime) ? fltime : [],
      };
      ok += 1;
    } catch (err) {
      fail += 1;
      console.warn(`  fail ${item.code} (${item.title}): ${err.message}`);
      if (!stations[item.code]) {
        stations[item.code] = {
          locationId: item.id,
          title: item.title,
          mapX: item.x,
          mapY: item.y,
          info: [],
          fltime: [],
          error: String(err.message || err),
        };
      }
    }
    if ((index + 1) % 40 === 0 || index + 1 === codes.length) {
      console.log(`  progress ${index + 1}/${codes.length} (ok=${ok} fail=${fail})`);
      // checkpoint
      writeFileSync(
        stationsPath,
        JSON.stringify(
          {
            fetchedAt: new Date().toISOString(),
            count: Object.keys(stations).length,
            stations,
          },
          null,
          2
        ) + '\n'
      );
    }
  });

  // Name index for merge step
  const byName = {};
  for (const [code, st] of Object.entries(stations)) {
    const name =
      st.info?.[0]?.name_cn || st.title || st.info?.[0]?.name || '';
    if (!name) continue;
    if (!byName[name]) byName[name] = [];
    byName[name].push(code);
  }

  writeFileSync(
    stationsPath,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        count: Object.keys(stations).length,
        stations,
      },
      null,
      2
    ) + '\n'
  );
  writeFileSync(
    join(OUT_DIR, 'name-index.json'),
    JSON.stringify(
      { fetchedAt: new Date().toISOString(), byName },
      null,
      2
    ) + '\n'
  );
  writeFileSync(
    join(OUT_DIR, 'meta.json'),
    JSON.stringify(
      {
        source: 'https://m.shmetro.com/workspace/shmetrotest/view_csdt.aspx',
        apis: {
          map: BASE,
          lines: `${BASE}?func=lines`,
          stationInfo: `${BASE}?func=stationInfo&station_code=…`,
          fltime: `${BASE}?func=fltimeA&station_code=…`,
        },
        fetchedAt: new Date().toISOString(),
        locationCount: locations.length,
        stationCount: Object.keys(stations).length,
        ok,
        fail,
      },
      null,
      2
    ) + '\n'
  );

  console.log(
    `Done. Wrote ${Object.keys(stations).length} stations → src/data/official/ (ok=${ok} fail=${fail})`
  );
  console.log(
    'App runtime never calls m.shmetro.com; re-run this script only when refreshing the local dump.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
