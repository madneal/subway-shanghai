/**
 * Fetch Shanghai metro schematic + timetable data from Amap and regenerate
 * src/data/{Data.js,stations.json,transfers.json,labels.json,stationInfo.json}.
 *
 * Usage: node scripts/update-metro-data.mjs
 *
 * Data sources (public Amap subway APIs, no key required for these endpoints):
 *   - drawing:  .../subway?_v2.0&srhdata=3100_drw_shanghai.json
 *   - info:     .../subway?_v2.0&srhdata=3100_info_shanghai.json
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data');
const RAW_DIR = join(ROOT, 'src', 'data', 'raw');

const DRAW_URL =
  'https://map.amap.com/service/subway?_v2.0&srhdata=3100_drw_shanghai.json';
const INFO_URL =
  'https://map.amap.com/service/subway?_v2.0&srhdata=3100_info_shanghai.json';

const UA =
  'Mozilla/5.0 (compatible; subway-shanghai-data-bot/1.0; +https://github.com/madneal/subway-shanghai)';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Stable short key used in lineColor / linePath / timesheet grouping. */
function lineKeyFromName(ln, ls, usedKeys) {
  const name = (ln || '').trim();
  const numMatch = name.match(/^(\d+)号线/);
  if (numMatch) {
    const base = numMatch[1];
    // Branches (e.g. two 5/10/11 segments) get a/b/c suffixes.
    if (!usedKeys.has(base)) {
      usedKeys.add(base);
      return base;
    }
    let i = 0;
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    while (usedKeys.has(base + letters[i])) i += 1;
    const key = base + letters[i];
    usedKeys.add(key);
    return key;
  }
  const specials = {
    磁浮线: 'maglev',
    浦江线: 'pujiang',
    轨道交通浦江线: 'pujiang',
    市域机场线: 'airport',
  };
  if (specials[name]) {
    const key = specials[name];
    usedKeys.add(key);
    return key;
  }
  // Fallback: Amap line id
  const key = `ls_${ls}`;
  usedKeys.add(key);
  return key;
}

function displayName(ln, kn) {
  if (ln && ln.trim()) return ln.trim();
  if (kn && kn.trim()) return kn.replace(/^地铁/, '').trim();
  return '未知线路';
}

