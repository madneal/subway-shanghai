import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import stationInfos from './data/stationInfo.json';

function findClickableStation() {
  return Object.entries(stationInfos).find(
    ([, info]) => info.name_cn && info.timesheet?.length
  );
}

describe('App', () => {
  it('renders the supplied reference map', () => {
    const { container } = render(<App />);
    const map = container.querySelector('object.reference-map');
    expect(map).toBeInTheDocument();
    expect(map).toHaveAttribute(
      'data',
      '/subway-shanghai/shanghai-metro-map.svg'
    );
    expect(map).toHaveAccessibleName('上海轨道交通线路图');
  });

  it('opens an info card when a station with timetable data is clicked', () => {
    const [, target] = findClickableStation();
    expect(target).toBeTruthy();

    const { container } = render(<App />);
    fireEvent.click(
      within(container.querySelector('.station-access-list')).getByRole(
        'button',
        { name: target.name_cn }
      )
    );

    const card = container.querySelector('.info-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({ display: 'block' });
    // Anchored near the click (map-relative px), not fixed legacy offsets
    expect(card.style.left).toMatch(/px$/);
    expect(card.style.top).toMatch(/px$/);
    expect(within(card).getByText(target.name_cn)).toBeInTheDocument();
    expect(screen.getByText('方向')).toBeInTheDocument();
    expect(screen.getByText('周日-周四')).toBeInTheDocument();
  });

  it('closes the info card via the close button', async () => {
    const user = userEvent.setup();
    const [, target] = findClickableStation();
    const { container } = render(<App />);

    fireEvent.click(
      within(container.querySelector('.station-access-list')).getByRole('button', {
        name: target.name_cn,
      })
    );
    const card = container.querySelector('.info-card');
    expect(card).toHaveStyle({ display: 'block' });

    await user.click(screen.getByTitle('关闭'));
    expect(card).toHaveStyle({ display: 'none' });
  });
});
