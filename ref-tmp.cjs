const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('https://chuticoxsbazar.com.bd/ownership', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3000);
  console.log(await p.evaluate(() => document.body.innerText));
  await p.screenshot({ path: process.argv[2] + '/ref-full.png', fullPage: true });
  await b.close();
})();
