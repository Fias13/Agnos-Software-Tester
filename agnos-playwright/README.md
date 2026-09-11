# Agnos AI Dashboard - Playwright Automation

## Overview

Playwright (TypeScript) automation suite for the Agnos AI Screening Dashboard, built as part of a QA candidate assignment. It covers Login, Registration, Navigation, Search, Filter, and Download using the Page Object Model.

**Current known state of the target environment:** the dev environment's login and account-creation backend endpoints return HTTP 500 for every valid input tested (see `../docs/03_Bug_Reports.md`, BUG-001/BUG-002). Because of this, tests that depend on an authenticated session (Navigation/Search/Filter/Download) dynamically detect that login failed and skip themselves with a clear reason - they are not hardcoded as skipped and will start running for real as soon as the environment is fixed.

## Scope

- Login: UI state, validation, positive/negative login
- Registration: UI state, validation (email format, password policy, confirm-password match), positive registration
- Navigation, Search, Filter, Download: implemented against QA-Assumption selectors (dashboard was unreachable during this assignment - see `../docs/01_Exploration_Notes.md`); currently self-skip via a shared login-check helper

## Tech Stack

- [Playwright Test](https://playwright.dev/) (TypeScript)
- Page Object Model (`pages/`)
- `dotenv` for environment-based configuration

## Project Structure

```
agnos-playwright/
├── tests/
│   ├── login.spec.ts          # LOGIN-001..006
│   ├── registration.spec.ts   # REG-001..006
│   ├── navigation.spec.ts     # NAV-001..005 (self-skip if login fails)
│   ├── search.spec.ts         # SEARCH-001..006 (self-skip if login fails)
│   ├── filter.spec.ts         # FILTER-001..007 (self-skip if login fails)
│   └── download.spec.ts       # DOWNLOAD-001..005 (self-skip if login fails)
├── pages/
│   ├── LoginPage.ts            # verified selectors
│   ├── SignupPage.ts           # verified selectors
│   ├── DashboardPage.ts        # QA-ASSUMPTION selectors, not yet verified against live DOM
│   └── RecordsPage.ts          # QA-ASSUMPTION selectors, not yet verified against live DOM
├── utils/
│   ├── testData.ts             # env-driven test data, generators
│   └── auth.ts                 # tryLogin() helper used to dynamically skip blocked suites
├── exploration/                 # one-off scripts used to inspect the live app (not part of the test suite; git-ignored screenshots/logs)
├── screenshots/                 # curated evidence referenced by the bug reports
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
npm install
npx playwright install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in real values. `.env` is git-ignored and must never be committed.

```
BASE_URL=https://dev.app.agnoshealth.com/ai_dashboard
TEST_USERNAME=
TEST_PASSWORD=
INVALID_USERNAME=
INVALID_PASSWORD=
```

## Run Tests

```bash
npm test
```

## Run Headed

```bash
npx playwright test --headed
```

## Run Specific Test

```bash
npx playwright test tests/login.spec.ts
```

## View Report

```bash
npx playwright show-report
```

## Test Coverage

35 unique test cases across Login, Registration, Navigation, Search, Filter, and Download, run across 4 browser/device projects (Chromium, Firefox, WebKit, Mobile Chrome) = 140 total automated runs per full execution. See `../docs/04_Test_Report.md` for the actual, real execution results (40 passed, 8 failed on genuine application defects, 92 correctly self-skipped, 1 intermittent flake documented).

## Test Strategy

- **Page Object Model**: all selectors live in `pages/`, never inline in specs.
- **Assertions encode correct expected behavior**, not current (possibly broken) behavior — so a broken app produces a real, informative test failure instead of a test that was quietly written to match the bug.
- **Dynamic skipping over hardcoded skipping**: `utils/auth.ts` attempts a real login before every dashboard-dependent test; if it fails, the test skips itself with a reason pointing at the relevant bug ID. This means the suite self-heals the moment the environment is fixed, with zero code changes.
- **No hardcoded credentials**: all test data comes from `.env` via `utils/testData.ts`.
- **Unique data per run**: registration tests generate a timestamped unique email (`uniqueTestEmail()`) so repeated runs never collide on "email already exists".

## Known Issues

- **BUG-001 / BUG-002 (Critical/Blocker)**: the dev environment's login and account-creation backend endpoints return HTTP 500 for all tested inputs. This is an **application defect**, not a test-automation defect — see `../docs/03_Bug_Reports.md` for full reproduction evidence (including a plain `curl` reproduction outside the browser).
- **BUG-003 (High)**: Login/Sign Up pages are not responsive at mobile widths (~412px).
- Because the authenticated dashboard could never be reached, `DashboardPage.ts` and `RecordsPage.ts` selectors are **QA Assumptions** based on common dashboard UI conventions, not confirmed against the real DOM. Review and adjust them against the live app before trusting results from `navigation.spec.ts`, `search.spec.ts`, `filter.spec.ts`, or `download.spec.ts`.
- One intermittent timeout was observed on the `mobile-chrome` project for `LOGIN-004` in a supplementary run; attributed to variable backend latency, not test code (see Test Report → Flaky Tests).

## Notes

This project was built as part of a 3-day QA candidate assignment. The `exploration/` folder contains the one-off Node scripts used to inspect the live application (DOM structure, network responses, mobile rendering) before writing test cases — kept for transparency/traceability but excluded from git via `.gitignore` (only the curated `screenshots/` folder used as bug-report evidence is committed).
