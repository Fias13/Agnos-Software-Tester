const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let responseBody = null;
  let requestPayload = null;
  page.on('requestfinished', async (req) => {
    if (req.url().includes('create_user')) {
      requestPayload = req.postData();
    }
  });
  page.on('response', async (res) => {
    if (res.url().includes('create_user')) {
      try { responseBody = await res.text(); } catch(e) { responseBody = 'unreadable: ' + e.message; }
      console.log('STATUS:', res.status());
    }
  });

  const email = `agnos.qa.retry.${Date.now()}@gmail.com`;
  const pw = 'Retry@5678';
  console.log('Using email:', email);

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill(email);
  await inputs.nth(1).fill(pw);
  await inputs.nth(2).fill(pw);
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(4000);

  console.log('REQUEST PAYLOAD:', requestPayload);
  console.log('RESPONSE BODY:', responseBody);

  // check for any visible toast/error/success message
  const bodyText = await page.locator('body').innerText();
  console.log('VISIBLE BODY TEXT:', bodyText);
  console.log('FINAL URL:', page.url());

  await page.screenshot({ path: path.join(OUT, '40_retry_signup_final.png'), fullPage: true });
  await browser.close();
})();
