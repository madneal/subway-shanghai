import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import stations from './data/stations.json';
import stationInfos from './data/stationInfo.json';

function findClickableStation() {
  return stations.find(
    (s) => s.id && s.statid && stationInfos[s.statid]?.timesheet?.length
  );
}

describe('App', () => {
  it('renders the subway map svg', () => {
    const { container } = render(<App />);
    const svg = container.querySelector('svg.svg');
    expect(svg).toBeInTheDocument();
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(10);
    expect(svg.querySelectorAll('circle').length).toBeGreaterThan(100);
  });

  it('opens an info card when a station with timetable data is clicked', async () => {
    const user = userEvent.setup();
    const target = findClickableStation();
    expect(target).toBeTruthy();

    const { container } = render(<App />);
    const circle = container.querySelector(`circle[id="${target.id}"]`);
    expect(circle).toBeTruthy();

    await user.click(circle);

    const card = container.querySelector('.info-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({ display: 'block' });
    expect(within(card).getByText(target.id)).toBeInTheDocument();
    expect(screen.getByText('方向')).toBeInTheDocument();
    expect(screen.getByText('周日-周四')).toBeInTheDocument();
  });

  it('closes the info card via the close button', async () => {
    const user = userEvent.setup();
    const target = findClickableStation();
    const { container } = render(<App />);

    await user.click(container.querySelector(`circle[id="${target.id}"]`));
    const card = container.querySelector('.info-card');
    expect(card).toHaveStyle({ display: 'block' });

    await user.click(screen.getByTitle('关闭'));
    expect(card).toHaveStyle({ display: 'none' });
  });
});