function parsePoints(c) {
  if (!c) return [];
  const parts = Array.isArray(c) ? c : String(c).split(',');
  return parts
    .map((p) => {
      const [x, y] = String(p).trim().split(/\s+/).map(Number);
      return { x, y };
    })
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

function pointsToSvgPath(points) {
  if (!points.length) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ');
}

function colorHex(cl) {
  const raw = String(cl || '999999').replace(/^#/, '');
  return `#${raw.toUpperCase()}`;
}

function isValidTime(t) {
  return typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t);
}

function build() {
  return Promise.all([fetchJson(DRAW_URL), fetchJson(INFO_URL)]).then(
    ([draw, info]) => {
      mkdirSync(RAW_DIR, { recursive: true });
      writeFileSync(
        join(RAW_DIR, 'amap-draw.json'),
        JSON.stringify(draw, null, 2)
      );
      writeFileSync(
        join(RAW_DIR, 'amap-info.json'),
        JSON.stringify(info, null, 2)
      );

      const usedKeys = new Set();
      const lineColor = {};
      const lineNames = {}; // key → display name
      const linePath = {};
      const lsToKey = {}; // Amap ls → our key
      const sidToStation = new Map(); // si → { name, x, y, lines:Set, colors:Set, isTransfer }

      // --- lines + stations from drawing ---
      for (const line of draw.l || []) {
        const key = lineKeyFromName(line.ln, line.ls, usedKeys);
        const name = displayName(line.ln, line.kn);
        const color = colorHex(line.cl);
        lsToKey[line.ls] = key;
        lineColor[key] = color;
        lineNames[key] = name;
        linePath[key] = pointsToSvgPath(parsePoints(line.c));

        for (const st of line.st || []) {
          if (!st.si || !st.p) continue;
          const [x, y] = String(st.p).trim().split(/\s+/).map(Number);
          if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
          const existing = sidToStation.get(st.si);
          if (existing) {
            existing.lines.add(key);
            existing.colors.add(color);
            if (st.t === '1') existing.isTransfer = true;
          } else {
            sidToStation.set(st.si, {
              si: st.si,
              name: st.n || st.sp || st.si,
              x,
              y,
              lines: new Set([key]),
              colors: new Set([color]),
              isTransfer: st.t === '1',
            });
          }
        }
      }

      // Promote multi-line stations to transfers
      for (const st of sidToStation.values()) {
        if (st.lines.size > 1) st.isTransfer = true;
      }

      // --- station list + transfers ---
      const stations = [];
      const transfers = [];
      const labels = [];

      // Line name labels: put near the first station of each line segment
      for (const line of draw.l || []) {
        const key = lsToKey[line.ls];
        const name = lineNames[key];
        const color = lineColor[key];
        const first = (line.st || [])[0];
        if (!first?.p) continue;
        const [x, y] = String(first.p).trim().split(/\s+/).map(Number);
        labels.push({
          x: String(x + 12),
          y: String(y - 10),
          fill: color,
          text: name,
        });
      }

      for (const st of sidToStation.values()) {
        // Prefer a numeric line color if present, else first color
        let stroke = [...st.colors][0];
        for (const key of st.lines) {
          if (/^\d/.test(key)) {
            stroke = lineColor[key];
            break;
          }
        }

        if (st.isTransfer) {
          transfers.push({
            x: String(st.x - 8),
            y: String(st.y - 8),
            'data-id': st.name,
            statid: st.si,
          });
        } else {
          stations.push({
            cx: String(st.x),
            cy: String(st.y),
            stroke,
            id: st.name,
            statid: st.si,
          });
        }

        // Station name label (offset to the right)
        labels.push({
          x: String(st.x + 8),
          y: String(st.y - 6),
          text: st.name,
        });
      }

      // --- stationInfo / timesheets from info API ---
      // Build si → name for direction endpoints
      const siToName = new Map(
        [...sidToStation.values()].map((s) => [s.si, s.name])
      );

      // Also map from draw stations that might only appear as direction targets
      for (const line of draw.l || []) {
        for (const st of line.st || []) {
          if (st.si && st.n) siToName.set(st.si, st.n);
        }
      }

      const stationInfo = {};
      // Ensure every drawn station has an info record (even if times are missing).
      for (const st of sidToStation.values()) {
        stationInfo[st.si] = {
          timesheet: [],
          elevator: '',
          entranceInfo: '',
          toiletPosition: '',
        };
      }

      for (const line of info.l || []) {
        for (const st of line.st || []) {
          if (!st.si) continue;
          if (!stationInfo[st.si]) {
            stationInfo[st.si] = {
              timesheet: [],
              elevator: '',
              entranceInfo: '',
              toiletPosition: '',
            };
          }
          const seen = new Set(
            stationInfo[st.si].timesheet.map(
              (r) => `${r.line}|${r.description}|${r.first_time}|${r.last_time}`
            )
          );
          for (const d of st.d || []) {
            if (!isValidTime(d.ft) || !isValidTime(d.lt)) continue;
            const lineKey = lsToKey[d.ls] || d.ls;
            const lineName = lineNames[lineKey] || lineKey;
            const destName = siToName.get(d.n) || d.n || '终点';
            // Skip rows where dest is the same station (placeholder pairs in Amap data)
            if (d.n === st.si) continue;
            const row = {
              line: lineKey,
              lineName,
              stat_id: st.si,
              name: siToName.get(st.si) || '',
              first_time: d.ft,
              first_time_desc: '',
              last_time: d.lt,
              last_time_desc: '',
              description: `往${destName}方向`,
            };
            const sig = `${row.line}|${row.description}|${row.first_time}|${row.last_time}`;
            if (seen.has(sig)) continue;
            seen.add(sig);
            stationInfo[st.si].timesheet.push(row);
          }
        }
      }

      // --- write Data.js ---
      const dataJs = `// Auto-generated by scripts/update-metro-data.mjs — do not edit by hand.
// Source: Amap Shanghai subway schematic (3100_drw / 3100_info).
// Regenerated: ${new Date().toISOString()}

export const lineColor = ${JSON.stringify(lineColor, null, 2)};

/** Display name for each line key (e.g. "1" → "1号线", "pujiang" → "浦江线"). */
export const lineNames = ${JSON.stringify(lineNames, null, 2)};

const linePath = ${JSON.stringify(linePath, null, 2)};

export default linePath;
`;

      writeFileSync(join(DATA_DIR, 'Data.js'), dataJs);
      writeFileSync(
        join(DATA_DIR, 'stations.json'),
        JSON.stringify(stations, null, 2) + '\n'
      );
      writeFileSync(
        join(DATA_DIR, 'transfers.json'),
        JSON.stringify(transfers, null, 2) + '\n'
      );
      writeFileSync(
        join(DATA_DIR, 'labels.json'),
        JSON.stringify(labels, null, 2) + '\n'
      );
      writeFileSync(
        join(DATA_DIR, 'stationInfo.json'),
        JSON.stringify(stationInfo) + '\n'
      );

      // Metadata for viewBox / docs
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const st of sidToStation.values()) {
        minX = Math.min(minX, st.x);
        minY = Math.min(minY, st.y);
        maxX = Math.max(maxX, st.x);
        maxY = Math.max(maxY, st.y);
      }
      const meta = {
        source: { draw: DRAW_URL, info: INFO_URL },
        generatedAt: new Date().toISOString(),
        lines: Object.keys(linePath).length,
        stations: stations.length,
        transfers: transfers.length,
        labels: labels.length,
        stationInfo: Object.keys(stationInfo).length,
        bounds: { minX, minY, maxX, maxY },
        viewBox: `0 0 ${Math.ceil(maxX + 80)} ${Math.ceil(maxY + 80)}`,
        lineNames,
      };
      writeFileSync(
        join(DATA_DIR, 'meta.json'),
        JSON.stringify(meta, null, 2) + '\n'
      );

      console.log('Updated metro data:');
      console.log(JSON.stringify(meta, null, 2));
      return meta;
    }
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
