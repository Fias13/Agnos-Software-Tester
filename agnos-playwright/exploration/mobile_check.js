const { chromium, devices } = require('@playwright/test');
const path = require('path');
const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await context.newPage();

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, '95_mobile_login_clean.png') });

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, '96_mobile_signup_clean.png') });

  console.log('Viewport:', page.viewportSize());
  await browser.close();
})();
