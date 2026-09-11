# Phase 1 — Application Exploration Notes

**Date:** 2026-09-10
**Method:** Live inspection of the dev environment using Playwright (headless Chromium), including DOM/network inspection, screenshots, and direct API calls via curl. No behavior in this document is invented — anything not directly observed is explicitly marked **QA Assumption** or **Not Verified**.

---

## 1. Application Map

| Page | URL | Status |
|---|---|---|
| AI Dashboard — Login | `https://dev.app.agnoshealth.com/ai_dashboard/login` | ✅ Verified |
| AI Dashboard — Sign Up | `https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up` | ✅ Verified |
| AI Dashboard — authenticated area (tabs, records, search, filters, download) | `https://dev.app.agnoshealth.com/ai_dashboard/...` (exact routes unknown) | ❌ **Not reachable** — see Bug BUG-001 |
| Public symptom checker ("generate a new AI record") | `https://dev.app.agnoshealth.com` → redirects to `/onboarding/0` | ✅ Reached (Thai-language patient-facing app); out of scope for deep testing per Test Plan |

Navigating to `/ai_dashboard` with no session correctly redirects to `/ai_dashboard/login` (verified).

---

## 2. Login Page (`/ai_dashboard/login`)

**Title:** "Log-in" under the "AI SCREENING DASHBOARD" heading, Agnos logo.

**Elements observed:**
- `E-mail` input — `id="Email"`, `type="email"`
- `Password` input — `id="password"`, `type="password"`, with a show/hide (eye) icon toggle
- `Sign in` button — `type="submit"`
  - **Disabled** (greyed out) until both fields have a value (verified)
  - **Enabled** (solid blue) once both fields are non-empty (verified)
- No "Forgot password" or account-recovery link is present anywhere on the page (verified by enumerating all buttons/links — only "Sign in" exists)

**Observed behavior on submit:**
- `POST https://dev.api.agnoshealth.com/api/ai_dashboard/login` is called
- With the documented test credentials (`test@gmail.com` / `12345`) **and** with random invalid credentials, the API consistently returned **HTTP 500** `{"error_message":"internal_server_error"}`
- The UI displays a generic **"Wrong email or password. Please try again"** message regardless of the real (500) cause and keeps the user on the login page
- See **BUG-001** for full detail and reproduction evidence

---

## 3. Sign Up Page (`/ai_dashboard/agnos/sign_up`)

**Title:** "Create Account" under the same "AI SCREENING DASHBOARD" heading.

**Elements observed (in DOM order):**
1. `E-mail` input — `type="text"` (not `type="email"`, unlike the login page)
2. `Password` input — `type="password"`, show/hide toggle
3. `Confirm Password` input — `type="password"`, show/hide toggle
4. `Confirm` button — `type="submit"`
   - Disabled when all fields are empty (verified)
   - Becomes enabled as soon as fields are non-empty, **even with invalid values** — actual validation happens on submit, not continuously (verified)

**Client-side validation observed on submit (before any API call):**
- Invalid email format (e.g. `not-an-email`) → message **"The email should be in the format 'test@example.com'"**; `create_user` API is **not** called (verified)
- Password shorter than policy / missing complexity → message **"The password must be at least 8 characters long and include at least one uppercase letter, one digit, and one special character."**; API **not** called (verified)

**Validation observed that DOES reach the API:**
- Password / Confirm Password mismatch → the `create_user` API **is** called, and the response drives the message **"Confirm password does not match the password."** (verified — this is the one check that is not purely client-side)

**Fully valid submission (new unique email + policy-compliant password + matching confirm):**
- `POST https://dev.api.agnoshealth.com/api/ai_dashboard/create_user` is called with payload `{"username":"...","password":"...","hospital":"agnos"}`
- Response: **HTTP 500** `{"error_message":"internal_server_error"}`, reproduced 3/3 times with different unique emails, including a retry using the exact documented `test@gmail.com` account
- **No error message, toast, or any feedback is shown to the user** — the form silently does nothing
- See **BUG-002** for full detail and reproduction evidence

---

## 4. Mobile / Responsive Behavior

Both the Login and Sign Up pages were also loaded at a mobile viewport (412×839, Pixel 7 emulation).

**Observed:** The desktop's two-column layout (heading on the left, form card on the right) does not reflow. Instead, the oversized "AI SCREENING DASHBOARD" / "Create Account" background heading renders behind and overlapping the narrow, centered form card — on Sign Up, the "Confirm Password" label is partially obscured by the word "SCREENING" bleeding through. See **BUG-003**.

---

## 5. Authenticated Dashboard (Navigation / Records / Search / Filter / Download)

**Status: Not reachable.** Every login attempt against the dev environment — using the documented test account, freshly self-registered accounts, and random invalid credentials — returns HTTP 500 from the backend (see BUG-001). As a result, the following areas described in the assignment **could not be directly observed**:

- Main navigation tabs and their labels
- The records list / table structure
- Search behavior
- Triage / date / channel filter controls
- Download control and file format

All test cases and Page Object selectors for these areas are therefore built on **QA Assumptions** about common hospital-dashboard UI conventions (e.g. a searchable/filterable table with a triage dropdown, a date-range picker, a channel dropdown, and a download button), clearly labeled as such in the Manual Test Cases sheet and in the Playwright Page Objects (`DashboardPage.ts`, `RecordsPage.ts`). They are structured to be quickly corrected once the environment is reachable.

---

## 6. Summary of Findings from Exploration

| # | Observation | Where documented |
|---|---|---|
| 1 | Login backend returns HTTP 500 for all credential combinations | BUG-001 |
| 2 | Registration backend returns HTTP 500 for all valid, novel submissions | BUG-002 |
| 3 | Login/Sign Up pages are not responsive at mobile widths (~412px) | BUG-003 |
| 4 | No "Forgot password" link on the login page | LOGIN-009 (manual test result, Low severity, QA Assumption on whether this is expected) |
| 5 | Sign Up's E-mail field uses `type="text"` rather than `type="email"` (Login uses `type="email"`) | Noted for consistency; not filed as a defect (both are functionally validated by JS regardless of input type) |
