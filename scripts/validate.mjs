import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import matter from 'gray-matter';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {root, readYaml, sha256, safePath, filesIn, evidenceExists} from './lib.mjs';

const ajv = new Ajv({allErrors: true}); addFormats(ajv);
const pageSchema = JSON.parse(fs.readFileSync(path.join(root, 'packages/docs-kit/schemas/page.schema.json')));
const validatePage = ajv.compile(pageSchema);
const lock = readYaml('sources/sources.lock.yaml');
const diagrams = readYaml('diagrams/manifest.yaml').diagrams;
const ids = new Set();
const snapshots = new Set();
for (const s of lock.sources) {
  assert(!ids.has(s.id), `Duplicate source ${s.id}`); ids.add(s.id);
  assert(/^[a-f0-9]{40}$/.test(s.revision), `Unpinned source ${s.id}`);
  assert(/^weaveplatform\/[A-Za-z0-9_.-]+$/.test(s.repository), `Invalid repository ${s.repository}`);
  assert(['public', 'private'].includes(s.visibility), `Invalid visibility ${s.id}`);
  for (const f of s.files) {
    safePath(f.path);
    assert(/^[a-f0-9]{64}$/.test(f.sha256), `Missing checksum ${s.id}:${f.path}`);
    if (f.snapshot) {
      assert(!snapshots.has(f.snapshot), `Duplicate contract snapshot ${f.snapshot}`); snapshots.add(f.snapshot);
      assert(process.env.DOCS_AUDIENCE === 'internal' || s.visibility === 'public', `Private snapshot cannot enter the public build: ${s.id}`);
      assert(f.snapshot.startsWith('sources/contracts/'), `Invalid snapshot location ${f.snapshot}`);
      assert.equal(sha256(fs.readFileSync(safePath(f.snapshot))), f.sha256, `Contract snapshot drift: ${f.snapshot}`);
    }
  }
}
for (const file of filesIn(path.join(root, 'sources/contracts'))) {
  assert(snapshots.has(path.relative(root, file)), `Unregistered contract snapshot: ${file}`);
}
const upstreamPath = path.join(root, 'packages/docs-kit/UPSTREAM.json');
if (fs.existsSync(upstreamPath)) {
  const upstream = JSON.parse(fs.readFileSync(upstreamPath));
  assert.equal(upstream.repository, 'weaveplatform/weaveplatform.run');
  for (const [file, digest] of Object.entries(upstream.files)) {
    assert.equal(sha256(fs.readFileSync(safePath(file, path.dirname(upstreamPath)))), digest, `Shared docs-kit changed: ${file}`);
  }
  for (const file of filesIn(path.dirname(upstreamPath)).filter(f => f !== upstreamPath)) {
    assert(Object.hasOwn(upstream.files, path.relative(path.dirname(upstreamPath), file)), `Unregistered shared docs-kit file: ${file}`);
  }
}
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'tools/archify/PROVENANCE.json')));
for (const [file, digest] of Object.entries(provenance.files)) {
  assert.equal(sha256(fs.readFileSync(safePath(file, path.join(root, 'tools/archify')))), digest, `Archify bundle changed: ${file}`);
}
const diagramIds = new Set();
for (const d of diagrams) {
  assert(/^[a-z][a-z0-9-]+$/.test(d.id) && !diagramIds.has(d.id), `Invalid or duplicate diagram ${d.id}`); diagramIds.add(d.id);
  assert.equal(d.audience, process.env.DOCS_AUDIENCE === 'internal' ? 'internal' : 'public', `Diagram audience mismatch: ${d.id}`);
  const spec = JSON.parse(fs.readFileSync(safePath(d.source)));
  assert.equal(spec.diagram_type, d.type);
  assert.equal(spec.meta.quality_profile, 'showcase');
  assert(!spec.meta.animation || spec.meta.animation === 'none', `Motion needs explicit editorial approval: ${d.id}`);
  assert(d.evidence.length > 0 && d.evidence.every(ref => evidenceExists(ref, lock)), `Missing evidence for ${d.id}`);
}
let pageCount = 0;
for (const file of filesIn(path.join(root, 'docs')).filter(f => /\.mdx?$/.test(f))) {
  const {data, content} = matter(fs.readFileSync(file, 'utf8'));
  assert(validatePage(data), `${path.relative(root, file)}: ${ajv.errorsText(validatePage.errors)}`);
  assert(data.status !== 'draft', `Draft page is in the published content tree: ${file}`);
  assert(data.evidence.every(ref => evidenceExists(ref, lock)), `Unresolved evidence in ${file}`);
  for (const [, id] of content.matchAll(/<Diagram\s+id="([^"]+)"/g)) assert(diagramIds.has(id), `Unknown diagram ${id} in ${file}`);
  pageCount++;
}
console.log(`Validated ${pageCount} pages, ${diagrams.length} diagrams, ${lock.sources.length} pinned sources and the Archify bundle.`);
