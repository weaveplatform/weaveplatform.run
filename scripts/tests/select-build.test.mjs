import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyBuild} from '../select-build.mjs';

const repository = 'weaveplatform/weaveplatform.dev';
const valid = {id:42,name:'Documentation quality gate',path:'.github/workflows/quality-gate.yml',status:'completed',conclusion:'success',event:'push',head_branch:'main',repository:{full_name:repository},head_repository:{full_name:repository},head_sha:'a'.repeat(40)};

test('a successful main quality build supplies its exact commit and run', () => {
  assert.deepEqual(verifyBuild(valid,repository,'42'),{commit:'a'.repeat(40),run:'42'});
});
test('fork, PR, failed and unrelated workflow builds cannot be promoted', () => {
  for (const mutation of [{head_repository:{full_name:'someone/fork'}},{event:'pull_request'},{conclusion:'failure'},{path:'.github/workflows/other.yml'},{head_branch:'development'},{id:43}]) {
    assert.throws(() => verifyBuild({...valid,...mutation},repository,'42'));
  }
});
