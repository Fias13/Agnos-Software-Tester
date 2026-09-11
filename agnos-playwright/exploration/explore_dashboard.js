// One-off exploration script (NOT part of the automation suite).
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const log = [];
function record(label, data) {
  const s = `\n===== ${label} =====\n${data}`;
  log.push(s);
  console.log(s);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  page.on('response', res => { if (res.status() >= 400 && !res.url().includes('sentry')) record('HTTP error', `${res.status()} ${res.url()}`); });
  page.on('pageerror', err => record('pageerror', err.message));

  await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  await page.locator('#Email').fill('test@gmail.com');
  await page.locator('#password').fill('12345');
  await page.screenshot({ path: path.join(OUT, '10_login_filled.png') });
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT, '11_after_login.png'), fullPage: true }).catch(()=>{});
  record('After login URL', page.url());

  // Try to wait for dashboard content
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, '12_dashboard.png'), fullPage: true }).catch(()=>{});
  record('Dashboard URL', page.url());

  // Capture nav elements
  const navItems = await page.locator('nav a, nav button, [role=tab], aside a, aside button').evaluateAll(els => els.slice(0,80).map(e => ({
    tag: e.tagName, text: e.innerText?.trim().slice(0,60), href: e.getAttribute('href')
  })));
  record('Nav items', JSON.stringify(navItems, null, 2));

  // Capture all visible text buttons/links on dashboard
  const buttons = await page.locator('button, a').evaluateAll(els => els.slice(0,150).map(e => ({
    tag: e.tagName, text: e.innerText?.trim().slice(0,60), href: e.getAttribute('href')
  })).filter(b => b.text));
  record('All buttons/links on dashboard', JSON.stringify(buttons, null, 2));

  fs.writeFileSync(path.join(OUT, 'dashboard_log.txt'), log.join('\n'));

  // Save storage state for reuse
  await context.storageState({ path: path.join(OUT, 'auth_state.json') });

  await browser.close();
})();
