import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const base = new URL('../assets/hdl/', import.meta.url);
const lock = JSON.parse(await readFile(new URL('toolchain.lock.json', base), 'utf8'));
for (const [name, entry] of Object.entries(lock.files)) {
  assert.match(name, /^(icarus|yosys|ghdl|nvc)\/[A-Za-z0-9_.-]+$/);
  const data = await readFile(new URL(name, base));
  assert.equal(data.length, entry.bytes, name + ' size');
  assert.equal(createHash('sha256').update(data).digest('hex'), entry.sha256, name + ' SHA-256');
}
for (const folder of ['icarus', 'yosys', 'ghdl', 'nvc'])
  for (const name of await readdir(new URL(folder + '/', base))) {
    if (name === 'COPYING' || name === 'NOTICE.md') continue;
    assert.ok(lock.files[folder + '/' + name], 'Unpinned tool asset: ' + folder + '/' + name);
  }
if (lock.nvc?.reproducibleBuildVerified === true) {
  const source = new URL('./hdl/nvc-browser/', import.meta.url);
  const sourceLock = JSON.parse(await readFile(new URL('sources.lock.json', source), 'utf8'));
  const proof = JSON.parse(await readFile(new URL('reproduction.json', source), 'utf8'));
  assert.equal(sourceLock.reproducibleBuildVerified, true, 'NVC source reproduction status');
  assert.deepEqual(proof.sourceInputs.archivesSHA256, sourceLock.downloadsSHA256, 'NVC reproduction archive pins changed');
  assert.deepEqual(proof.sourceInputs.emsdk, sourceLock.emsdk, 'NVC reproduction SDK pins changed');
  for (const name of ['nvc.mjs', 'nvc.wasm', 'libraries.tar.gz']) assert.deepEqual(proof.artifacts[name], lock.files['nvc/' + name], 'Stale NVC reproduction evidence: ' + name);
  for (const [name, sha256] of Object.entries(proof.sourceInputs.archivesSHA256)) {
    assert.match(name, /^[A-Za-z0-9_.-]+\.tar\.gz$/);
    assert.equal(
      createHash('sha256')
        .update(await readFile(new URL('sources/' + name, source)))
        .digest('hex'),
      sha256,
      'NVC source archive: ' + name,
    );
  }
  for (const name of ['build.sh', 'prepare.py', 'pack-libraries.py', 'gen_wasm_symtab.sh', 'libffi_stub.c', 'release-wasm.patch'])
    assert.equal(
      createHash('sha256')
        .update(await readFile(new URL(name, source)))
        .digest('hex'),
      proof.sourceInputs.recipeSHA256[name],
      'Stale NVC reproduction recipe: ' + name,
    );
}
if (lock.icarus?.reproducibleBuildVerified === true) {
  const source = new URL('./hdl/icarus-browser/', import.meta.url);
  const sourceLock = JSON.parse(await readFile(new URL('sources.lock.json', source), 'utf8'));
  const proof = JSON.parse(await readFile(new URL('reproduction.json', source), 'utf8'));
  assert.equal(sourceLock.reproducibleBuildVerified, true, 'Icarus source reproduction status');
  assert.deepEqual(proof.sourceInputs.inputsSHA256, sourceLock.inputsSHA256, 'Icarus source/bootstrap pins changed');
  assert.deepEqual(proof.sourceInputs.emsdk, sourceLock.emsdk, 'Icarus reproduction SDK pins changed');
  assert.deepEqual(proof.sourceInputs.zlib, sourceLock.zlib, 'Icarus zlib port pins changed');
  const zlib = await readFile(new URL('./hdl/nvc-browser/sources/zlib-1.3.2.tar.gz', import.meta.url));
  assert.equal(createHash('sha256').update(zlib).digest('hex'), sourceLock.zlib.archiveSHA256, 'Icarus corresponding zlib source');
  assert.equal(createHash('sha512').update(zlib).digest('hex'), sourceLock.zlib.emscriptenPortSHA512, 'Icarus SDK port zlib source');
  for (const tool of ['ivlpp', 'ivl', 'vvp'])
    for (const extension of ['js', 'wasm']) {
      const name = tool + '.' + extension;
      assert.deepEqual(proof.artifacts[name], lock.files['icarus/' + name], 'Stale Icarus reproduction evidence: ' + name);
    }
  for (const name of [
    'sources/iverilog-c7530db.tar.gz',
    'browser.patch',
    'bootstrap/configure',
    'bootstrap/lexor_keyword.cc',
    'bootstrap/vhdlpp/lexor_keyword.cc',
    'prepare.py',
    'build.sh',
    'RUNTIME-LICENSES.txt',
    'compare-builds.py',
  ])
    assert.equal(
      createHash('sha256')
        .update(await readFile(new URL(name, source)))
        .digest('hex'),
      proof.sourceInputs.inputsSHA256[name],
      'Stale Icarus reproduction input: ' + name,
    );
}
console.log(`Verified ${Object.keys(lock.files).length} pinned HDL assets. Source reproduction gates are checked separately by verify:hdl:release.`);
