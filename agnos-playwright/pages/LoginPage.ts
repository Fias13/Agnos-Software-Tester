import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object for the AI Dashboard login page.
 * Selectors verified against the live dev environment on 2026-09-10.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly passwordVisibilityToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByText('Wrong email or password. Please try again');
    this.passwordVisibilityToggle = this.passwordInput.locator('..').locator('svg, button').last();
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/login`);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async expectSignInButtonDisabled() {
    await expect(this.signInButton).toBeDisabled();
  }

  async expectSignInButtonEnabled() {
    await expect(this.signInButton).toBeEnabled();
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/ai_dashboard\/login/);
  }
}
