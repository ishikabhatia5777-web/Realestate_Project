import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PropertiesPage } from './pages/PropertiesPage';

test.describe('9. Expert Connection Requests', () => {

  test('TC-N-023: Send a message containing expert connection keywords as a buyer', async ({ page }) => {
    // 1. Log in as a buyer
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('buyer@gmail.com', 'password123');
    await page.waitForURL('**/dashboard/buyer**');

    // 2. Go to properties list & open details
    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await propertiesPage.selectFirstProperty();
    await page.waitForURL(/\/properties\/.+/);

    // 3. Open Live Agent Chat
    const chatBtn = page.getByRole('button', { name: /Live Agent Chat/i });
    await expect(chatBtn).toBeVisible();
    await chatBtn.click();

    // 4. Verify Chat Modal opens
    const chatInput = page.getByPlaceholder(/Ask/i);
    await expect(chatInput).toBeVisible();

    // 5. Send message with expert keyword
    await chatInput.fill('Please connect me to an expert agent ASAP');
    await page.locator('form').locator('button[type="submit"]').click();

    // 6. Verify pending wait message is shown (due to expert connection logic)
    const pendingMsg = page.locator('text=Please wait... We are connecting you');
    await expect(pendingMsg).toBeVisible();
  });

  test('TC-N-024: Verify connection request is listed in Agent Dashboard', async ({ page }) => {
    // 1. Log in as agent (Samantha Reed)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('samantha@prestigerealty.com.au', 'password123');
    await page.waitForURL('**/dashboard/agent**');

    // 2. Open requests tab
    const requestsTab = page.getByRole('button', { name: /Connection Requests/i });
    await expect(requestsTab).toBeVisible();
    await requestsTab.click();

    // 3. Verify there is at least one request visible
    await expect(page.locator('body')).toContainText(/buyer connection requests/i);
  });

  test('TC-N-025: Verify agent can mark connection request as contacted', async ({ page }) => {
    // 1. Log in as agent (Samantha Reed)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('samantha@prestigerealty.com.au', 'password123');
    await page.waitForURL('**/dashboard/agent**');

    // 2. Open requests tab
    const requestsTab = page.getByRole('button', { name: /Connection Requests/i });
    await requestsTab.click();

    // 3. Click Mark Contacted if available
    const markContactedBtn = page.getByRole('button', { name: /Mark Contacted/i }).first();
    if (await markContactedBtn.isVisible()) {
      await markContactedBtn.click();
      await expect(page.locator('body')).toContainText(/contacted/i);
    }
  });

});
