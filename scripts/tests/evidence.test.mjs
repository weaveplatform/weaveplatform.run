import test from 'node:test';
import assert from 'node:assert/strict';
import {safePath, evidenceExists} from '../lib.mjs';

test('untrusted evidence paths cannot escape the repository', () => {
  for (const p of ['../secret', '/etc/passwd', 'sources/../../secret']) assert.throws(() => safePath(p));
  assert.doesNotThrow(() => safePath('sources/contracts/protocol.proto'));
});
test('an evidence claim must identify a file at the recorded source', () => {
  const lock = {sources: [{id: 'core', files: [{path: 'proto/module.proto'}]}]};
  assert.equal(evidenceExists('core:proto/module.proto', lock), true);
  assert.equal(evidenceExists('core:proto/invented.proto', lock), false);
  assert.equal(evidenceExists('other:proto/module.proto', lock), false);
  assert.throws(() => evidenceExists('core:../secret', lock));
});
