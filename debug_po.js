const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  await page.goto('https://test.pharmacyplus.app/#/login');
  await page.locator('input[formcontrolname="UserName"]').fill('admin');
  await page.locator('input[formcontrolname="Password"]').fill('pharmacytest@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/mainmenugrid');

  await page.getByRole('button', { name: 'Netsoft 2' }).click();
  await page.getByText('Purchasing & Vendor Management', { exact: true }).click();
  await page.getByText('Purchase Order', { exact: true }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 });

  const vendorLabel = page.getByText('Vendor', { exact: true }).first();
  console.log('vendor label visible?', await vendorLabel.isVisible().catch(() => false));
  await vendorLabel.click();
  await page.waitForTimeout(2000);

  const searchBefore = await page.getByRole('textbox', { name: 'Search' }).count();
  console.log('textbox count=', searchBefore);

  const search = page.getByRole('textbox', { name: 'Search' }).first();
  console.log('search visible after click?', await search.isVisible().catch(() => false));

  if (await search.isVisible().catch(() => false)) {
    await search.fill('KALIUM DRUG STORE');
    const vendorOpt = page.getByText('KALIUM DRUG STORE', { exact: true }).first();
    console.log('option visible?', await vendorOpt.isVisible().catch(() => false));
    if (await vendorOpt.isVisible().catch(() => false)) await vendorOpt.click();
  }

  await page.screenshot({ path: 'debug_po.png', fullPage: true });
  await browser.close();
})();
