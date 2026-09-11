const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

async function state(page, label) {
  const btn = page.getByRole('button', { name: /confirm|sign in/i });
  const disabled = await btn.isDisabled().catch(() => 'n/a');
  const errTexts = await page.locator('body').innerText();
  console.log(`\n-- ${label} -- button disabled: ${disabled}`);
  return errTexts;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // ===== SIGNUP VALIDATIONS =====
  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle' });
  const inputs = page.locator('input');

  // 1. All empty - button state
  await state(page, 'signup: all empty');
  await page.screenshot({ path: path.join(OUT, '60_signup_empty.png') });

  // 2. Invalid email format
  await inputs.nth(0).fill('not-an-email');
  await inputs.nth(1).fill('Valid@1234');
  await inputs.nth(2).fill('Valid@1234');
  await inputs.nth(0).blur();
  await page.waitForTimeout(300);
  const t2 = await state(page, 'signup: invalid email format');
  await page.screenshot({ path: path.join(OUT, '61_signup_invalid_email.png') });
  console.log(t2.includes('email') ? 'Body mentions "email"' : 'No email-related text found');

  // 3. Password mismatch
  await inputs.nth(0).fill('valid.qa@gmail.com');
  await inputs.nth(1).fill('Valid@1234');
  await inputs.nth(2).fill('Different@123');
  await inputs.nth(2).blur();
  await page.waitForTimeout(300);
  await state(page, 'signup: password mismatch');
  await page.screenshot({ path: path.join(OUT, '62_signup_pw_mismatch.png') });

  // 4. Weak password (too short)
  await inputs.nth(1).fill('abc');
  await inputs.nth(2).fill('abc');
  await inputs.nth(1).blur();
  await page.waitForTimeout(300);
  await state(page, 'signup: weak short password');
  await page.screenshot({ path: path.join(OUT, '63_signup_weak_pw.png') });

  // 5. Valid everything - button should enable
  await inputs.nth(0).fill('valid.qa@gmail.com');
  await inputs.nth(1).fill('Valid@1234');
  await inputs.nth(2).fill('Valid@1234');
  await inputs.nth(2).blur();
  await page.waitForTimeout(300);
  await state(page, 'signup: all valid');
  await page.screenshot({ path: path.join(OUT, '64_signup_all_valid.png') });

  // ===== LOGIN VALIDATIONS =====
  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/login', { waitUntil: 'networkidle' });
  await state(page, 'login: empty');
  await page.screenshot({ path: path.join(OUT, '70_login_empty.png') });

  await page.locator('#Email').fill('test@gmail.com');
  await state(page, 'login: only email filled');
  await page.screenshot({ path: path.join(OUT, '71_login_only_email.png') });

  await page.locator('#password').fill('somepassword');
  await state(page, 'login: email + password filled');
  await page.screenshot({ path: path.join(OUT, '72_login_both_filled.png') });

  // password show/hide toggle
  const toggle = page.locator('button, svg, span').filter({ hasText: '' });
  await browser.close();
})();
