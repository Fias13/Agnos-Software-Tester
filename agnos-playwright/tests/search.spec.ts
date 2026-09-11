import { test, expect } from '@playwright/test';
import { RecordsPage } from '../pages/RecordsPage';
import { tryLogin } from '../utils/auth';

/**
 * Automated coverage for SEARCH-001..SEARCH-006 (see Manual_Test_Cases sheet).
 * BLOCKED by BUG-001 — see navigation.spec.ts header for the skip strategy
 * and the QA-ASSUMPTION disclaimer on RecordsPage locators.
 */
test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await tryLogin(page);
    test.skip(!loggedIn, 'BLOCKED by BUG-001: cannot authenticate on the dev environment, so the records page is unreachable.');
  });

  test('SEARCH-001: Searching an exact, existing record name returns that record', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.search('John Doe');
    await expect(records.recordsTable).toContainText('John Doe');
  });

  test('SEARCH-002: Partial search text returns matching records', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.search('Jo');
    await expect(records.recordsTable.locator('tr')).not.toHaveCount(0);
  });

  test('SEARCH-003: Searching for a term with no matches shows an empty-state message', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.search('zzzznonexistentrecordzzzz');
    await expect(records.noResultsMessage).toBeVisible();
  });

  test('SEARCH-004: Clearing the search box restores the full, unfiltered record list', async ({ page }) => {
    const records = new RecordsPage(page);
    const initialCount = await records.recordsTable.locator('tr').count();
    await records.search('zzzznonexistentrecordzzzz');
    await records.searchInput.fill('');
    await records.searchInput.press('Enter');
    await expect(records.recordsTable.locator('tr')).toHaveCount(initialCount);
  });

  test('SEARCH-005: Search input accepts special characters without crashing the page', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.search("O'Brien-Test #1 <script>");
    await expect(page.locator('body')).toBeVisible();
  });

  test('SEARCH-006: Empty search (no input) does not error and shows the default record list', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.searchInput.press('Enter');
    await expect(records.recordsTable).toBeVisible();
  });
});
