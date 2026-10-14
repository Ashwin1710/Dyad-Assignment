import { test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { HeaderComponent } from '../pages/HeaderComponent';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { WishlistPage } from '../pages/WishlistPage';

interface PageObjects {
  header: HeaderComponent;
  registerPage: RegisterPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  wishlistPage: WishlistPage;
  cartPage: CartPage;
}

export const test = base.extend<PageObjects>({
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  searchResultsPage: async ({ page }, use) => use(new SearchResultsPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  wishlistPage: async ({ page }, use) => use(new WishlistPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
});

export { expect } from '@playwright/test';
