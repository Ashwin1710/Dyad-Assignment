import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly productName: Locator;
  private readonly addToWishlistButton: Locator;
  private readonly successNotification: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('div.product-name h1');
    this.addToWishlistButton = page.locator('input.add-to-wishlist-button, input[value="Add to wishlist"]');
    this.successNotification = page.locator('#bar-notification');
  }

  async addToWishlist(): Promise<void> {
    await this.addToWishlistButton.click();
  }
}
