import { Page, Locator } from '@playwright/test';

export class WishlistPage {
  readonly page: Page;
  readonly heartIconsOnCards: Locator;
  readonly wishlistHeader: Locator;
  readonly emptyWishlistMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heartIconsOnCards = page.locator('button').filter({ has: page.locator('svg.lucide-heart') });
    this.wishlistHeader = page.getByRole('heading', { name: /my saved wishlist/i });
    this.emptyWishlistMessage = page.getByText(/your saved wishlist is empty/i);
  }

  async goto() {
    await this.page.goto('/wishlist');
  }

  async toggleWishlistFirstItem() {
    await this.heartIconsOnCards.first().click();
  }
}
