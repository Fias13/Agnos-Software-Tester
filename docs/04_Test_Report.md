# Test Report — Agnos AI Screening Dashboard

**Report Date:** 2026-09-10
**Tested By:** QA (this assignment)
**Environment:** Dev — `https://dev.app.agnoshealth.com/ai_dashboard` / API `https://dev.api.agnoshealth.com`

---

## 1. Executive Summary

Manual and automated testing was performed against the Agnos AI Screening Dashboard dev environment, covering Registration, Login/Logout, Navigation, Search, Filter, and Download per the assignment scope. Testing surfaced **two Critical/Blocker backend defects** — the login API (BUG-001) and the account-creation API (BUG-002) both return HTTP 500 for every valid input tested — which prevented any authenticated session from being established in this environment. As a result, features that require being logged in (Navigation, Search, Filter, Download, and Logout) could not be executed and are recorded as **Blocked**, not fabricated as Pass. A third defect (BUG-003, High) was found in the responsive layout of the Login/Sign Up pages on mobile viewports. Everything that *could* be exercised — form validation, UI state, and negative-path handling on the Login and Sign Up pages — passed, indicating the front-end logic itself is solid; the blocking issue is specifically in the backend auth/account services on this dev environment.

## 2. Test Environment

| Item | Detail |
|---|---|
| Application URL | `https://dev.app.agnoshealth.com/ai_dashboard` |
| API URL | `https://dev.api.agnoshealth.com` |
| Test account | `test@gmail.com` / `12345` (as provided in the assignment) |
| Browsers tested (automation) | Chromium, Firefox, WebKit (desktop), Mobile Chrome (Pixel 7 emulation) |
| Tooling | Playwright 1.63 (TypeScript), Node.js v22.11.0 |
| Date range | 2026-09-10 |

## 3. Test Scope

Registration, Login/Logout, Navigation, Search, Filter (triage/date/channel), and Download, per the assignment. See [Test Plan](02_Test_Plan.md) for full scope/out-of-scope detail.

## 4. Test Execution Summary

| Category | Count |
|---|---|
| Total manual test cases designed | 50 |
| Manual test cases executed (Pass + Fail) | 15 |
| Manual — Passed | 11 |
| Manual — Failed | 4 |
| Manual — Blocked | 33 |
| Manual — Not Verified | 2 |

Full detail: [sheets/2_Manual_Test_Cases.csv](../sheets/2_Manual_Test_Cases.csv) and [sheets/3_Test_Execution.csv](../sheets/3_Test_Execution.csv).

## 5. Test Case Statistics

| Metric | Value | How calculated |
|---|---|---|
| Manual pass rate (of executed cases) | **73.3%** | 11 / 15 |
| Manual pass rate (of all designed cases) | **22.0%** | 11 / 50 |

The low "of all designed cases" figure is driven entirely by the 33 Blocked cases (66%) — a direct, documented consequence of BUG-001, not of individual feature failures. Excluding blocked/not-verified cases, the executable surface passed at a healthy 73.3%.

## 6. Pass / Fail / Blocked Summary

```
PASS          ███████████                 11
FAIL          ████                         4
BLOCKED       █████████████████████████████████  33
NOT VERIFIED  ██                           2
              ------------------------------
              TOTAL                       50
```

## 7. Bugs Found

| Bug ID | Title | Severity | Priority | Status |
|---|---|---|---|---|
| BUG-001 | [Login] Login API returns HTTP 500 for the documented test account; frontend mislabels the error | Critical (Blocker) | P0 | Open |
| BUG-002 | [Registration] Account creation API returns HTTP 500 for a valid, unique sign-up with no error shown | Critical | P0 | Open |
| BUG-003 | [UI/Responsive] Login/Sign Up pages overlap the background heading on mobile viewports | High | P1 | Open |

Full detail with reproduction steps and evidence: [Bug Reports](03_Bug_Reports.md) / [sheets/4_Bug_Report.csv](../sheets/4_Bug_Report.csv).

## 8. Severity Distribution

| Severity | Count |
|---|---|
| Critical | 2 |
| High | 1 |
| Medium | 0 |
| Low | 1 (usability observation, logged in test results, not as a formal bug — see LOGIN-009) |

## 9. Automation Summary

