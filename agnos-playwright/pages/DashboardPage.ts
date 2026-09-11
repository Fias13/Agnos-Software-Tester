import { Locator, Page } from '@playwright/test';

/**
 * Page Object for the authenticated AI Dashboard shell (navigation, logout).
 *
 * IMPORTANT — NOT VERIFIED AGAINST LIVE DOM:
 * The dev environment's login and registration APIs return HTTP 500 for
 * every credential combination tested (see BUG-001 / BUG-002 in the bug
 * report), so the authenticated dashboard could never be reached during
 * this assignment. The locators below are QA ASSUMPTIONS based on common
 * dashboard UI conventions and must be verified/adjusted against the real
 * DOM as soon as the environment is fixed, before these tests are
 * unskipped. Every test that depends on this page is marked
 * test.fixme()/test.skip() with a comment pointing back to BUG-001.
 */
export class DashboardPage {
  readonly page: Page;
  readonly navMenu: Locator;
  readonly logoutButton: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navMenu = page.locator('nav');
    this.userMenu = page.getByRole('button', { name: /account|profile|user/i });
    this.logoutButton = page.getByRole('button', { name: /log ?out|sign ?out/i });
  }

  async gotoTab(tabName: string) {
    await this.navMenu.getByRole('link', { name: tabName }).click();
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}
