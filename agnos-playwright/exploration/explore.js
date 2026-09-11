// One-off exploration script (NOT part of the automation suite).
// Purpose: capture real DOM structure + screenshots of the live app so
// test cases are based on actually-observed UI, not assumptions.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname);
const log = [];
function record(label, data) {
  log.push(`\n===== ${label} =====\n${data}`);
  console.log(`\n===== ${label} =====\n${data}`);
}

async function dumpPage(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true }).catch(e => record(`${name} screenshot error`, e.message));
  const url = page.url();
  const title = await page.title().catch(() => 'N/A');
  record(`${name} - URL/Title`, `URL: ${url}\nTitle: ${title}`);

  // Inputs
  const inputs = await page.locator('input').evaluateAll(els => els.map(e => ({
    type: e.type, name: e.name, id: e.id, placeholder: e.placeholder,
    ariaLabel: e.getAttribute('aria-label'), testId: e.getAttribute('data-testid'), required: e.required,
  })));
  record(`${name} - inputs`, JSON.stringify(inputs, null, 2));

  // Buttons / links
  const buttons = await page.locator('button, [role=button], a').evaluateAll(els => els.slice(0, 60).map(e => ({
    tag: e.tagName, text: e.innerText?.trim().slice(0, 60), type: e.type, href: e.getAttribute('href'),
    testId: e.getAttribute('data-testid'),
  })));
  record(`${name} - buttons/links`, JSON.stringify(buttons, null, 2));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', msg => record(`console[${msg.type()}]`, msg.text()));
  page.on('pageerror', err => record('pageerror', err.message));
  page.on('response', res => {
    if (res.status() >= 400) record('HTTP error', `${res.status()} ${res.url()}`);
  });

  try {
    await page.goto('https://dev.app.agnoshealth.com/ai_dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    record('goto /ai_dashboard error', e.message);
  }
  await page.waitForTimeout(2000);
  await dumpPage(page, '01_login_page');

  try {
    await page.goto('https://dev.app.agnoshealth.com/ai_dashboard/agnos/sign_up', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    record('goto sign_up error', e.message);
  }
  await page.waitForTimeout(2000);
  await dumpPage(page, '02_signup_page');

  // Try root domain too
  try {
    await page.goto('https://dev.app.agnoshealth.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await dumpPage(page, '03_root_domain');
  } catch (e) {
    record('goto root error', e.message);
  }

  fs.writeFileSync(path.join(OUT, 'exploration_log.txt'), log.join('\n'));
  await browser.close();
})();
