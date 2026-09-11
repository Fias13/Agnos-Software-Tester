# Bug Reports — Agnos AI Screening Dashboard

*(Also available as [sheets/4_Bug_Report.csv](../sheets/4_Bug_Report.csv) for direct import into Google Sheets. Screenshots referenced below live in [agnos-playwright/screenshots/](../agnos-playwright/screenshots/).)*

All three bugs below were independently reproduced multiple times (including, for BUG-001, via a plain `curl` call outside the browser entirely) and are based solely on directly-observed behavior — no speculation about backend internals beyond what the HTTP responses show.

---

## BUG-001 — [Login] Login API returns HTTP 500 for the documented test account and the frontend mislabels the error as "Wrong email or password"

| Field | Value |
|---|---|
| **Module** | Login |
| **Environment** | Dev — `https://dev.app.agnoshealth.com/ai_dashboard/login`; Chromium/Firefox/WebKit (Playwright 1.63); also reproduced via direct `curl` to the API |
| **Severity** | Critical (Blocker) |
| **Priority** | P0 |
| **Precondition** | None — occurs on a fresh, unauthenticated session |
| **Steps to Reproduce** | 1. Navigate to `https://dev.app.agnoshealth.com/ai_dashboard/login`<br>2. Enter Email: `test@gmail.com`<br>3. Enter Password: `12345` (exactly as documented in the assignment)<br>4. Click "Sign in"<br>5. Observe the network request to `POST https://dev.api.agnoshealth.com/api/ai_dashboard/login` and the resulting UI state |
| **Expected Result** | User is authenticated and redirected into the AI Screening Dashboard |
| **Actual Result** | The login API responds **HTTP 500** with body `{"error_message":"internal_server_error"}`. The UI displays **"Wrong email or password. Please try again"** and keeps the user on the login page — a misleading message, since the real cause is a server-side error, not invalid credentials. This blocks **all** further authenticated testing (navigation, search, filter, download, logout). |
| **Reproducibility** | 4/4 attempts (2× via UI with Playwright, 2× via direct `curl` POST to the API) across a ~15 minute window — fully persistent, not transient |
| **Attachment** | `screenshots/BUG001_login_wrong_credentials_message.png` |
| **Status** | Open |
| **Notes** | Also verified the same 500 occurs for freshly-registered accounts attempting to log in, and for random invalid credentials — suggesting the entire login endpoint is failing server-side in this dev environment rather than this being specific to one account. Recommend the backend team check server logs for `/api/ai_dashboard/login` around the timestamps in the attached Playwright trace files. |

**Raw evidence (curl, bypassing the browser entirely):**
```
$ curl -s -X POST "https://dev.api.agnoshealth.com/api/ai_dashboard/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test@gmail.com","password":"12345"}'

{"error_message":"internal_server_error"}
HTTP_STATUS:500
```

---

## BUG-002 — [Registration] Account creation API returns HTTP 500 for a syntactically valid, unique, policy-compliant sign-up with no error shown to the user

