import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WishlistPage extends BasePage {
  private readonly productNames: Locator;
  private readonly addToCartCheckboxes: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productNames = page.locator('table.cart td.product a, table.cart a.product-name');
    this.addToCartCheckboxes = page.locator('table.cart input[name="addtocart"]');
    this.addToCartButton = page.locator('input[name="addtocartbutton"]');
  }

  async open(): Promise<void> {
    await this.goto('/wishlist');
  }

  async getProductNames(): Promise<string[]> {
    await this.productNames.first().waitFor();
    const names = await this.productNames.allInnerTexts();
    return names.map((name) => name.trim());
  }

  async moveAllToCart(expectedCount: number = 2): Promise<void> {
    await this.addToCartCheckboxes.first().waitFor();
    if (expectedCount > 0) {
      const { expect } = await import('@playwright/test');
      await expect(this.addToCartCheckboxes).toHaveCount(expectedCount);
    }
    const count = await this.addToCartCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await this.addToCartCheckboxes.nth(i).check();
    }
    await this.addToCartButton.click();
    await this.page.waitForURL(/\/cart/);
  }
}
