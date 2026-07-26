import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimesheetTable from './TimesheetTable';

describe('TimesheetTable', () => {
  it('renders directions and highlights weekend-extended last trains', () => {
    render(
      <TimesheetTable
        timesheetOfEachLine={[
          {
            description: '往富锦路方向',
            firstTime: '05:30',
            lastTime: '22:32',
            weekday: [0, 0, 0, 0, 0, 78, 78],
          },
          {
            description: '往莘庄方向',
            firstTime: '05:30',
            lastTime: '22:02',
            weekday: [0, 0, 0, 0, 0, 0, 0],
          },
        ]}
      />
    );

    expect(screen.getByText('往富锦路方向')).toBeInTheDocument();
    expect(screen.getByText('往莘庄方向')).toBeInTheDocument();
    // 22:32 + 78 minutes → 23:50, shown in red for Fri/Sat
    expect(screen.getByText('23:50')).toBeInTheDocument();
    expect(screen.getByText('23:50')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('renders an empty table body when data is missing', () => {
    const { container } = render(<TimesheetTable timesheetOfEachLine={null} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
  });
});
