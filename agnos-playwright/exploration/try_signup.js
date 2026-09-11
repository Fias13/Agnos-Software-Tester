const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('response', res => { if (res.status() >= 400 && !res.url().includes('sentry')) console.log('HTTP', res.status(), res.url()); });

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('test@gmail.com');
  await inputs.nth(1).fill('12345');
  await inputs.nth(2).fill('12345');
  await page.screenshot({ path: path.join(OUT, '20_signup_existing_filled.png') });
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, '21_signup_existing_result.png'), fullPage: true });
  console.log('URL after signup attempt:', page.url());
  const bodyText = await page.locator('body').innerText();
  console.log('BODY TEXT SNIPPET:', bodyText.slice(0, 500));
  await browser.close();
})();
