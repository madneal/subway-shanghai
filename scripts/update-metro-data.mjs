/**
 * Rebuild app map data from LOCAL sources only (no network).
 *
 * Inputs (must already exist on disk):
 *   - src/data/raw/amap-draw.json          Amap schematic (optional geometry source)
 *   - src/data/raw/amap-info.json          Amap fallback times
 *   - src/data/official/stations.json     Official shmetro dump (toilet/elevator/entrance/fltime)
 *   - src/data/official/lines.json        Official line colors
 *   - src/data/official/map-locations.json Official location pins
 *
 * Outputs:
 *   - src/data/{Data.js,stations.json,transfers.json,labels.json,stationInfo.json,meta.json}
 *
 * Usage:
 *   npm run fetch-official          # network: refresh official dump once
 *   npm run fetch-amap              # network: refresh amap schematic once (optional)
 *   npm run update-data             # offline: rebuild app JSON from local files
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
const DATA_DIR = join(ROOT, 'src', 'data');
const RAW_DIR = join(DATA_DIR, 'raw');
const OFFICIAL_DIR = join(DATA_DIR, 'official');

function readJson(path) {
  if (!existsSync(path)) {
    throw new Error(
      `Missing local data file: ${path}\nRun npm run fetch-official (and optionally npm run fetch-amap) first.`
    );
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function lineKeyFromName(ln, ls, usedKeys) {
  const name = (ln || '').trim();
  const numMatch = name.match(/^(\d+)号线/);
  if (numMatch) {
    const base = numMatch[1];
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
    usedKeys.add(specials[name]);
    return specials[name];
  }
  const key = `ls_${ls}`;
  usedKeys.add(key);
  return key;
}

function displayName(ln, kn) {
  if (ln && ln.trim()) return ln.trim();
  if (kn && kn.trim()) return kn.replace(/^地铁/, '').trim();
  return '未知线路';
}

/** Official line_no → our line key / display name */
const OFFICIAL_LINE_MAP = {
  41: { key: 'pujiang', name: '浦江线' },
  51: { key: 'maglev', name: '磁浮线' },
  // 市域机场线 may appear under other codes; keep numeric if unknown
};

function officialLineKey(lineNo) {
  const n = Number(lineNo);
  if (OFFICIAL_LINE_MAP[n]) return OFFICIAL_LINE_MAP[n].key;
  return String(n);
}

