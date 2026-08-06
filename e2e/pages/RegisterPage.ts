import { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly registerButton: Locator;
  readonly buyerRoleBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator('input[placeholder="Julian Thorne"]');
    this.emailInput = page.locator('input[type="email"]');
    this.phoneInput = page.locator('input[placeholder="+61 400 000 000"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.registerButton = page.locator('button[type="submit"]');
    this.buyerRoleBtn = page.getByRole('button', { name: 'Buyer / Renter' });
  }

  async goto() {
    await this.page.goto('/register');
  }

  async registerUser(name: string, email: string, phone: string, pass: string) {
    if (await this.buyerRoleBtn.isVisible()) {
      await this.buyerRoleBtn.click();
    }
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    await this.passwordInput.fill(pass);
    await this.registerButton.click();
  }
}
