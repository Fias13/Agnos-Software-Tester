import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { env, strongPassword, uniqueTestEmail } from '../utils/testData';

/**
 * Automated coverage for REG-001..REG-007 (see Manual_Test_Cases sheet).
 *
 * As with login.spec.ts, assertions encode the CORRECT expected behavior.
 * REG-001 is expected to FAIL against the current dev environment because
 * of BUG-002 (create_user API returns HTTP 500 for valid, novel accounts).
 */
test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto(env.baseUrl);
  });

  test('REG-001: A new account can be created with a unique email and a policy-compliant password', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const email = uniqueTestEmail();
    await signupPage.register(email, strongPassword, strongPassword);

    // EXPECTED (correct) behavior: account is created and the user is
    // taken off the sign-up page (e.g. to login or the dashboard).
    // KNOWN ISSUE: as of 2026-09-10 this fails — see BUG-002. The backend
    // /api/ai_dashboard/create_user endpoint returns HTTP 500 for every
    // syntactically valid payload tested, and the UI shows no error.
    // AUTOMATION FAILURE HERE = APPLICATION DEFECT, not a selector/test bug.
    await expect(page).not.toHaveURL(/\/sign_up/, { timeout: 10_000 });
  });

  test('REG-002: Confirm button is disabled when all fields are empty', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.expectConfirmButtonDisabled();
  });

  test('REG-003: An invalid email format is rejected before the account-creation API is called', async ({ page }) => {
    const signupPage = new SignupPage(page);
    let apiCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('create_user')) apiCalled = true;
    });

    await signupPage.register('not-an-email', strongPassword, strongPassword);

    await expect(signupPage.invalidEmailMessage).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test('REG-004: A password that does not meet the complexity policy is rejected before submission', async ({ page }) => {
    const signupPage = new SignupPage(page);
    let apiCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('create_user')) apiCalled = true;
    });

    await signupPage.register(uniqueTestEmail(), 'abc', 'abc');

    await expect(signupPage.weakPasswordMessage).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test('REG-005: Mismatched Password and Confirm Password fields show a validation message', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.register(uniqueTestEmail(), strongPassword, 'Different@99');
    await expect(signupPage.passwordMismatchMessage).toBeVisible();
  });

  test('REG-006: Password input masks characters by default', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.passwordInput.fill(strongPassword);
    await expect(signupPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
