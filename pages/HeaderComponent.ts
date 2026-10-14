import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Header shown on every page: search box, account and login/logout links. */
export class HeaderComponent extends BasePage {
  private readonly searchBox: Locator;
  private readonly searchButton: Locator;
  readonly accountLink: Locator;
  readonly logoutLink: Locator;
  readonly loginLink: Locator;
  readonly wishlistLink: Locator;
  readonly wishlistQuantity: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.locator('#small-searchterms');
    this.searchButton = page.locator('input.search-box-button');
    this.accountLink = page.locator('div.header-links a.account');
    this.logoutLink = page.locator('div.header-links a.ico-logout');
    this.loginLink = page.locator('div.header-links a.ico-login');
    this.wishlistLink = page.locator('div.header-links a.ico-wishlist');
    this.wishlistQuantity = page.locator('div.header-links a.ico-wishlist span.wishlist-qty');
  }

  async search(keyword: string): Promise<void> {
    await this.searchBox.fill(keyword);
    await this.searchButton.click();
  }

  async getWishlistCount(): Promise<number> {
    const text = (await this.wishlistQuantity.innerText()).trim();
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
