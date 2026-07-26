import { describe, expect, it } from 'vitest';
import {
  addTime,
  formatNum,
  formatTimesheet,
  getFirstPair,
  timeExtend,
} from './timesheet';

describe('formatNum', () => {
  it('pads single digits', () => {
    expect(formatNum(5)).toBe('05');
  });

  it('leaves double digits unchanged', () => {
    expect(formatNum(12)).toBe('12');
  });
});

describe('addTime', () => {
  it('adds minutes within the same hour', () => {
    expect(addTime('10:15', 20)).toBe('10:35');
  });

  it('rolls minutes into the next hour', () => {
    expect(addTime('10:50', 20)).toBe('11:10');
  });

  it('marks next-day times after midnight', () => {
    expect(addTime('23:50', 30)).toBe('次日00:20');
  });

  it('handles multi-hour weekend extensions', () => {
    // 78 minutes past 22:32 → 23:50
    expect(addTime('22:32', 78)).toBe('23:50');
  });
});

describe('timeExtend', () => {
  it('returns lastTime when weekday adjustment is zero', () => {
    expect(timeExtend([0, 0, 0, 0, 0, 0, 0], '22:30')).toBe('22:30');
  });

  it('extends lastTime using the last weekday entry', () => {
    expect(timeExtend([0, 0, 0, 0, 0, 78, 78], '22:32')).toBe('23:50');
  });

  it('returns lastTime when weekday is missing', () => {
    expect(timeExtend(null, '22:00')).toBe('22:00');
  });
});

describe('formatTimesheet', () => {
  it('groups rows by line and parses last_time_desc', () => {
    const raw = [
      {
        line: 1,
        first_time: '05:30',
        last_time: '22:32',
        last_time_desc: '{"weekday":[0,0,0,0,0,78,78]}',
        description: '往富锦路方向',
      },
      {
        line: 1,
        first_time: '05:30',
        last_time: '22:02',
        last_time_desc: '',
        description: '往莘庄方向',
      },
      {
        line: 5,
        first_time: '06:00',
        last_time: '22:00',
        last_time_desc: 'not-json',
        description: '往闵行开发区方向',
      },
    ];

    const result = formatTimesheet(raw);
    expect(Object.keys(result)).toEqual(['1', '5']);
    expect(result[1]).toHaveLength(2);
    expect(result[1][0]).toMatchObject({
      firstTime: '05:30',
      lastTime: '22:32',
      weekday: [0, 0, 0, 0, 0, 78, 78],
      description: '往富锦路方向',
    });
    expect(result[5][0].weekday).toBeNull();
  });
});

describe('getFirstPair', () => {
  it('returns the first value in insertion order', () => {
    expect(getFirstPair({ a: 1, b: 2 })).toBe(1);
  });

  it('returns null for empty or missing objects', () => {
    expect(getFirstPair({})).toBeNull();
    expect(getFirstPair(null)).toBeNull();
  });
});
