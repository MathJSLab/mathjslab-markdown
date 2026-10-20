import { readFile } from 'node:fs/promises';
import './verify-hdl-assets.mjs';

// Local builds and package inspection remain possible while release gates are
// unresolved. Publication must fail before any registry operation is attempted.
const lock = JSON.parse(await readFile(new URL('../assets/hdl/toolchain.lock.json', import.meta.url), 'utf8'));
const blockers = [];
if (lock.icarus?.correspondingSourceVerified !== true) blockers.push('Icarus: complete corresponding port sources, patches, SDK and build recipe are unverified.');
for (const name of ['icarus', 'ghdl', 'nvc']) {
  if (lock[name]?.reproducibleBuildVerified !== true) blockers.push(`${name}: independent reproducible source build is unverified.`);
}
if (blockers.length) {
  console.error('HDL publication blocked:\n' + blockers.map((message) => '- ' + message).join('\n'));
  console.error('See doc/hdl-vhdl-progress.md. Asset hashes alone do not satisfy these gates.');
  process.exitCode = 1;
} else {
  console.log('HDL source and reproducibility publication gates passed.');
}
