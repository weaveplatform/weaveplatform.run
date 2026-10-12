import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {root, readYaml, safePath} from './lib.mjs';

const tool = path.join(root, 'tools/archify/bin/archify.mjs');
const output = path.join(root, 'static/diagrams');
const artifacts = path.join(root, '.artifacts/diagrams');
fs.mkdirSync(output, {recursive: true}); fs.mkdirSync(artifacts, {recursive: true});
function run(args) {
  const r = spawnSync(process.execPath, [tool, ...args, '--json'], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  if (r.status !== 0) throw new Error(`${args[0]} failed (${r.status}): ${r.stdout}\n${r.stderr}`);
  return JSON.parse(r.stdout);
}
const onlyIndex = process.argv.indexOf('--only');
const selected = onlyIndex === -1 ? undefined : process.argv[onlyIndex + 1];
assert(onlyIndex === -1 || selected, '--only requires a diagram ID');
const diagrams = readYaml('diagrams/manifest.yaml').diagrams;
assert(!selected || diagrams.some(d => d.id === selected), `Unknown diagram: ${selected}`);
for (const d of diagrams.filter(d => !selected || d.id === selected)) {
  const spec = safePath(d.source);
  const v = run(['validate', d.type, spec, '--quality', 'showcase']);
  assert(v.ok && v.checks.length === 9 && v.composition.summary.errors === 0 && v.composition.summary.warnings === 0, `Incomplete showcase validation: ${d.id}`);
  const html = path.join(output, `${d.id}.html`);
  const receipt = run(['deliver', d.type, spec, html, '--quality', 'showcase']);
  fs.writeFileSync(path.join(artifacts, `${d.id}.delivery.json`), JSON.stringify(receipt, null, 2) + '\n');
  if (process.argv.includes('--visual')) {
    try {
      const browser = run(['visual-check', html]);
      fs.writeFileSync(path.join(artifacts, `${d.id}.browser.json`), JSON.stringify(browser, null, 2) + '\n');
    } finally {
      for (const filename of fs.readdirSync(output)) {
        if (filename.startsWith(`${d.id}.`) && filename !== `${d.id}.html`) fs.renameSync(path.join(output, filename), path.join(artifacts, filename));
      }
    }
  }
  console.log(`${d.id}: 9/9 showcase checks; deterministic delivery passed${process.argv.includes('--visual') ? '; browser evidence collected' : ''}.`);
}
