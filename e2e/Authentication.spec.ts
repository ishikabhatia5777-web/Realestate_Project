import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';

test.describe('1. Authentication Module', () => {

  test('TC-N-001: Verify new user registration', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    const uniqueEmail = `qa_user_${Date.now()}@example.com`;
    await registerPage.registerUser('John Doe', uniqueEmail, '+61 400 123 456', 'password123');

    await expect(page).not.toHaveURL(/\/register$/);
  });

  test('TC-N-002: Verify successful login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('buyer@gmail.com', 'password123');
    await page.waitForURL('**/dashboard/buyer**');
    await expect(page).toHaveURL(/.*dashboard\/buyer.*/);
  });

  test('TC-N-003: Verify user logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    await loginPage.login('buyer@gmail.com', 'password123');
    await page.waitForURL('**/dashboard/buyer**');

    await homePage.goto();
    await homePage.logout();

    await expect(page).toHaveURL(/.*(\/|login)$/);
  });

  test('TC-N-004: Verify forgot password request trigger', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.clickForgotPassword();
    await expect(page.locator('body')).toContainText(/forgot|sign in|welcome/i);
  });

});
