import { Page, Locator } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly overviewMetricsTab: Locator;
  readonly usersRbacTab: Locator;
  readonly pendingListingsTab: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly roleSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.overviewMetricsTab = page.getByRole('button', { name: /overview metrics/i });
    this.usersRbacTab = page.getByRole('button', { name: /users & rbac/i });
    this.pendingListingsTab = page.getByRole('button', { name: /pending listings/i });
    this.approveButton = page.getByRole('button', { name: /approve & publish/i }).first();
    this.rejectButton = page.getByRole('button', { name: /reject/i }).first();
    this.roleSelect = page.locator('select').first();
  }

  async goto() {
    await this.page.goto('/dashboard/admin');
  }

  async switchTab(tabName: 'metrics' | 'users' | 'approvals') {
    if (tabName === 'metrics' && await this.overviewMetricsTab.isVisible()) {
      await this.overviewMetricsTab.click();
    } else if (tabName === 'users' && await this.usersRbacTab.isVisible()) {
      await this.usersRbacTab.click();
    } else if (tabName === 'approvals' && await this.pendingListingsTab.isVisible()) {
      await this.pendingListingsTab.click();
    }
  }
}
