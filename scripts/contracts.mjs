import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root, readYaml, sha256, safePath} from './lib.mjs';
const out = path.join(root, 'static/contracts');
fs.mkdirSync(out, {recursive:true});
const names = new Set();
for (const source of readYaml('sources/sources.lock.yaml').sources) {
  for (const file of source.files.filter(f => f.snapshot)) {
    assert(source.visibility === 'public' || process.env.DOCS_AUDIENCE === 'internal', 'Private contract in public build');
    const bytes = fs.readFileSync(safePath(file.snapshot));
    assert.equal(sha256(bytes), file.sha256);
    const name = (source.visibility === 'private' ? source.id + '-' : '') + path.basename(file.path);
    assert(!names.has(name), `Contract filename collision: ${name}`); names.add(name);
    fs.writeFileSync(path.join(out, name), bytes);
  }
}
for (const name of fs.readdirSync(out)) if (!names.has(name)) fs.unlinkSync(path.join(out,name));
console.log(`Published ${names.size} verified contract snapshots to static assets.`);
