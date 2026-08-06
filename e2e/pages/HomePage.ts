import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly brandLogo: Locator;
  readonly exploreAllLink: Locator;
  readonly agenciesLink: Locator;
  readonly insightsLink: Locator;
  readonly heroBanner: Locator;
  readonly userDropdownBtn: Locator;
  readonly signOutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandLogo = page.locator('header a[href="/"]').first();
    this.exploreAllLink = page.locator('header nav').getByRole('link', { name: /explore/i }).first();
    this.agenciesLink = page.locator('header nav').getByRole('link', { name: /agencies/i }).first();
    this.insightsLink = page.locator('header nav').getByRole('link', { name: /insights|blogs/i }).first();
    this.heroBanner = page.locator('h1, section').first();
    this.userDropdownBtn = page.locator('header button').last();
    this.signOutBtn = page.getByRole('button', { name: /sign out/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async logout() {
    if (await this.userDropdownBtn.isVisible()) {
      await this.userDropdownBtn.click();
      if (await this.signOutBtn.isVisible()) {
        await this.signOutBtn.click();
      }
    }
  }
}