function officialLineName(lineNo, lineNames) {
  const n = Number(lineNo);
  if (OFFICIAL_LINE_MAP[n]) return OFFICIAL_LINE_MAP[n].name;
  if (lineNames[String(n)]) return lineNames[String(n)];
  return `${n}号线`;
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

/**
 * Place a line name offset from the track (perpendicular to the path),
 * so labels don't sit on top of the colored stroke.
 */
function lineLabelPosition(points) {
  if (!points.length) return { x: 0, y: 0 };
  if (points.length === 1) {
    return { x: points[0].x + 16, y: points[0].y - 18 };
  }
  // ~20% along the polyline for a stable, non-crowded label spot
  const idx = Math.min(
    points.length - 2,
    Math.max(0, Math.floor(points.length * 0.2))
  );
  const a = points[idx];
  const b = points[idx + 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular unit vector
  let nx = -dy / len;
  let ny = dx / len;
  // Prefer offset toward the upper-left of the canvas for consistency
  if (nx * -1 + ny * -1 < 0) {
    nx = -nx;
    ny = -ny;
  }
  const OFFSET = 24;
  return {
    x: a.x + nx * OFFSET,
    y: a.y + ny * OFFSET,
  };
}

function colorHex(cl) {
  const raw = String(cl || '999999').replace(/^#/, '');
  return `#${raw.toUpperCase()}`;
}

function isValidTime(t) {
  return typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t);
}

/** Official JSON sometimes uses single-quoted keys. */
function parseLooseJson(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(String(raw).replace(/'/g, '"'));
  } catch {
    return null;
  }
}

function formatToilet(raw) {
  const data = parseLooseJson(raw);
  if (!data?.toilet?.length) {
    // fall back to English plain text if present
    return typeof raw === 'string' && !raw.trim().startsWith('{') ? raw : '';
  }
  return data.toilet
    .map((t) => {
      const line = t.lineno ? `${t.lineno}号线：` : '';
      return `${line}${t.description || ''}`.trim();
    })
    .filter(Boolean)
    .join('<br />');
}

function formatElevator(raw) {
  const data = parseLooseJson(raw);
  if (!data?.line?.length) {
    return typeof raw === 'string' && !raw.trim().startsWith('{') ? raw : '';
  }
  const parts = [];
  for (const ln of data.line) {
    const linePrefix = ln.lineno ? `${ln.lineno}号线：` : '';
    for (const el of ln.elevator || []) {
      parts.push(`${linePrefix}${el.description || ''}`.trim());
    }
  }
  return parts.filter(Boolean).join('<br />');
}

function formatEntrance(raw, enFallback) {
  const data = parseLooseJson(raw);
  if (!data?.line?.length) {
    if (typeof enFallback === 'string' && enFallback) {
      // "Exit 1:…,Exit 2:…" style — keep Chinese if we have nothing else
      return enFallback
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join('<br />');
    }
    return typeof raw === 'string' && !raw.trim().startsWith('{') ? raw : '';
  }
  const parts = [];
  for (const ln of data.line) {
    for (const ent of ln.entrance || []) {
      const id = ent.id_alias || (ent.id != null ? `${ent.id}号出入口` : '');
      const desc = ent.description || '';
      const memo = ent.memo ? `（${ent.memo}）` : '';
      parts.push(`${id}: ${desc}${memo}`.trim());
    }
  }
  return parts.filter(Boolean).join('<br />');
}

function normalizeName(name) {
  return String(name || '')
    .replace(/\s+/g, '')
    .replace(/（/g, '(')
    .replace(/）/g, ')');
}

function directionText(desc) {
  if (!desc) return '往终点方向';
  const t = String(desc).trim();
  if (t.endsWith('方向')) return t;
  if (t.startsWith('往')) return `${t}方向`;
  return `往${t}方向`;
}

function build() {
  mkdirSync(DATA_DIR, { recursive: true });

  const draw = readJson(join(RAW_DIR, 'amap-draw.json'));
  const amapInfo = existsSync(join(RAW_DIR, 'amap-info.json'))
    ? readJson(join(RAW_DIR, 'amap-info.json'))
    : { l: [] };
  const officialStations = readJson(join(OFFICIAL_DIR, 'stations.json'));
  const officialLines = existsSync(join(OFFICIAL_DIR, 'lines.json'))
    ? readJson(join(OFFICIAL_DIR, 'lines.json'))
    : { lines: [] };
  const officialMeta = existsSync(join(OFFICIAL_DIR, 'meta.json'))
    ? readJson(join(OFFICIAL_DIR, 'meta.json'))
    : {};

  // Index official stations by Chinese name
  const officialByName = new Map();
  for (const [code, st] of Object.entries(officialStations.stations || {})) {
    const name = normalizeName(st.info?.[0]?.name_cn || st.title);
    if (!name) continue;
    if (!officialByName.has(name)) officialByName.set(name, []);
    officialByName.get(name).push({ code, ...st });
  }

  const usedKeys = new Set();
  const lineColor = {};
  const lineNames = {};
  const linePath = {};
  const lsToKey = {};
  const sidToStation = new Map();

  // Prefer official line colors when available
  for (const ln of officialLines.lines || []) {
    const key = officialLineKey(ln.line_no);
    lineColor[key] = colorHex(ln.color);
    if (!OFFICIAL_LINE_MAP[Number(ln.line_no)]) {
      lineNames[key] = `${ln.line_no}号线`;
    } else {
      lineNames[key] = OFFICIAL_LINE_MAP[Number(ln.line_no)].name;
    }
  }

  // Geometry from local Amap dump
  for (const line of draw.l || []) {
    const key = lineKeyFromName(line.ln, line.ls, usedKeys);
    const name = displayName(line.ln, line.kn);
    const color = colorHex(line.cl);
    lsToKey[line.ls] = key;
    if (!lineColor[key]) lineColor[key] = color;
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

  for (const st of sidToStation.values()) {
    if (st.lines.size > 1) st.isTransfer = true;
  }

  const stations = [];
  const transfers = [];
  const labels = [];

  // One label per line key (avoid duplicate 5/5a names stacked on the same spot)
  const placedLineKeys = new Set();
  for (const line of draw.l || []) {
    const key = lsToKey[line.ls];
    if (placedLineKeys.has(key)) continue;
    placedLineKeys.add(key);
    const name = lineNames[key];
    const color = lineColor[key];
    const pts = parsePoints(line.c);
    if (!pts.length) continue;
    const pos = lineLabelPosition(pts);
    labels.push({
      x: String(Math.round(pos.x)),
      y: String(Math.round(pos.y)),
      fill: color,
      text: name,
      kind: 'line',
    });
  }

  for (const st of sidToStation.values()) {
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

    // Station names sit slightly above-right of the dot, off the track stroke.
    labels.push({
      x: String(st.x + 10),
      y: String(st.y - 10),
      text: st.name,
      kind: 'station',
    });
  }

  // Amap fallback times by si
  const amapTimesBySi = new Map();
  for (const line of amapInfo.l || []) {
    for (const st of line.st || []) {
      if (!st.si) continue;
      if (!amapTimesBySi.has(st.si)) amapTimesBySi.set(st.si, []);
      amapTimesBySi.get(st.si).push(...(st.d || []));
    }
  }

  const siToName = new Map(
    [...sidToStation.values()].map((s) => [s.si, s.name])
  );

  const stationInfo = {};
  let matchedOfficial = 0;
  let withFacilities = 0;

  for (const st of sidToStation.values()) {
    const nameKey = normalizeName(st.name);
    const officialList = officialByName.get(nameKey) || [];
    // Prefer the entry with the richest info payload
    const official = [...officialList].sort(
      (a, b) =>
        (b.info?.[0] ? 1 : 0) +
        (b.fltime?.length || 0) -
        ((a.info?.[0] ? 1 : 0) + (a.fltime?.length || 0))
    )[0];

    const infoRow = official?.info?.[0] || null;
    const fltime = official?.fltime || [];

    if (official) matchedOfficial += 1;

    const toiletPosition = formatToilet(infoRow?.toilet_position);
    const elevator = formatElevator(infoRow?.elevator);
    const entranceInfo = formatEntrance(
      infoRow?.entrance_info,
      infoRow?.entrance_info_en
    );
    if (toiletPosition || elevator || entranceInfo) withFacilities += 1;

    const timesheet = [];
    const seen = new Set();

    // Prefer official first/last trains
    for (const row of fltime) {
      if (!isValidTime(row.first_time) || !isValidTime(row.last_time)) continue;
      const lineKey = officialLineKey(row.line);
      if (!lineNames[lineKey]) {
        lineNames[lineKey] = officialLineName(row.line, lineNames);
      }
      if (!lineColor[lineKey] && row.line != null) {
        // leave color unset → UI falls back
      }
      const entry = {
        line: lineKey,
        lineName: lineNames[lineKey] || officialLineName(row.line, lineNames),
        stat_id: st.si,
        name: st.name,
        first_time: row.first_time,
        first_time_desc: row.first_time_desc || '',
        last_time: row.last_time,
        last_time_desc: row.last_time_desc || '',
        description: directionText(row.description),
        station_code: official?.code || infoRow?.station_code || '',
      };
      const sig = `${entry.line}|${entry.description}|${entry.first_time}|${entry.last_time}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      timesheet.push(entry);
    }

    // Fallback: Amap times if official empty
    if (!timesheet.length) {
      for (const d of amapTimesBySi.get(st.si) || []) {
        if (!isValidTime(d.ft) || !isValidTime(d.lt)) continue;
        if (d.n === st.si) continue;
        const lineKey = lsToKey[d.ls] || d.ls;
        const destName = siToName.get(d.n) || d.n || '终点';
        const entry = {
          line: lineKey,
          lineName: lineNames[lineKey] || lineKey,
          stat_id: st.si,
          name: st.name,
          first_time: d.ft,
          first_time_desc: '',
          last_time: d.lt,
          last_time_desc: '',
          description: directionText(`往${destName}`),
        };
        const sig = `${entry.line}|${entry.description}|${entry.first_time}|${entry.last_time}`;
        if (seen.has(sig)) continue;
        seen.add(sig);
        timesheet.push(entry);
      }
    }

    stationInfo[st.si] = {
      timesheet,
      elevator,
      entranceInfo,
      toiletPosition,
      // keep official code for debugging / future deep-links
      station_code: official?.code || infoRow?.station_code || '',
      name_cn: st.name,
    };
  }

  const dataJs = `// Auto-generated by scripts/update-metro-data.mjs from LOCAL data only.
// Geometry: src/data/raw/amap-*.json
// Facilities + times: src/data/official/* (Shanghai Metro dump; no runtime network)
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
    generatedAt: new Date().toISOString(),
    sources: {
      geometry: 'local:src/data/raw/amap-draw.json',
      facilitiesAndTimes: 'local:src/data/official/',
      officialFetchedAt: officialStations.fetchedAt || officialMeta.fetchedAt || null,
      officialPage:
        'https://m.shmetro.com/workspace/shmetrotest/view_csdt.aspx',
    },
    runtimeNetwork: false,
    lines: Object.keys(linePath).length,
    stations: stations.length,
    transfers: transfers.length,
    labels: labels.length,
    stationInfo: Object.keys(stationInfo).length,
    matchedOfficial,
    withFacilities,
    bounds: { minX, minY, maxX, maxY },
    viewBox: `0 0 ${Math.ceil(maxX + 80)} ${Math.ceil(maxY + 80)}`,
    lineNames,
  };
  writeFileSync(
    join(DATA_DIR, 'meta.json'),
    JSON.stringify(meta, null, 2) + '\n'
  );

  console.log('Rebuilt app data from LOCAL files only:');
  console.log(JSON.stringify(meta, null, 2));
}

try {
  build();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
