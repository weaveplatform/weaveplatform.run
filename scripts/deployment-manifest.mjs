import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root, readYaml, sha256} from './lib.mjs';
assert(/^[a-f0-9]{40}$/.test(process.env.DOCS_COMMIT || ''), 'An exact build commit is required');
const lock = fs.readFileSync(path.join(root, 'sources/sources.lock.yaml'));
fs.writeFileSync(path.join(root, 'site/build/deployment.json'), JSON.stringify({
  schema_version: 1,
  documentation_commit: process.env.DOCS_COMMIT,
  build_run: process.env.DOCS_RUN,
  sources_lock_sha256: sha256(lock),
  source_revisions: readYaml('sources/sources.lock.yaml').sources.map(s => ({id:s.id,revision:s.revision})),
}, null, 2) + '\n');