A Playwright (TypeScript) suite was built with Page Object Model structure, covering Login, Registration, Navigation, Search, Filter, and Download (35 unique test cases). The suite was **actually executed** across 4 browser/device projects (Chromium, Firefox, WebKit, Mobile Chrome) — 140 total test runs.

| Metric | Value |
|---|---|
| Total automated test runs | 140 (35 cases × 4 projects) |
| Passed | 40 |
| Failed | 8 |
| Skipped (self-skipped, see below) | 92 |
| Pass rate (of executed, excluding skipped) | **83.3%** (40/48) |
| Pass rate (of all runs) | 28.6% (40/140) |

**Why 8 failed, and why that's correct:** `LOGIN-005` ("valid credentials log the user in") and `REG-001` ("valid registration succeeds") each failed identically on all 4 browser projects. Each assertion encodes the **correct expected behavior** (successful login / successful registration). They fail because the application itself is broken (BUG-001 / BUG-002) — this is **AUTOMATION FAILURE CAUSED BY APPLICATION DEFECT**, exactly what regression automation is supposed to catch. No test code changes are needed; these tests should start passing the moment the backend is fixed.

**Why 92 were skipped, and why that's correct:** Every Navigation/Search/Filter/Download test begins with a real login attempt via a shared `tryLogin()` helper. Because login fails in this environment, each test calls `test.skip()` with an explicit reason referencing BUG-001, rather than being hardcoded as permanently skipped or — worse — faked as passing. As soon as the environment is fixed, these 92 runs will execute for real with no code changes required.

**Flaky test observed:** In one supplementary full-suite run, `LOGIN-004` (invalid-credentials error message) intermittently timed out on the `mobile-chrome` project (it passed cleanly in the primary run and on all other browsers). Root-caused to variable backend response latency for the 500 error under repeated requests, not to the test code — **AUTOMATION FAILURE CAUSED BY APPLICATION/ENVIRONMENT INSTABILITY**, not a selector or logic bug. No test-code fix was needed or applied; this is called out rather than hidden.

See [sheets/5_Automation_Test_Cases.csv](../sheets/5_Automation_Test_Cases.csv) for the full candidate list and priority/reasoning, and [agnos-playwright/](../agnos-playwright/) for the implementation.

## 10. Risks

1. **[Realized, Critical]** The dev environment's auth backend (login + registration) is non-functional, blocking ~66% of the planned test scope. This is an environment/release risk, not a test-design gap.
2. **[Open]** Because the dashboard could never be reached, Navigation/Search/Filter/Download test cases and Page Object selectors are based on **QA Assumptions**, not confirmed DOM structure. They will very likely need adjustment once the environment is fixed.
3. **[Open]** No staging/production environment was available for cross-environment comparison, so it's not possible to confirm whether this is a dev-only issue.

## 11. Recommendations

1. **Immediate:** Backend team to investigate `/api/ai_dashboard/login` and `/api/ai_dashboard/create_user` — both return generic 500s for valid input (BUG-001, BUG-002). This is the single highest-priority fix; nothing else in the dashboard can be verified until it's resolved.
2. Improve login error handling to distinguish real "invalid credentials" (4xx) from unexpected server errors (5xx) with distinct, accurate user-facing messages.
3. Add a visible error/toast on the Sign Up form for any failed submission — silent failure (BUG-002) is a poor user experience even independent of the underlying 500.
4. Add a responsive breakpoint for the Login/Sign Up layout below ~768px width (BUG-003).
5. Once the environment is fixed, re-run the full Playwright suite — the 92 currently-skipped tests will execute automatically — and revisit `DashboardPage.ts`/`RecordsPage.ts` selectors against the real DOM before relying on their results.
6. Confirm with the product owner whether a password-recovery flow is intentionally absent (LOGIN-009).

## 12. Final QA Assessment

The parts of the application that could be tested (client-side form validation and UI state on Login/Sign Up) are solid — every negative-path and boundary check passed. However, the application **cannot currently fulfill its core purpose** in this dev environment: no user, new or existing, can successfully authenticate. This is a **release blocker**. I would not sign off on this build for further QA or stakeholder review until BUG-001 and BUG-002 are resolved and the full Navigation/Search/Filter/Download scope can actually be executed.
