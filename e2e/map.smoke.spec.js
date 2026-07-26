import { expect, test } from '@playwright/test';
import stations from '../src/data/stations.json' with { type: 'json' };
import stationInfos from '../src/data/stationInfo.json' with { type: 'json' };

function pickStation() {
  return stations.find(
    (s) => s.id && s.statid && stationInfos[s.statid]?.timesheet?.length
  );
}

test.describe('Shanghai subway map', () => {
  test('loads the map shell', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/上海地铁/);
    await expect(page.locator('svg.svg')).toBeVisible();
    await expect(page.locator('svg.svg path').first()).toBeVisible();
    await expect
      .poll(async () => page.locator('svg.svg circle').count())
      .toBeGreaterThan(100);
  });

  test('clicking a station opens timetable info', async ({ page }) => {
    const target = pickStation();
    expect(target, 'need at least one station with timetable data').toBeTruthy();

    await page.goto('./');
    const circle = page.locator(`svg.svg circle[id="${target.id}"]`);
    await circle.scrollIntoViewIfNeeded();
    await circle.click({ force: true });

    const card = page.locator('.info-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText(target.id);
    await expect(card.getByRole('columnheader', { name: '方向' })).toBeVisible();
    await expect(card.getByText(/号线/).first()).toBeVisible();
  });

  test('close button hides the info card', async ({ page }) => {
    const target = pickStation();
    await page.goto('./');
    await page
      .locator(`svg.svg circle[id="${target.id}"]`)
      .click({ force: true });

    const card = page.locator('.info-card');
    await expect(card).toBeVisible();
    await page.getByTitle('关闭').click();
    await expect(card).toBeHidden();
  });
});
