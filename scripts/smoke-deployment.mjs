import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root, readYaml, sha256} from './lib.mjs';

const canonical = new URL(process.env.DOCS_CANONICAL_URL || '');
assert.equal(canonical.protocol, 'https:');
const internal = process.env.DOCS_AUDIENCE === 'internal';
const origins = [canonical.origin];
if (internal) {
  assert(/^[a-z0-9-]+$/.test(process.env.DOCS_PAGES_PROJECT || ''), 'Internal smoke requires DOCS_PAGES_PROJECT');
  origins.push(`https://${process.env.DOCS_PAGES_PROJECT}.pages.dev`);
  // Supply deployed preview/hash URLs when exercising the wildcard Access application.
  for (const value of JSON.parse(process.env.DOCS_PREVIEW_URLS || '[]')) {
    const url = new URL(value);
    assert(url.protocol === 'https:' && url.hostname.endsWith(`.${process.env.DOCS_PAGES_PROJECT}.pages.dev`), 'Unexpected preview hostname');
    origins.push(url.origin);
  }
  assert(process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET, 'Internal smoke requires an Access service token');
}
const headers = internal ? {'CF-Access-Client-Id':process.env.CF_ACCESS_CLIENT_ID, 'CF-Access-Client-Secret':process.env.CF_ACCESS_CLIENT_SECRET} : {};
const diagrams = readYaml('diagrams/manifest.yaml').diagrams;
const commonPaths = ['/', '/docs/start-here/', '/search/', '/pagefind/pagefind.js', '/img/weave.svg', '/deployment.json', ...diagrams.map(d => `/diagrams/${d.id}.html`)];
for (const origin of new Set(origins)) {
  const paths = new Set(commonPaths);
  for (const pathname of paths) {
    const url = new URL(pathname, origin);
    const anonymous = await fetch(url, {redirect:'manual', signal:AbortSignal.timeout(30000)});
    if (internal) {
      const location = anonymous.headers.get('location') || '';
      assert([401,403].includes(anonymous.status) || ([302,303,307].includes(anonymous.status) && /cloudflareaccess\.com|\/cdn-cgi\/access\//.test(location)), `Internal asset is not protected: ${url} (${anonymous.status})`);
    } else assert.equal(anonymous.status,200,`Public smoke failed: ${url}`);
    const response = internal ? await fetch(url, {headers,redirect:'manual',signal:AbortSignal.timeout(30000)}) : anonymous;
    assert.equal(response.status,200, `Reader check failed: ${url}`);
    if (pathname === '/') {
      const html = await response.text();
      for (const [, asset] of html.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:js|css))(?:[?#][^"]*)?"/g)) paths.add(asset);
    } else if (pathname === '/deployment.json') {
      const manifest = await response.json();
      assert.equal(manifest.sources_lock_sha256, sha256(fs.readFileSync(path.join(root,'sources/sources.lock.yaml'))), 'Deployed source lock does not match this checkout');
      if (process.env.DOCS_COMMIT) assert.equal(manifest.documentation_commit, process.env.DOCS_COMMIT, 'Deployed documentation commit does not match the verified build');
    }
  }
}
console.log(`${internal ? 'Internal Access and authenticated-reader' : 'Public'} deployment checks passed for ${origins.length} hostnames.`);
