const { chromium } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let loginStatus = null, loginBody = null;
  page.on('response', async (res) => {
    if (res.url().includes('/api/ai_dashboard/login')) {
      loginStatus = res.status();
      try { loginBody = await res.text(); } catch(e) { loginBody = 'unreadable'; }
    }
  });

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.locator('#Email').fill('test@gmail.com');
  await page.locator('#password').fill('12345');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(3000);

  console.log('LOGIN STATUS:', loginStatus);
  console.log('LOGIN BODY:', loginBody);
  console.log('FINAL URL:', page.url());
  const bodyText = await page.locator('body').innerText();
  console.log('VISIBLE TEXT:', bodyText);
  await page.screenshot({ path: path.join(OUT, '50_login_retry.png'), fullPage: true });
  await browser.close();
})();
