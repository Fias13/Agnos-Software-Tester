# Final Submission Checklist

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | All assignment requirements are covered | ✅ | Test Plan, manual + automated test cases, execution, bug reports, automation project, reporting, README, Google Sheets structure all present |
| 2 | Test Plan is complete | ✅ | [docs/02_Test_Plan.md](02_Test_Plan.md) / [sheets/1_Test_Plan.csv](../sheets/1_Test_Plan.csv) |
| 3 | Manual test cases are comprehensive | ✅ | 50 test cases across Registration, Login, Navigation, Search, Filter, Download |
| 4 | Test cases are not duplicated | ✅ | Reviewed for uniqueness during authoring |
| 5 | Actual results are based on real execution | ✅ | Login/Registration results come from real browser + API interaction; everything else is honestly marked Blocked/Not Verified, never fabricated |
| 6 | Pass/Fail statuses are accurate | ✅ | 11 Pass / 4 Fail / 33 Blocked / 2 Not Verified — matches [sheets/3_Test_Execution.csv](../sheets/3_Test_Execution.csv) exactly |
| 7 | Bugs are based on real observations | ✅ | All 3 bugs reproduced multiple times with captured HTTP evidence; BUG-001 additionally confirmed via raw `curl` outside the browser |
| 8 | Bug reports are reproducible | ✅ | Each includes exact URLs, inputs, and observed API responses |
| 9 | Screenshots are included where appropriate | ✅ | [agnos-playwright/screenshots/](../agnos-playwright/screenshots/) — 10 curated evidence images |
| 10 | Automation tests actually run | ✅ | Executed for real: 140 runs across 4 browser projects (40 passed, 8 failed on genuine app defects, 92 correctly self-skipped) |
| 11 | Playwright project is maintainable | ✅ | Page Object Model, `.env`-driven config, no hardcoded credentials, no arbitrary long waits |
| 12 | No credentials are committed | ✅ | `.env` is git-ignored; only `.env.example` (empty placeholders) is committed |
| 13 | README works | ✅ | Verified `npm install`, `npx playwright install`, and `npx playwright test` all run successfully as documented |
| 14 | Test report numbers match execution results | ✅ | All statistics in [docs/04_Test_Report.md](04_Test_Report.md) are pulled directly from the CSVs / actual Playwright run output, not invented |
| 15 | Google Sheet structure is complete | ✅ | 6 CSVs in [sheets/](../sheets/), ready for Google Sheets import (File → Import → one sheet per tab) |
| 16 | Terminology is consistent | ✅ | TC ID prefixes (REG-/LOGIN-/NAV-/SEARCH-/FILTER-/DOWNLOAD-), Bug ID (BUG-), Automation ID (AUTO-) used consistently across all documents |
| 17 | Final deliverables look professional | ✅ | Consistent structure, real evidence, honest labeling of Verified / Assumption / Not Verified throughout |

## Explicit labeling summary

- **ACTUALLY VERIFIED**: All Login/Registration page behavior, both bug reproductions (BUG-001, BUG-002, BUG-003), all client-side validation behavior, and all real Playwright execution results.
- **QA ASSUMPTION**: `DashboardPage.ts` / `RecordsPage.ts` selectors, and the Navigation/Search/Filter/Download manual test case *expected results* (since the real dashboard UI could not be reached to confirm conventions).
- **NOT VERIFIED**: REG-005 (individual password-policy sub-rules), REG-008 (boundary-length inputs) — explicitly time-boxed out, not silently dropped.

## Known limitation carried into submission

The single biggest limitation of this assignment is that **the dev environment's own backend blocks login and registration** (BUG-001/BUG-002), which capped how much of the assignment's requested scope (Navigation/Search/Filter/Download) could be *executed* rather than just *designed*. This is disclosed prominently in the Test Report's Executive Summary and Risks sections rather than hidden, per the assignment's explicit instruction to never fabricate results.
