import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartLine } from '../models/cartLine';
import { parseToCents } from '../utils/priceUtils';
import { exactTextRegex } from '../utils/stringUtils';

export class CartPage extends BasePage {
  private readonly rows: Locator;
  private readonly updateCartButton: Locator;
  private readonly couponInput: Locator;
  private readonly applyCouponButton: Locator;
  private readonly subTotalValue: Locator;
  readonly couponMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('table.cart tr.cart-item-row');
    this.updateCartButton = page.locator('input[name="updatecart"]');
    this.couponInput = page.locator('input.discount-coupon-code');
    this.applyCouponButton = page.locator('input[name="applydiscountcouponcode"]');
    this.subTotalValue = page
      .locator('table.cart-total tr')
      .filter({ hasText: 'Sub-Total' })
      .locator('td.cart-total-right');
    this.couponMessage = page.locator('div.coupon-box div.message, div.coupon-box div.message-failure');
  }

  async open(): Promise<void> {
    await this.goto('/cart');
  }

  async getLines(expectedCount?: number): Promise<CartLine[]> {
    if (expectedCount !== undefined) {
      const { expect } = await import('@playwright/test');
      await expect(this.rows).toHaveCount(expectedCount);
    } else {
      await this.rows.first().waitFor();
    }
    const count = await this.rows.count();
    const lines: CartLine[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.rows.nth(i);
      lines.push({
        name: (await row.locator('a.product-name, td.product a').innerText()).trim(),
        unitPriceCents: parseToCents(await row.locator('span.product-unit-price').innerText()),
        quantity: Number(await row.locator('input.qty-input').inputValue()),
        lineTotalCents: parseToCents(await row.locator('span.product-subtotal').innerText()),
      });
    }
    return lines;
  }

  async updateQuantity(productName: string, quantity: number): Promise<void> {
    const row = this.rows.filter({
      has: this.page.locator('a.product-name, td.product a').filter({ hasText: exactTextRegex(productName) }),
    });
    await row.locator('input.qty-input').fill(String(quantity));
    await this.updateCartButton.click();
    const { expect } = await import('@playwright/test');
    await expect(row.locator('input.qty-input')).toHaveValue(String(quantity));
  }

  async getSubTotalCents(): Promise<number> {
    return parseToCents(await this.subTotalValue.innerText());
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
  }
}
