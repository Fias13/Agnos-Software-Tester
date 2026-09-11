import { Locator, Page } from '@playwright/test';

/**
 * Page Object for the patient records list: search, triage/date/channel
 * filters, and download.
 *
 * IMPORTANT — NOT VERIFIED AGAINST LIVE DOM (see DashboardPage.ts header
 * for why). Locators are QA ASSUMPTIONS based on the assignment's written
 * feature list, intended as a ready-to-adjust scaffold rather than a
 * confirmed implementation. Do not trust these selectors without
 * re-validating them against the real records page first.
 */
export class RecordsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly triageFilter: Locator;
  readonly dateFilter: Locator;
  readonly channelFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly downloadButton: Locator;
  readonly recordsTable: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search/i);
    this.triageFilter = page.getByRole('combobox', { name: /triage/i });
    this.dateFilter = page.getByRole('button', { name: /date/i });
    this.channelFilter = page.getByRole('combobox', { name: /channel/i });
    this.clearFiltersButton = page.getByRole('button', { name: /clear/i });
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.recordsTable = page.getByRole('table');
    this.noResultsMessage = page.getByText(/no (records|results|data) found/i);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async filterByTriage(level: string) {
    await this.triageFilter.selectOption({ label: level });
  }

  async filterByChannel(channel: string) {
    await this.channelFilter.selectOption({ label: channel });
  }

  async download() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click(),
    ]);
    return download;
  }
}
