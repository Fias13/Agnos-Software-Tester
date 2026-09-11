import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object for the AI Dashboard registration ("Create Account") page.
 * Selectors verified against the live dev environment on 2026-09-10.
 *
 * NOTE: The form does not expose stable id/name/data-testid attributes
 * for each field individually (Email uses id="Email", but both Password
 * and Confirm Password share id="password"). Fields are therefore
 * addressed positionally within the form, which is the most reliable
 * approach available without application changes.
 */
export class SignupPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly confirmButton: Locator;
  readonly invalidEmailMessage: Locator;
  readonly weakPasswordMessage: Locator;
  readonly passwordMismatchMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    const inputs = page.locator('input');
    this.emailInput = inputs.nth(0);
    this.passwordInput = inputs.nth(1);
    this.confirmPasswordInput = inputs.nth(2);
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.invalidEmailMessage = page.getByText("The email should be in the format");
    this.weakPasswordMessage = page.getByText('The password must be at least 8 characters long');
    this.passwordMismatchMessage = page.getByText('Confirm password does not match the password');
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/agnos/sign_up`);
  }

  async fillForm(email: string, password: string, confirmPassword: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async submit() {
    await this.confirmButton.click();
  }

  async register(email: string, password: string, confirmPassword: string) {
    await this.fillForm(email, password, confirmPassword);
    await this.submit();
  }

  async expectConfirmButtonDisabled() {
    await expect(this.confirmButton).toBeDisabled();
  }
}
