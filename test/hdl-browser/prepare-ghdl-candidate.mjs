// Prepare only the candidate host binding, keeping production assets untouched.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
if (!process.argv[2]) throw new Error('Usage: node test/hdl-browser/prepare-ghdl-candidate.mjs <candidate-directory>');
const candidate = path.resolve(root, process.argv[2]);
if (!candidate.startsWith(path.resolve(root) + path.sep)) throw new Error('Candidate must be inside the workspace');
let frontend = await readFile(new URL('../../assets/hdl/ghdl/frontend.mjs', import.meta.url), 'utf8');
for (const name of ['ghdl-synth.wasm', 'libraries.tar.gz']) {
  const hash = createHash('sha256')
    .update(await readFile(path.join(candidate, name)))
    .digest('hex');
  const needle = new RegExp(`verifiedBytes\\('${name.replaceAll('.', '\\.')}', '[a-f0-9]{64}'\\)`);
  if (!needle.test(frontend)) throw new Error(`Missing integrity binding for ${name}`);
  frontend = frontend.replace(needle, `verifiedBytes('${name}', '${hash}')`);
  console.log(`${name}: ${hash}`);
}
await writeFile(path.join(candidate, 'frontend.mjs'), frontend);
console.log('Candidate bindings prepared. Production assets and distribution were not changed.');
