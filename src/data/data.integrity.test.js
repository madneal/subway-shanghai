import { describe, expect, it } from 'vitest';
import linePath, { lineColor, lineNames } from './Data';
import stations from './stations.json';
import transfers from './transfers.json';
import labels from './labels.json';
import stationInfos from './stationInfo.json';
import meta from './meta.json';

function pathPoints(path) {
  return [...path.matchAll(/[ML](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(
    ([, x, y]) => ({ x: Number(x), y: Number(y) })
  );
}

function collinearOverlap(a, b, c, d) {
  const cross = (p, q, r) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  if (cross(a, b, c) !== 0 || cross(a, b, d) !== 0) return false;

  const axis = Math.abs(a.x - b.x) >= Math.abs(a.y - b.y) ? 'x' : 'y';
  const overlapStart = Math.max(
    Math.min(a[axis], b[axis]),
    Math.min(c[axis], d[axis])
  );
  const overlapEnd = Math.min(
    Math.max(a[axis], b[axis]),
    Math.max(c[axis], d[axis])
  );
  return overlapEnd - overlapStart > 2;
}

describe('line path / color data', () => {
  it('covers modern Shanghai network (14/15/18 + branches)', () => {
    expect(Object.keys(linePath).length).toBeGreaterThanOrEqual(20);
    for (const required of ['1', '2', '14', '15', '18', 'pujiang', 'maglev']) {
      expect(linePath[required], `missing path ${required}`).toBeTruthy();
      expect(lineColor[required], `missing color ${required}`).toBeTruthy();
      expect(lineNames[required], `missing name ${required}`).toBeTruthy();
    }
  });

  it('every line path has a color and non-empty geometry', () => {
    for (const key of Object.keys(linePath)) {
      expect(lineColor[key], `missing color for line ${key}`).toBeTruthy();
      expect(linePath[key].length).toBeGreaterThan(10);
      expect(linePath[key].startsWith('M')).toBe(true);
    }
  });

  it('line colors are hex strings', () => {
    for (const [line, color] of Object.entries(lineColor)) {
      expect(color, `line ${line}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('does not draw unrelated lines on top of each other', () => {
    const keys = Object.keys(linePath);
    const geometry = Object.fromEntries(
      keys.map((key) => [key, pathPoints(linePath[key])])
    );

    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const first = keys[i];
        const second = keys[j];
        // Branch keys such as 10/10a intentionally share their trunk.
        if (first.replace(/[a-z]+$/, '') === second.replace(/[a-z]+$/, '')) {
          continue;
        }
        for (let a = 1; a < geometry[first].length; a++) {
          for (let b = 1; b < geometry[second].length; b++) {
            expect(
              collinearOverlap(
                geometry[first][a - 1],
                geometry[first][a],
                geometry[second][b - 1],
                geometry[second][b]
              ),
              `lines ${first} and ${second} share a visible path segment`
            ).toBe(false);
          }
        }
      }
    }
  });
});

describe('stations & transfers', () => {
  it('has a non-empty station list with required fields', () => {
    expect(stations.length).toBeGreaterThan(200);
    for (const station of stations) {
      expect(station).toHaveProperty('cx');
      expect(station).toHaveProperty('cy');
      expect(station).toHaveProperty('stroke');
      expect(station.id).toBeTruthy();
      expect(station.statid).toBeTruthy();
    }
  });

  it('most stations with a statid have stationInfo', () => {
    const withId = stations.filter((s) => s.statid);
    const missing = withId.filter((s) => !stationInfos[s.statid]);
    expect(missing.length).toBeLessThan(40);
    expect(withId.length - missing.length).toBeGreaterThan(200);
  });

  it('every transfer has coordinates, name, and info', () => {
    expect(transfers.length).toBeGreaterThan(50);
    for (const t of transfers) {
      expect(t.x).toBeDefined();
      expect(t.y).toBeDefined();
      expect(t['data-id']).toBeTruthy();
      expect(t.statid).toBeTruthy();
      expect(stationInfos[t.statid], `transfer ${t['data-id']}`).toBeTruthy();
    }
  });
});

describe('stationInfo payload', () => {
  it('entries include timesheet rows with required fields when present', () => {
    const withRows = Object.entries(stationInfos).filter(
      ([, info]) => info.timesheet?.length > 0
    );
    expect(withRows.length).toBeGreaterThan(200);
    for (const [, info] of withRows.slice(0, 40)) {
      expect(Array.isArray(info.timesheet)).toBe(true);
      for (const row of info.timesheet) {
        expect(row.line).toBeDefined();
        expect(row.first_time).toMatch(/^\d{1,2}:\d{2}$/);
        expect(row.last_time).toMatch(/^\d{1,2}:\d{2}$/);
        expect(row.description).toMatch(/^往.+方向$/);
      }
    }
  });
});

describe('labels & meta', () => {
  it('includes line name labels for numbered lines', () => {
    const lineLabels = labels.filter((l) => /号线|磁浮|浦江|机场/.test(l.text));
    expect(lineLabels.length).toBeGreaterThan(15);
  });

  it('meta viewBox matches generated bounds and is offline', () => {
    expect(meta.viewBox).toMatch(/^0 0 \d+ \d+$/);
    expect(meta.lines).toBe(Object.keys(linePath).length);
    expect(meta.runtimeNetwork).toBe(false);
    expect(meta.sources.facilitiesAndTimes).toContain('official');
    expect(meta.matchedOfficial).toBeGreaterThan(300);
    expect(meta.withFacilities).toBeGreaterThan(300);
  });
});
