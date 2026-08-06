import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.signInButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.getByRole('button', { name: /forgot password/i }).or(page.getByText(/forgot password/i));
    this.registerLink = page.getByRole('link', { name: /register here/i });
    this.errorMessage = page.locator('.bg-rose-500\\/10');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.signInButton.click();
  }

  async clickForgotPassword() {
    if (await this.forgotPasswordLink.isVisible()) {
      await this.forgotPasswordLink.click();
    }
  }
}
