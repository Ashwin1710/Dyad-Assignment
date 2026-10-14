import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { exactTextRegex } from '../utils/stringUtils';

export class SearchResultsPage extends BasePage {
  private readonly resultsContainer: Locator;
  private readonly productTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsContainer = page.locator('div.search-results');
    this.productTitles = page.locator('div.product-item h2.product-title a');
  }

  async getProductTitles(): Promise<string[]> {
    await this.resultsContainer.waitFor();
    const titles = await this.productTitles.allInnerTexts();
    return titles.map((title) => title.trim());
  }

  /** Fallback used when the plain search returns fewer products than needed. */
  async searchIncludingDescriptions(keyword: string): Promise<void> {
    await this.goto(`/search?q=${encodeURIComponent(keyword)}&As=true&Sid=true`);
  }

  async openProduct(title: string): Promise<void> {
    await this.page.locator('h2.product-title a', { hasText: exactTextRegex(title) }).first().click();
  }
}
