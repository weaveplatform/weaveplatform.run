import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root, filesIn, safePath} from './lib.mjs';
const build = path.join(root, 'site/build');
let checked = 0;
for (const file of filesIn(build).filter(p => p.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
    if (/^(?:https?:|data:|mailto:|tel:|\/\/)/.test(raw)) continue;
    const url = decodeURIComponent(raw);
    const target = url.startsWith('/') ? safePath(url.slice(1), build) : path.resolve(path.dirname(file), url);
    if (!target.startsWith(build + path.sep) && target !== build) throw new Error(`Link escapes build: ${file}: ${raw}`);
    assert(fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html')), `Broken asset or route in ${path.relative(build, file)}: ${raw}`);
    checked++;
  }
}
console.log(`Checked ${checked} local links and assets in the static build.`);
