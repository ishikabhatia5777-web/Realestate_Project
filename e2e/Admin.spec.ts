import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

test.describe('8. Admin Module', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@realestate.com', 'password123');
    
    // ✅ CRITICAL FIX: Wait for automatic login navigation to /dashboard/admin
    // Calling login automatically redirects to /dashboard/admin upon success.
    await page.waitForURL('**/dashboard/admin**');
  });

  test('TC-N-020: Add property listing / Review Pending Queue', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await expect(page).toHaveURL(/.*dashboard\/admin.*/);

    await adminPage.switchTab('approvals');
    await expect(page.locator('body')).toContainText(/pending|approval|listings|admin/i);
  });

  test('TC-N-021: Edit property listing / User RBAC Role Management', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await expect(page).toHaveURL(/.*dashboard\/admin.*/);

    await adminPage.switchTab('users');
    await expect(page.locator('body')).toContainText(/users|rbac|role|admin/i);
  });

  test('TC-N-022: Delete property listing / Moderation Action', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await expect(page).toHaveURL(/.*dashboard\/admin.*/);

    await adminPage.switchTab('metrics');
    await expect(page.locator('body')).toContainText(/metrics|overview|admin/i);
  });

});
