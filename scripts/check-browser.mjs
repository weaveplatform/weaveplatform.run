import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {root, safePath, readYaml} from './lib.mjs';

const build = path.join(root, 'site/build');
const out = path.join(root, '.artifacts/site'); fs.mkdirSync(out, {recursive: true});
const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.wasm':'application/wasm','.woff2':'font/woff2','.pf_fragment':'application/octet-stream','.pf_index':'application/octet-stream','.pf_meta':'application/octet-stream'};
const server = http.createServer((request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    let p = safePath(decodeURIComponent(url.pathname).replace(/^\//, ''), build);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) {response.writeHead(404); response.end(); return;}
    response.setHeader('Content-Type', types[path.extname(p)] || 'application/octet-stream');
    fs.createReadStream(p).pipe(response);
  } catch {response.writeHead(400); response.end();}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  const executablePath = process.env.CHROME_BIN || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
  browser = await chromium.launch({headless: true, ...(executablePath ? {executablePath} : {})});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const internal = process.env.DOCS_AUDIENCE === 'internal';
  const routes = internal ? ['/','/docs/start-here/','/docs/platform/architecture/','/docs/reference/'] : ['/', '/docs/platform/architecture/', '/docs/products/guestweave/macos/', '/docs/products/guestweave/windows/', '/docs/products/hostweave/hld/', '/docs/products/imageweave/hld/', '/docs/products/agent-core/hld/', '/docs/products/agent-modules/hld/', '/docs/development/architecture/', '/docs/operations/publishing/'];
  const results = [];
  for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      const response = await page.goto(origin + route, {waitUntil:'networkidle'});
      assert.equal(response.status(), 200, `Route failed: ${route}`);
      assert(await page.locator('h1').count() > 0, `No page heading: ${route}`);
      const width = await page.evaluate(() => ({document:document.documentElement.scrollWidth, viewport:innerWidth}));
      assert(width.document <= width.viewport, `Horizontal overflow at ${route}: ${JSON.stringify(width)}`);
      results.push({route, viewport, status:'pass'});
    }
  }
  await page.setViewportSize({width:1440,height:900});
  await page.goto(origin + routes[0], {waitUntil:'networkidle'});
  for (const theme of ['dark','light']) {
    for (let attempts = 0; attempts < 3 && await page.getAttribute('html','data-theme') !== theme; attempts++) {
      await page.getByRole('button', {name:/Switch between dark and light mode/}).click();
    }
    assert.equal(await page.getAttribute('html','data-theme'), theme, 'Theme control did not change the reader theme');
    await page.screenshot({path:path.join(out, `home-${theme}.png`), fullPage:true, animations:'disabled'});
  }
  await page.goto(origin + '/search/', {waitUntil:'networkidle'});
  await page.getByRole('textbox').fill(internal ? 'evidence' : 'GuestWeave');
  await page.waitForSelector('.pagefind-ui__result');
  results.push({feature:'search', status:'pass'});
  if (!internal) {
    await page.goto(origin + '/docs/platform/architecture/', {waitUntil:'networkidle'});
    const frame = page.frameLocator('iframe[title="Platform context and execution boundaries"]');
    await frame.locator('svg[role="img"]').waitFor();
    assert(await page.locator('a[href="/diagrams/platform-context.html"]').count() > 0, 'Missing full-screen diagram link');
    results.push({feature:'embedded-diagram', status:'pass'});
  }
  for (const d of readYaml('diagrams/manifest.yaml').diagrams) {
    const r = await page.goto(origin + `/diagrams/${d.id}.html`, {waitUntil:'networkidle'});
    assert.equal(r.status(),200); await page.locator('svg[role="img"]').waitFor();
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
  fs.writeFileSync(path.join(out,'browser.json'), JSON.stringify({status:'pass', results, errors},null,2)+'\n');
  console.log(`Browser checks passed: ${results.length} route, search and embedding scenarios.`);
} finally {await browser?.close(); await new Promise(resolve => server.close(resolve));}
