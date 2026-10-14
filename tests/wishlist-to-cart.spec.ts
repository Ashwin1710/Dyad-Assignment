import { testConfig } from '../config/testConfig';
import { expect, test } from '../fixtures/test';
import { CartLine } from '../models/cartLine';
import { generateUniqueEmail } from '../utils/dataGenerator';
import { formatCents, parseToCents } from '../utils/priceUtils';

test.describe('Scenario 5: Wishlist to Cart Validation', () => {
  test('shopper moves two wishlist books to cart and validates subtotal and coupon', async ({
    page,
    header,
    registerPage,
    searchResultsPage,
    productPage,
    wishlistPage,
    cartPage,
  }) => {
    const email = generateUniqueEmail();
    let selectedBooks: string[] = [];
    let cartLines: CartLine[] = [];
    let productToUpdate = '';

    await test.step('Register a new user with a unique email', async () => {
      await test.step('Navigate to registration page', async () => {
        await registerPage.open();
      });

      await test.step('Fill in Personal Details (Gender, First Name, Last Name, Email)', async () => {
        await registerPage.fillPersonalDetails({
          gender: testConfig.gender,
          firstName: testConfig.firstName,
          lastName: testConfig.lastName,
          email,
        });
      });

      await test.step('Fill in Password and Confirm Password', async () => {
        await registerPage.fillPassword(testConfig.password);
      });

      await test.step('Submit registration form', async () => {
        await registerPage.submit();
      });

      await test.step('Verify registration outcome and continue', async () => {
        const registrationMessage = page.getByText('Your registration completed', { exact: true });
        await expect(registrationMessage, 'registration success message').toBeVisible();
        await expect(registrationMessage, 'registration success message text').toHaveText(
          'Your registration completed',
        );
        await registerPage.clickContinue();
        await expect(header.accountLink, 'logged-in account email').toHaveText(email);
      });
    });

    selectedBooks = testConfig.booksToSelect;

    for (let i = 0; i < selectedBooks.length; i++) {
      const bookTitle = selectedBooks[i];
      const initialCount = i;
      const expectedCount = i + 1;

      await test.step(`Search and add "${bookTitle}" to wishlist (validating count ${initialCount} -> ${expectedCount})`, async () => {
        await test.step(`Search for "${bookTitle}"`, async () => {
          await header.search(bookTitle);
        });

        await test.step(`Find and click product "${bookTitle}"`, async () => {
          await searchResultsPage.openProduct(bookTitle);
          await expect(productPage.productName).toHaveText(bookTitle);
        });

        await test.step(`Check wishlist count is (${initialCount}) before clicking Add to wishlist`, async () => {
          await expect(header.wishlistQuantity, `wishlist count before adding "${bookTitle}"`).toHaveText(
            `(${initialCount})`,
          );
        });

        await test.step(`Click "Add to wishlist" button`, async () => {
          await productPage.addToWishlist();
        });

        await test.step(`Check wishlist count increased by 1 to (${expectedCount})`, async () => {
          await expect(header.wishlistQuantity, `wishlist count after adding "${bookTitle}"`).toHaveText(
            `(${expectedCount})`,
          );
        });
      });
    }

    await test.step('Verify only the added products are in the wishlist', async () => {
      await wishlistPage.open();
      const productLinks = page.locator('td.product > a');
      await expect(productLinks, 'wishlist products count').toHaveCount(selectedBooks.length);
      const wishlistNames = (await productLinks.allInnerTexts()).map((name) => name.trim());

      // Fail test if any product other than the added books is displayed
      for (const name of wishlistNames) {
        expect(
          selectedBooks,
          `Unexpected product "${name}" found in wishlist! Only added products should be present.`,
        ).toContain(name);
      }

      // Ensure every added book is present
      for (const book of selectedBooks) {
        expect(wishlistNames, `Expected product "${book}" was not found in the wishlist!`).toContain(book);
      }

      expect([...wishlistNames].sort(), 'wishlist product list matches added books exactly').toEqual(
        [...selectedBooks].sort(),
      );
    });

    await test.step('Move wishlist products to the cart', async () => {
      const addCheckboxes = page.locator('td.add-to-cart >input');
      await expect(addCheckboxes).toHaveCount(testConfig.booksToAdd);
      for (const cb of await addCheckboxes.all()) {
        await cb.scrollIntoViewIfNeeded();
        await cb.setChecked(true);
        await expect(cb).toBeChecked();
      }

      // Ensure remove checkboxes are not checked
      const removeCheckboxes = page.locator('input[name="removefromcart"]');
      for (const cb of await removeCheckboxes.all()) {
        await cb.setChecked(false);
        await expect(cb).not.toBeChecked();
      }

      await page.locator('[name="addtocartbutton"]').click();
      await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
    });

    await test.step('Update quantity in shopping cart to 2', async () => {
      const qtyInputs = page.locator('td.qty.nobr > input');
      const count = await qtyInputs.count();
      expect(count, 'one or more quantity inputs present').toBeGreaterThanOrEqual(1);
      for (let i = 0; i < count; i++) {
        await qtyInputs.nth(i).fill('');
        await qtyInputs.nth(i).fill('2');
      }
      await page.locator('[name="updatecart"]').click();

      // Ensure updated quantities are 2
      for (let i = 0; i < count; i++) {
        await expect(qtyInputs.nth(i)).toHaveValue('2');
      }
    });

    await test.step('Verify the cart subtotal matches line items sum', async () => {
      const subtotalElements = page.locator('td.subtotal.nobr.end > span.product-subtotal');
      const count = await subtotalElements.count();
      expect(count, 'one or more subtotal prices present').toBeGreaterThanOrEqual(1);
      const subtotalTexts = await subtotalElements.allInnerTexts();

      const calculatedTotalCents = subtotalTexts.reduce((sum, text) => {
        return sum + parseToCents(text);
      }, 0);

      const subTotalValue = page.locator(
        'table.cart-total tr:has(td.cart-total-left:has-text("Sub-Total")) span.product-price',
      );
      await expect(subTotalValue).toBeVisible();
      const actualSubTotalCents = parseToCents(await subTotalValue.innerText());

      expect(formatCents(actualSubTotalCents), 'calculated subtotal matches cart subtotal').toBe(
        formatCents(calculatedTotalCents),
      );
    });

    await test.step('Apply random invalid coupon and verify validation message', async () => {
      const randomCoupon = `INVALID-${Date.now()}`;
      await page.locator('input.discount-coupon-code:visible').fill(randomCoupon);
      await page.locator('input.button-2.apply-discount-coupon-code-button:visible').click();
      await expect(page.locator('div.message:visible'), 'coupon validation message').toBeVisible();
    });

    await test.step('Logout', async () => {
      await header.logout();
      await expect(header.loginLink, 'login link after logout').toBeVisible();
      await expect(header.logoutLink, 'logout link after logout').toHaveCount(0);
    });
  });
});
