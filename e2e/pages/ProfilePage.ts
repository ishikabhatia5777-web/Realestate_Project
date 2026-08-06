import { Page, Locator } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly offersTab: Locator;
  readonly messagesTab: Locator;
  readonly bookingsTab: Locator;
  readonly wishlistTab: Locator;
  readonly paymentsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.offersTab = page.getByRole('button', { name: /my submitted offers/i });
    this.messagesTab = page.getByRole('button', { name: /live agent chat/i });
    this.bookingsTab = page.getByRole('button', { name: /inspection bookings/i });
    this.wishlistTab = page.getByRole('button', { name: /saved wishlist/i });
    this.paymentsTab = page.getByRole('button', { name: /payment history/i });
  }

  async gotoDashboard() {
    await this.page.goto('/dashboard/buyer');
  }

  async switchTab(tabName: 'offers' | 'messages' | 'bookings' | 'wishlist' | 'payments') {
    if (tabName === 'offers' && await this.offersTab.isVisible()) await this.offersTab.click();
    else if (tabName === 'messages' && await this.messagesTab.isVisible()) await this.messagesTab.click();
    else if (tabName === 'bookings' && await this.bookingsTab.isVisible()) await this.bookingsTab.click();
    else if (tabName === 'wishlist' && await this.wishlistTab.isVisible()) await this.wishlistTab.click();
    else if (tabName === 'payments' && await this.paymentsTab.isVisible()) await this.paymentsTab.click();
  }
}
