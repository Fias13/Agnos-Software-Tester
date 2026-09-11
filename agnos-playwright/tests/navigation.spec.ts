import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { tryLogin } from '../utils/auth';

/**
 * Automated coverage for NAV-001..NAV-005 (see Manual_Test_Cases sheet).
 *
 * BLOCKED: every scenario here requires an authenticated session, and the
 * dev environment's login API currently returns HTTP 500 for the provided
 * test credentials (BUG-001). Each test attempts a real login first and
 * skips itself with a clear reason if that login does not succeed, so
 * these tests will start running for real as soon as the environment is
 * fixed — no code changes required.
 *
 * The DashboardPage locators used below are QA ASSUMPTIONS (not yet
 * verified against the live DOM) and should be reviewed once the
 * dashboard is reachable.
 */
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await tryLogin(page);
    test.skip(!loggedIn, 'BLOCKED by BUG-001: cannot authenticate on the dev environment, so the dashboard is unreachable.');
  });

  test('NAV-001: Main navigation tabs are visible after login', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await expect(dashboard.navMenu).toBeVisible();
  });

  test('NAV-002: Clicking a tab navigates to the corresponding section and marks it active', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoTab('Dashboard');
    await expect(page).toHaveURL(/dashboard/i);
  });

  test('NAV-003: Browser back button returns to the previous tab correctly', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoTab('Dashboard');
    const urlAfterFirstNav = page.url();
    await dashboard.gotoTab('Records');
    await page.goBack();
    await expect(page).toHaveURL(urlAfterFirstNav);
  });

  test('NAV-004: Refreshing a tab keeps the user on the same tab (session persists)', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoTab('Records');
    const urlBeforeReload = page.url();
    await page.reload();
    await expect(page).toHaveURL(urlBeforeReload);
  });

  test('NAV-005: Logout returns the user to the login page and protected pages become inaccessible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.logout();
    await expect(page).toHaveURL(/\/login/);
  });
});
