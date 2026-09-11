const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

async function trySubmit(page, label, email, pw, confirmPw) {
  let apiCalled = false;
  const handler = (req) => { if (req.url().includes('create_user')) apiCalled = true; };
  page.on('request', handler);

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle' });
  const inputs = page.locator('input');
  await inputs.nth(0).fill(email);
  await inputs.nth(1).fill(pw);
  await inputs.nth(2).fill(confirmPw);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(1500);
  const bodyText = await page.locator('body').innerText();
  console.log(`\n--- ${label} ---`);
  console.log('API create_user called:', apiCalled);
  console.log('Body text:', bodyText.replace(/\s+/g, ' '));
  await page.screenshot({ path: path.join(OUT, `80_${label.replace(/\s+/g,'_')}.png`) });
  page.off('request', handler);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await trySubmit(page, 'invalid email submit', 'not-an-email', 'Valid@1234', 'Valid@1234');
  await trySubmit(page, 'password mismatch submit', 'qa.mismatch@gmail.com', 'Valid@1234', 'Different@99');
  await trySubmit(page, 'weak password submit', 'qa.weak@gmail.com', 'abc', 'abc');

  await browser.close();
})();
