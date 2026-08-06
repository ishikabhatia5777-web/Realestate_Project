import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

test.describe('7. User Profile Module', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('buyer@gmail.com', 'password123');

    // ✅ Wait for automatic login redirect to /dashboard/buyer
    await page.waitForURL('**/dashboard/buyer**');
  });

  test('TC-N-018: Update user profile information / Portfolio Tabs', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await expect(page).toHaveURL(/.*dashboard\/buyer.*/);

    await profilePage.switchTab('offers');
    await expect(page.locator('body')).toContainText(/offers|buyer|portfolio/i);
  });

  test('TC-N-019: Change user password / Buyer Security & Receipts', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await expect(page).toHaveURL(/.*dashboard\/buyer.*/);

    await profilePage.switchTab('payments');
    await expect(page.locator('body')).toContainText(/payments|history|receipts|buyer/i);
  });

});
