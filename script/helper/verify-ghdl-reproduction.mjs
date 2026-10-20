import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const ghdlRecipeFiles = [
  'Dockerfile',
  'build-packages.lock',
  'build-debs.sha256',
  'build.sh',
  'build-in-container.sh',
  'pack-libraries.py',
  'blackbox-verilog.patch',
  'grt-stdio.patch',
  'grt-stdio.adb',
  'bug.adb',
  'synth_api.adb',
  'synth_api.ads',
];

export async function verifyGHDLReproduction(lock, source) {
  const parse = async (name) => JSON.parse(await readFile(new URL(name, source), 'utf8'));
  const inputs = await parse('sources.lock.json');
  const proof = await parse('reproduction.json');
  assert.equal(inputs.reproducibleBuildVerified, true, 'GHDL source reproduction status');
  assert.deepEqual(proof.sourceInputs.toolchain, inputs, 'Stale GHDL toolchain pins');
  assert.deepEqual(Object.keys(proof.sourceInputs.recipeSHA256).sort(), [...ghdlRecipeFiles].sort(), 'Missing GHDL recipe hash');
  for (const name of ghdlRecipeFiles) {
    const bytes = await readFile(new URL(name, source));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), proof.sourceInputs.recipeSHA256[name], 'Stale GHDL recipe: ' + name);
  }
  const dockerfile = await readFile(new URL('Dockerfile', source), 'utf8');
  assert.ok(dockerfile.includes(inputs.environment.baseImage), 'GHDL base image differs from lock');
  assert.ok(dockerfile.includes('sha256sum --check'), 'GHDL build must check downloaded package hashes');
  const packages = (await readFile(new URL('build-packages.lock', source), 'utf8')).trim().split('\n');
  assert.equal(packages.length, inputs.environment.installedPackages, 'GHDL package closure size');
  assert.ok(
    packages.every((line) => /^[a-z0-9.+:-]+=[^\s=]+$/.test(line)),
    'Unpinned GHDL package',
  );
  assert.equal(proof.comparison.identical, true, 'GHDL clean builds must match');
  assert.equal(proof.builds.length, 2, 'Two GHDL clean builds are required');
  assert.match(proof.ci.commit, /^[a-f0-9]{40}$/);
  assert.match(proof.ci.url, /^https:\/\/github\.com\/MathJSLab\/mathjslab-markdown\/actions\/runs\/\d+$/);
  for (const name of ['ghdl-synth.wasm', 'libraries.tar.gz']) {
    assert.deepEqual(proof.artifacts[name], lock.files['ghdl/' + name], 'Stale GHDL artifact: ' + name);
    for (const build of proof.builds) assert.deepEqual(build.artifacts[name], proof.artifacts[name], 'GHDL clean build differs: ' + name);
  }
}
