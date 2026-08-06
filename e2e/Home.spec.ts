import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('2. Home Page Module', () => {

  test('TC-N-005: Verify home page loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(page).toHaveURL(/\/$/);
    await expect(homePage.brandLogo).toBeVisible();
  });

  test('TC-N-006: Verify navigation menu links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 1. Click Explore All
    if (await homePage.exploreAllLink.isVisible()) {
      await homePage.exploreAllLink.click();
      await expect(page).toHaveURL(/.*properties.*/);
    }

    // 2. Click Brand Logo back to home
    await homePage.brandLogo.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('TC-N-007: Verify home hero banner is visible', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.heroBanner).toBeVisible();
  });

});
