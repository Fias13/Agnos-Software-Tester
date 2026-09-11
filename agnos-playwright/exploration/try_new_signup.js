const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('response', res => { if (res.status() >= 400 && !res.url().includes('sentry')) console.log('HTTP', res.status(), res.url()); });

  const email = `agnos.qa.test.${Date.now()}@gmail.com`;
  const pw = 'Test@1234';
  console.log('Using email:', email);

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill(email);
  await inputs.nth(1).fill(pw);
  await inputs.nth(2).fill(pw);
  await page.screenshot({ path: path.join(OUT, '30_new_signup_filled.png') });
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT, '31_new_signup_result.png'), fullPage: true });
  console.log('URL after new signup attempt:', page.url());
  const bodyText = await page.locator('body').innerText();
  console.log('BODY TEXT SNIPPET:', bodyText.slice(0, 800));
  await browser.close();
})();
