import { Page, Locator } from '@playwright/test';

export class PropertiesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly saleFilterBtn: Locator;
  readonly suburbInput: Locator;
  readonly sortBySelect: Locator;
  readonly propertyCards: Locator;
  readonly viewDetailsLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[name="search"]');
    this.saleFilterBtn = page.getByRole('button', { name: 'Sale' });
    this.suburbInput = page.locator('input[name="suburb"]');
    this.sortBySelect = page.locator('select[name="sortBy"]');
    this.propertyCards = page.locator('.glass-panel').filter({ hasText: /\$/ });
    this.viewDetailsLinks = page.getByRole('link', { name: 'View Details' });
  }

  async goto() {
    await this.page.goto('/properties');
  }

  async searchKeyword(keyword: string) {
    await this.searchInput.fill(keyword);
  }

  async filterBySaleAndSuburb(suburb: string) {
    if (await this.saleFilterBtn.isVisible()) {
      await this.saleFilterBtn.click();
    }
    if (await this.suburbInput.isVisible()) {
      await this.suburbInput.fill(suburb);
    }
  }

  async selectFirstProperty() {
    if (await this.viewDetailsLinks.first().isVisible()) {
      await this.viewDetailsLinks.first().click();
    } else {
      await this.page.locator('a[href^="/properties/"]').first().click();
    }
  }
}
