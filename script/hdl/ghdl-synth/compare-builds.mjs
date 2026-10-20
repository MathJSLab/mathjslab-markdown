import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [first, second, report] = process.argv.slice(2);
if (!first || !second || !report) {
  console.error('Usage: compare-builds.mjs <first directory> <second directory> <report.json>');
  process.exit(2);
}
const files = ['ghdl-synth.wasm', 'libraries.tar.gz'].map((name) => {
  const hash = (dir) =>
    createHash('sha256')
      .update(readFileSync(join(dir, name)))
      .digest('hex');
  const a = hash(first);
  const b = hash(second);
  return { name, first: a, second: b, identical: a === b };
});
const identical = files.every((file) => file.identical);
writeFileSync(
  report,
  JSON.stringify({ identical, files, scope: 'Two clean caches in the same recorded Linux container image; not cross-host reproducibility or browser validation.' }, null, 2) + '\n',
);
console.log(JSON.stringify({ identical, files }, null, 2));
process.exitCode = identical ? 0 : 1;