| Field | Value |
|---|---|
| **Module** | Registration |
| **Environment** | Dev — `https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up`; Chromium/Firefox/WebKit (Playwright 1.63) |
| **Severity** | Critical |
| **Priority** | P0 |
| **Precondition** | None — occurs on a fresh Sign Up page load |
| **Steps to Reproduce** | 1. Navigate to `https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up`<br>2. Enter a brand-new, never-used email (e.g. `agnos.qa.test.<timestamp>@gmail.com`)<br>3. Enter a password meeting the documented policy, e.g. `Valid@1234`, in both Password and Confirm Password<br>4. Click "Confirm"<br>5. Observe the network request to `POST https://dev.api.agnoshealth.com/api/ai_dashboard/create_user` and the resulting UI state |
| **Expected Result** | A new account is created and the user is taken off the sign-up page (e.g. to login or the dashboard) |
| **Actual Result** | The API responds **HTTP 500** with body `{"error_message":"internal_server_error"}`. The UI shows **absolutely no error message, toast, or loading indicator** — the form simply remains exactly as it was, giving the user no indication that anything went wrong. This blocks self-service account creation entirely on this environment. |
| **Reproducibility** | 3/3 attempts with 3 different unique emails and 2 different strong passwords (including a retry using the exact documented `test@gmail.com` account with a policy-compliant password) |
| **Attachment** | `screenshots/BUG002_signup_no_error_shown_after_500.png` |
| **Status** | Open |
| **Notes** | Client-side validation (invalid email format, weak password, password mismatch) all work correctly and are **not** affected — only submission of a fully valid, new payload fails server-side. This narrows the likely fault to the account-creation/persistence logic itself (e.g. DB write, hospital-lookup for `"agnos"`, or a downstream email/notification integration) rather than the endpoint being completely unreachable. The complete absence of user-facing error feedback is itself a secondary UX defect worth fixing independently of the 500. |

**Raw evidence (captured request/response):**
```
REQUEST PAYLOAD: {"username":"agnos.qa.retry.<ts>@gmail.com","password":"Retry@5678","hospital":"agnos"}
RESPONSE STATUS: 500
RESPONSE BODY:   {"error_message":"internal_server_error"}
```

---

## BUG-003 — [UI/Responsive] Login and Sign Up pages are not responsive on mobile viewports — form card overlaps the oversized background heading text

| Field | Value |
|---|---|
| **Module** | Login, Registration |
| **Environment** | Dev environment, mobile viewport 412×839 (Pixel 7 emulation via Playwright), Chromium mobile emulation |
| **Severity** | High |
| **Priority** | P1 |
| **Precondition** | None — occurs on any mobile-width viewport (~412px) |
| **Steps to Reproduce** | 1. Open `https://dev.app.agnoshealth.com/ai_dashboard/login` (or `/agnos/sign_up`)<br>2. Load the page using a mobile viewport around 412×839px (e.g. Pixel 7 device emulation)<br>3. Observe the page layout without interacting further |
| **Expected Result** | The login/sign-up form is fully readable and usable on mobile, with no overlapping elements |
| **Actual Result** | The desktop's two-column layout (logo/heading on the left, form card on the right) does not reflow for mobile. Instead, the oversized "AI SCREENING DASHBOARD" / "Create Account" background heading text renders behind and directly overlapping the narrow, centered form card. On the Sign Up page specifically, the "Confirm Password" label is partially obscured by the word "SCREENING" bleeding through. The page is visually broken and looks unprofessional, though fields generally remain tappable underneath the overlapping text. |
| **Reproducibility** | 2/2 (both login and sign-up pages) consistently at the tested viewport size |
| **Attachment** | `screenshots/BUG003_mobile_login_layout_broken.png`, `screenshots/BUG003_mobile_signup_layout_broken.png` |
| **Status** | Open |
| **Notes** | Also correlates with an intermittent Playwright timeout on the `mobile-chrome` browser project when asserting on-screen error text (see Test Report → Flaky Tests) — the broken layout may affect element stacking/visibility timing on some renders. Recommend adding a responsive breakpoint that stacks the heading above the form card (or hides/shrinks it) below ~768px width. |

---

## Non-bug observation (logged as a manual test result, not a formal bug)

**LOGIN-009** — No "Forgot password" / account-recovery link is present on the login page. This is logged at **Low** severity as a usability observation in the Manual Test Cases / Test Execution sheets rather than as a formal bug, since it is a **QA Assumption** that recovery should exist — this may be an intentional design choice for a staff-provisioned internal system. Recommend confirming with the product owner.

## Areas with no defects observed

Per the instruction to only report genuine defects: **no defect was observed** in the client-side email-format validation, password-policy validation, or password-confirmation-mismatch validation on the Sign Up form — all three behaved correctly and consistently across every test performed.
