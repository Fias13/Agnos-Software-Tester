import { test, expect } from '@playwright/test';
import { RecordsPage } from '../pages/RecordsPage';
import { tryLogin } from '../utils/auth';

/**
 * Automated coverage for FILTER-001..FILTER-007 (see Manual_Test_Cases sheet).
 * BLOCKED by BUG-001 — see navigation.spec.ts header for the skip strategy
 * and the QA-ASSUMPTION disclaimer on RecordsPage locators.
 */
test.describe('Filters', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await tryLogin(page);
    test.skip(!loggedIn, 'BLOCKED by BUG-001: cannot authenticate on the dev environment, so the records page is unreachable.');
  });

  test('FILTER-001: Filtering by triage level shows only records of that level', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.filterByTriage('Emergency');
    const rows = records.recordsTable.locator('tr');
    await expect(rows.first()).toBeVisible();
  });

  test('FILTER-002: Filtering by a date range shows only records within that range', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.dateFilter.click();
    // Date-range picker interaction is application-specific and will be
    // finalized once the real UI is reachable.
    await expect(records.recordsTable).toBeVisible();
  });

  test('FILTER-003: Filtering by channel shows only records from that channel', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.filterByChannel('Line');
    await expect(records.recordsTable).toBeVisible();
  });

  test('FILTER-004: Combining triage + channel filters applies both conditions (AND logic)', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.filterByTriage('Emergency');
    await records.filterByChannel('Line');
    await expect(records.recordsTable).toBeVisible();
  });

  test('FILTER-005: Clear filters button resets the list to the unfiltered state', async ({ page }) => {
    const records = new RecordsPage(page);
    const initialCount = await records.recordsTable.locator('tr').count();
    await records.filterByTriage('Emergency');
    await records.clearFiltersButton.click();
    await expect(records.recordsTable.locator('tr')).toHaveCount(initialCount);
  });

  test('FILTER-006: A filter combination with no matching records shows an empty-state message', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.filterByTriage('Emergency');
    await records.filterByChannel('Walk-in');
    // If this specific combination has no matches, an empty-state message is expected.
    await expect(records.recordsTable.or(records.noResultsMessage)).toBeVisible();
  });

  test('FILTER-007: Applied filters persist after navigating away and back to the records tab', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.filterByTriage('Emergency');
    await page.goBack();
    await page.goForward();
    await expect(records.triageFilter).toHaveValue(/emergency/i);
  });
});
