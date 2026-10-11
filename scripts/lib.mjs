import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import YAML from 'yaml';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const readYaml = (p) => YAML.parse(fs.readFileSync(path.join(root, p), 'utf8'));
export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
export function safePath(relative, base = root) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) throw new Error(`Expected relative path: ${relative}`);
  const target = path.resolve(base, relative);
  if (target !== base && !target.startsWith(`${base}${path.sep}`)) throw new Error(`Path escapes repository: ${relative}`);
  return target;
}
export function filesIn(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const p = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not valid documentation inputs: ${p}`);
    return entry.isDirectory() ? filesIn(p) : [p];
  });
}
export function evidenceExists(ref, lock = readYaml('sources/sources.lock.yaml')) {
  const index = ref.indexOf(':');
  const source = ref.slice(0, index), file = ref.slice(index + 1);
  safePath(file);
  if (source === 'documentation') return fs.existsSync(safePath(file));
  return lock.sources.some(s => s.id === source && s.files.some(f => f.path === file));
}
