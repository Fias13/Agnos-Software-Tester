import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { env } from './testData';

/**
 * Attempts to log in with the configured test credentials and reports
 * whether it succeeded. Used to dynamically skip dashboard-dependent
 * suites (navigation/search/filter/download) instead of hardcoding
 * test.fixme() forever — once BUG-001 is fixed in the environment,
 * these suites will start running automatically without code changes.
 */
export async function tryLogin(page: Page): Promise<boolean> {
  if (!env.username || !env.password) return false;

  const loginPage = new LoginPage(page);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(env.username, env.password);

  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 8_000 });
    return true;
  } catch {
    return false;
  }
}
