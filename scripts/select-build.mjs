import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export function verifyBuild(run, repository, runId) {
  assert.equal(String(run.id), String(runId), 'Unexpected build run');
  assert.equal(run.name, 'Documentation quality gate', 'Build is not the documentation quality workflow');
  assert.equal(run.path, '.github/workflows/quality-gate.yml', 'Unexpected build workflow path');
  assert.equal(run.status, 'completed', 'Build is not complete');
  assert.equal(run.conclusion, 'success', 'Build did not pass');
  assert.equal(run.event, 'push', 'Only a main push build can be released');
  assert.equal(run.head_branch, 'main', 'Build did not run on main');
  assert.equal(run.repository.full_name, repository, 'Build belongs to a different repository');
  assert.equal(run.head_repository.full_name, repository, 'Build came from a different repository');
  assert(/^[a-f0-9]{40}$/.test(run.head_sha), 'Build commit is not exact');
  return {commit:run.head_sha, run:String(run.id)};
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const id = process.env.DOCS_BUILD_RUN || '';
  const repository = process.env.GITHUB_REPOSITORY || '';
  assert(/^\d+$/.test(id), 'An exact quality-gate run ID is required');
  assert(/^weaveplatform\/[A-Za-z0-9_.-]+$/.test(repository), 'Unexpected repository');
  const response = spawnSync('gh', ['api', `repos/${repository}/actions/runs/${id}`], {encoding:'utf8'});
  assert.equal(response.status,0,'Unable to inspect the selected build');
  const result = verifyBuild(JSON.parse(response.stdout),repository,id);
  assert(process.env.GITHUB_OUTPUT, 'GITHUB_OUTPUT is required');
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`commit=${result.commit}\nrun=${result.run}\n`);
  console.log(`Selected successful main build ${result.run} at ${result.commit}.`);
}
