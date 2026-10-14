# Dyad QA Automation - Scenario 5: Wishlist to Cart Validation

Playwright + TypeScript framework (Page Object Model, Allure reporting) for https://demowebshop.tricentis.com/.
Flow: register, search "Book", add 2 books to wishlist, move to cart, update a quantity to 2, verify subtotal,
apply an invalid coupon, log out.

## Project structure
```
config/     testConfig.ts       base URL, keyword, quantities, coupon data (env overridable)
models/     cartLine.ts
pages/      BasePage + Header, Register, SearchResults, Product, Wishlist, Cart page objects
fixtures/   test.ts             injects page objects into tests
utils/      priceUtils, dataGenerator, stringUtils
tests/      wishlist-to-cart.spec.ts
playwright.config.ts
```

## Prerequisites
- Node.js 18+
- Java 8+ (needed by the Allure command line)

## Setup
```
npm install
npx playwright install chromium
```

## Run
```
npm test                 # runs tests, cleans old results, converts to Allure report & opens it automatically
npm run test:headed      # visible browser (or HEADED=true)
npm run report           # converts allure-results to allure-report and opens interactive server
npm run allure:generate  # converts allure-results to allure-report (generate only)
npm run allure:open      # opens existing allure-report in browser
npm run clean:allure     # purges both allure-results and allure-report while keeping directories
```
`allure-results` holds raw test data and attachments; `allure-report` holds the generated HTML report.
Old results are cleaned before each run. On test completion, `globalTeardown` automatically generates the HTML report and launches it in your browser. (In CI or when `AUTO_OPEN_ALLURE=false`, browser launch is skipped).

## Design notes and assumptions
- Playwright auto-waiting and web-first assertions only; no hard sleeps.
- Unique email per run (timestamp + random suffix).
- Books are chosen dynamically from the first search results; if the plain search returns fewer than 2 products
  the test retries with "search in descriptions".
- Expected subtotal = sum(unit price x quantity) read from cart rows, computed in integer cents to avoid
  floating point errors; line totals are asserted too.
- Expected coupon error is a substring in `testConfig.ts` (`expectedCouponError`).
- Each phase is a `test.step`, which appears as a step in the Allure report.
