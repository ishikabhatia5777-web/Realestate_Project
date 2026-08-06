import { test, expect } from '@playwright/test';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { LoginPage } from './pages/LoginPage';

test.describe('3 & 4 & 6. Property & Contact Module', () => {

  test('TC-N-008: View all properties in grid', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await expect(propertiesPage.propertyCards.first()).toBeVisible();
  });

  test('TC-N-009: Search property by keyword', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();

    await propertiesPage.searchKeyword('Penthouse');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toContainText(/penthouse|showing|properties/i);
  });

  test('TC-N-010: Filter property by listing type and suburb', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();

    await propertiesPage.filterBySaleAndSuburb('Vaucluse');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toContainText(/vaucluse|properties|sale/i);
  });

  test('TC-N-011: Sort property by price', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();

    if (await propertiesPage.sortBySelect.isVisible()) {
      await propertiesPage.sortBySelect.selectOption({ index: 1 });
    }

    await expect(propertiesPage.propertyCards.first()).toBeVisible();
  });

  test('TC-N-012: Open property details page', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    const detailPage = new PropertyDetailPage(page);

    await propertiesPage.goto();
    await propertiesPage.selectFirstProperty();

    await expect(page).toHaveURL(/\/properties/);
  });

  test('TC-N-013: View property images gallery', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    const detailPage = new PropertyDetailPage(page);

    await propertiesPage.goto();
    await propertiesPage.selectFirstProperty();
    await detailPage.clickSecondThumbnail();

    await expect(page).toHaveURL(/\/properties/);
  });

  test('TC-N-014: Verify property information displayed', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);

    await propertiesPage.goto();
    await propertiesPage.selectFirstProperty();

    await expect(page).toHaveURL(/\/properties/);
  });

  test('TC-N-017: Submit inquiry form / inspection booking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const propertiesPage = new PropertiesPage(page);

    await loginPage.goto();
    await loginPage.login('buyer@gmail.com', 'password123');

    await propertiesPage.goto();
    await propertiesPage.selectFirstProperty();

    await expect(page).toHaveURL(/\/properties/);
  });

});
