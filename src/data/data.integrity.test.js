import { describe, expect, it } from 'vitest';
import linePath, { lineColor } from './Data';
import stations from './stations.json';
import transfers from './transfers.json';
import labels from './labels.json';
import stationInfos from './stationInfo.json';

describe('line path / color data', () => {
  it('every line path has a matching color', () => {
    for (const key of Object.keys(linePath)) {
      const lineNum = key.match(/\d+/)[0];
      expect(lineColor[lineNum], `missing color for line ${key}`).toBeTruthy();
      expect(linePath[key].length).toBeGreaterThan(10);
    }
  });

  it('line colors are hex strings', () => {
    for (const [line, color] of Object.entries(lineColor)) {
      expect(color, `line ${line}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('stations & transfers', () => {
  it('has a non-empty station list with required fields', () => {
    expect(stations.length).toBeGreaterThan(100);
    for (const station of stations) {
      expect(station).toHaveProperty('cx');
      expect(station).toHaveProperty('cy');
      expect(station).toHaveProperty('stroke');
    }
  });

  it('most stations with a statid have stationInfo', () => {
    const withId = stations.filter((s) => s.statid);
    const missing = withId.filter((s) => !stationInfos[s.statid]);
    // A few historical line-16 points lack info; keep the gap bounded.
    expect(missing.length).toBeLessThan(20);
    expect(withId.length - missing.length).toBeGreaterThan(200);
  });

  it('every transfer has coordinates and a data-id', () => {
    expect(transfers.length).toBeGreaterThan(10);
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
  it('entries include timesheet rows with required fields', () => {
    const sampleIds = Object.keys(stationInfos).slice(0, 25);
    for (const id of sampleIds) {
      const info = stationInfos[id];
      expect(Array.isArray(info.timesheet)).toBe(true);
      expect(info.timesheet.length).toBeGreaterThan(0);
      for (const row of info.timesheet) {
        expect(row.line).toBeDefined();
        expect(row.first_time).toMatch(/^\d{1,2}:\d{2}$/);
        expect(row.last_time).toMatch(/^\d{1,2}:\d{2}$/);
        expect(row.description).toBeTruthy();
      }
    }
  });
});

describe('labels', () => {
  it('includes line name labels', () => {
    const lineLabels = labels.filter((l) => l.text.includes('号线'));
    expect(lineLabels.length).toBeGreaterThan(10);
  });
});
