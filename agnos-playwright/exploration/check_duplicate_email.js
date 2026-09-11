const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let status = null, body = null;
  page.on('response', async (res) => {
    if (res.url().includes('create_user')) {
      status = res.status();
      try { body = await res.text(); } catch(e) {}
    }
  });

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle' });
  const inputs = page.locator('input');
  await inputs.nth(0).fill('test@gmail.com');
  await inputs.nth(1).fill('StrongPass@1');
  await inputs.nth(2).fill('StrongPass@1');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(3000);

  console.log('STATUS:', status);
  console.log('BODY:', body);
  const bodyText = await page.locator('body').innerText();
  console.log('VISIBLE:', bodyText.replace(/\s+/g,' '));
  await page.screenshot({ path: path.join(OUT, '90_duplicate_email_check.png'), fullPage: true });
  await browser.close();
})();
