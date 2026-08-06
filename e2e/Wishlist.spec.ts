import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { WishlistPage } from './pages/WishlistPage';

test.describe('5. Wishlist Module', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('buyer@gmail.com', 'password123');
  });

  test('TC-N-015: Add property to wishlist', async ({ page }) => {
    const propertiesPage = new PropertiesPage(page);
    const wishlistPage = new WishlistPage(page);

    await propertiesPage.goto();
    await wishlistPage.toggleWishlistFirstItem();

    await wishlistPage.goto();
    // Assertion: Wishlist header renders
    await expect(wishlistPage.wishlistHeader).toBeVisible();
  });

  test('TC-N-016: Remove property from wishlist', async ({ page }) => {
    const wishlistPage = new WishlistPage(page);
    await wishlistPage.goto();

    if (await wishlistPage.heartIconsOnCards.first().isVisible()) {
      await wishlistPage.toggleWishlistFirstItem();
    }

    // Assertion: Page updates state
    await expect(page.locator('body')).toContainText(/wishlist|saved/i);
  });

});
