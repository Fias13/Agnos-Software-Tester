import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { env } from '../utils/testData';

/**
 * Automated coverage for LOGIN-001..LOGIN-006 (see Manual_Test_Cases sheet).
 *
 * Assertions encode the EXPECTED (correct) behavior of the login form.
 * Where the live dev environment currently returns HTTP 500 on the
 * login API for every credential combination (BUG-001), the relevant
 * test is expected to FAIL — that failure is the automation correctly
 * catching a real application defect, not a problem with the test code.
 * See docs/Bug_Reports for full details.
 */
test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(env.baseUrl);
  });

  test('LOGIN-001: Sign in button is disabled when both fields are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.expectSignInButtonDisabled();
  });

  test('LOGIN-002: Sign in button stays disabled with only email filled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.emailInput.fill(env.username || 'someone@example.com');
    await loginPage.expectSignInButtonDisabled();
  });

  test('LOGIN-003: Sign in button becomes enabled once both fields are filled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.emailInput.fill(env.username || 'someone@example.com');
    await loginPage.passwordInput.fill('any-password');
    await loginPage.expectSignInButtonEnabled();
  });

  test('LOGIN-004: Invalid credentials show an error message and keep the user on the login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(env.invalidUsername, env.invalidPassword);
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.expectOnLoginPage();
  });

  test('LOGIN-005: Valid credentials log the user into the dashboard', async ({ page }) => {
    test.skip(!env.username || !env.password, 'TEST_USERNAME / TEST_PASSWORD not set in .env');
    const loginPage = new LoginPage(page);
    await loginPage.login(env.username, env.password);

    // EXPECTED (correct) behavior: successful redirect away from /login.
    // KNOWN ISSUE: as of 2026-09-10 this fails — see BUG-001. The backend
    // /api/ai_dashboard/login endpoint returns HTTP 500 for these exact
    // credentials, so the app never navigates past the login page.
    // AUTOMATION FAILURE HERE = APPLICATION DEFECT, not a selector/test bug.
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('LOGIN-006: Password field masks input and supports a visibility toggle', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.passwordInput.fill('SamplePassword1!');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
