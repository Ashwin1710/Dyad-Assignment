export const testConfig = {
  baseUrl: process.env.BASE_URL ?? 'https://demowebshop.tricentis.com',
  headless: process.env.HEADED !== 'true',
  searchKeyword: process.env.SEARCH_KEYWORD ?? 'Book',
  booksToSelect: ['Health Book', 'Fiction EX'],
  booksToAdd: 2,
  updatedQuantity: 2,
  gender: (process.env.TEST_GENDER as 'M' | 'F') ?? 'M',
  firstName: process.env.TEST_FIRST_NAME ?? 'Test',
  lastName: process.env.TEST_LAST_NAME ?? 'User',
  password: process.env.TEST_PASSWORD ?? 'Test@12345',
  invalidCoupon: 'INVALID-COUPON-123',
  expectedCouponError: 'coupon code you entered',
};
