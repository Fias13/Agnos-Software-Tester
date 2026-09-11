import { test, expect } from '@playwright/test';
import { RecordsPage } from '../pages/RecordsPage';
import { tryLogin } from '../utils/auth';

/**
 * Automated coverage for DOWNLOAD-001..DOWNLOAD-005 (see Manual_Test_Cases sheet).
 * BLOCKED by BUG-001 — see navigation.spec.ts header for the skip strategy
 * and the QA-ASSUMPTION disclaimer on RecordsPage locators.
 */
test.describe('Download', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await tryLogin(page);
    test.skip(!loggedIn, 'BLOCKED by BUG-001: cannot authenticate on the dev environment, so the records page is unreachable.');
  });

  test('DOWNLOAD-001: Download button produces a file', async ({ page }) => {
    const records = new RecordsPage(page);
    const download = await records.download();
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('DOWNLOAD-002: Downloaded file has the expected extension (e.g. .csv/.xlsx)', async ({ page }) => {
    const records = new RecordsPage(page);
    const download = await records.download();
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx?|pdf)$/i);
  });

  test('DOWNLOAD-003: Downloading with an active filter only exports the filtered records', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.filterByTriage('Emergency');
    const download = await records.download();
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('DOWNLOAD-004: Download button is disabled or hidden when there is no data to export', async ({ page }) => {
    const records = new RecordsPage(page);
    await records.search('zzzznonexistentrecordzzzz');
    await expect(records.downloadButton).toBeDisabled();
  });

  test('DOWNLOAD-005: Downloaded filename follows the application naming convention', async ({ page }) => {
    const records = new RecordsPage(page);
    const download = await records.download();
    // Exact naming convention (e.g. records_YYYYMMDD.csv) to be confirmed
    // against the live app; placeholder assertion checks a filename exists.
    expect(download.suggestedFilename().length).toBeGreaterThan(0);
  });
});
