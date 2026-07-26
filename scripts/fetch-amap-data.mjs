/**
 * Download Amap Shanghai metro schematic into src/data/raw/ (geometry only).
 * Optional — only needed when refreshing line drawing / station pins.
 *
 * Usage: npm run fetch-amap
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, '..', 'src', 'data', 'raw');

const DRAW_URL =
  'https://map.amap.com/service/subway?_v2.0&srhdata=3100_drw_shanghai.json';
const INFO_URL =
  'https://map.amap.com/service/subway?_v2.0&srhdata=3100_info_shanghai.json';
const UA =
  'Mozilla/5.0 (compatible; subway-shanghai-data-bot/1.0; +https://github.com/madneal/subway-shanghai)';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });
  console.log('Fetching Amap draw…');
  const draw = await fetchJson(DRAW_URL);
  writeFileSync(join(RAW_DIR, 'amap-draw.json'), JSON.stringify(draw, null, 2));
  console.log('Fetching Amap info (fallback times)…');
  const info = await fetchJson(INFO_URL);
  writeFileSync(join(RAW_DIR, 'amap-info.json'), JSON.stringify(info, null, 2));
  console.log('Wrote src/data/raw/amap-draw.json and amap-info.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
