import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root, readYaml, sha256} from './lib.mjs';

function api(endpoint, {allowMissing = false} = {}) {
  const r = spawnSync('gh', ['api', endpoint], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  if (r.status !== 0 && allowMissing && r.stderr.includes('HTTP 404')) return undefined;
  if (r.status !== 0) throw new Error(`GitHub read failed for ${endpoint}: ${r.stderr.trim()}`);
  return JSON.parse(r.stdout);
}
const changed = [];
for (const source of readYaml('sources/sources.lock.yaml').sources) {
  if (source.visibility === 'private' && process.env.DOCS_AUDIENCE !== 'internal') continue;
  const commit = api(`repos/${source.repository}/commits/main`).sha;
  if (commit === source.revision) continue;
  const changes = [];
  for (const f of source.files) {
    try {
      const current = api(`repos/${source.repository}/contents/${f.path}?ref=${commit}`, {allowMissing:true});
      if (!current) {changes.push({path:f.path, previous_sha256:f.sha256, state:'removed'}); continue;}
      const digest = sha256(Buffer.from(current.content, 'base64'));
      if (digest !== f.sha256) changes.push({path: f.path, previous_sha256: f.sha256, current_sha256: digest});
    } catch (error) {throw new Error(`Unable to verify ${source.id}:${f.path}; refresh did not complete. ${error.message}`);}
  }
  if (changes.length) changed.push({id: source.id, repository: source.repository, baseline_revision: source.revision, current_revision: commit, changes});
}
const report = {schema_version: 1, instruction: 'Review affected claims and diagrams. This report does not update pins or verification status.', sources: changed};
if (process.argv.includes('--write') && changed.length) fs.writeFileSync(path.join(root, 'sources/drift.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
