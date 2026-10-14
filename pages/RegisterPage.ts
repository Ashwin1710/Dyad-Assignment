import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  private readonly genderMale: Locator;
  private readonly genderFemale: Locator;
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly confirmPassword: Locator;
  private readonly registerButton: Locator;
  readonly resultMessage: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.genderMale = page.locator('#gender-male');
    this.genderFemale = page.locator('#gender-female');
    this.firstName = page.locator('#FirstName');
    this.lastName = page.locator('#LastName');
    this.email = page.locator('#Email');
    this.password = page.locator('#Password');
    this.confirmPassword = page.locator('#ConfirmPassword');
    this.registerButton = page.locator('#register-button');
    this.resultMessage = page.locator('div.result');
    this.continueButton = page.locator('input.register-continue-button');
  }

  async open(): Promise<void> {
    await this.goto('/register');
  }

  async selectGender(gender: 'M' | 'F' = 'M'): Promise<void> {
    if (gender === 'F') {
      await this.genderFemale.check();
    } else {
      await this.genderMale.check();
    }
  }

  /** Fills the "Your Personal Details" fieldset */
  async fillPersonalDetails(details: {
    gender?: 'M' | 'F';
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<void> {
    await this.selectGender(details.gender ?? 'M');
    await this.firstName.fill(details.firstName);
    await this.lastName.fill(details.lastName);
    await this.email.fill(details.email);
  }

  /** Fills the "Your Password" fieldset */
  async fillPassword(password: string, confirmPassword?: string): Promise<void> {
    await this.password.fill(password);
    await this.confirmPassword.fill(confirmPassword ?? password);
  }

  /** Submits the registration form */
  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  /** Convenience method to fill the complete form and submit */
  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    gender: 'M' | 'F' = 'M',
  ): Promise<void> {
    await this.fillPersonalDetails({ gender, firstName, lastName, email });
    await this.fillPassword(password);
    await this.submit();
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }
}
