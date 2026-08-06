import { Page, Locator } from '@playwright/test';

export class PropertyDetailPage {
  readonly page: Page;
  readonly propertyTitle: Locator;
  readonly propertyPrice: Locator;
  readonly galleryThumbnails: Locator;
  readonly mainImage: Locator;
  readonly bookInspectionBtn: Locator;
  readonly confirmBookingBtn: Locator;
  readonly dateInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.propertyTitle = page.locator('h1').first();
    this.propertyPrice = page.locator('.gold-gradient-text').first();
    this.galleryThumbnails = page.locator('button img[alt="Thumb"]');
    this.mainImage = page.locator('img[alt]').first();
    this.bookInspectionBtn = page.getByRole('button', { name: 'Book Inspection' });
    this.confirmBookingBtn = page.getByRole('button', { name: /confirm booking/i }).or(page.getByRole('button', { name: /schedule inspection/i }));
    this.dateInput = page.locator('input[type="date"]');
  }

  async clickSecondThumbnail() {
    if (await this.galleryThumbnails.nth(1).isVisible()) {
      await this.galleryThumbnails.nth(1).click();
    }
  }

  async bookInspection(date: string) {
    await this.bookInspectionBtn.click();
    if (await this.dateInput.isVisible()) {
      await this.dateInput.fill(date);
    }
    if (await this.confirmBookingBtn.isVisible()) {
      await this.confirmBookingBtn.click();
    }
  }
}
