import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { ghdlRecipeFiles, verifyGHDLReproduction } from '../../script/helper/verify-ghdl-reproduction.mjs';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'ghdl-proof-'));
  const source = pathToFileURL(root + '/');
  const inputs = { reproducibleBuildVerified: true, environment: { baseImage: 'ubuntu@sha256:fixed', installedPackages: 1 } };
  const artifacts = { 'ghdl-synth.wasm': { bytes: 10, sha256: 'wasm-hash' }, 'libraries.tar.gz': { bytes: 20, sha256: 'library-hash' } };
  const recipeSHA256 = {};
  for (const name of ghdlRecipeFiles) {
    const contents = name === 'Dockerfile' ? 'FROM ubuntu@sha256:fixed\nRUN sha256sum --check manifest\n' : name === 'build-packages.lock' ? 'gnat-13=1.0\n' : name;
    await writeFile(new URL(name, source), contents);
    recipeSHA256[name] = createHash('sha256').update(contents).digest('hex');
  }
  const proof = {
    sourceInputs: { toolchain: inputs, recipeSHA256 },
    artifacts,
    builds: [{ artifacts }, { artifacts }],
    comparison: { identical: true },
    ci: { commit: 'a'.repeat(40), url: 'https://github.com/MathJSLab/mathjslab-markdown/actions/runs/123' },
  };
  await writeFile(new URL('sources.lock.json', source), JSON.stringify(inputs));
  await writeFile(new URL('reproduction.json', source), JSON.stringify(proof));
  return { root, source, proof, lock: { files: Object.fromEntries(Object.entries(artifacts).map(([name, value]) => ['ghdl/' + name, value])) } };
}

for (const change of ['none', 'recipe', 'asset', 'second build']) {
  test(`GHDL release proof: ${change === 'none' ? 'accept consistent evidence' : 'reject changed ' + change}`, async () => {
    const data = await fixture();
    try {
      if (change === 'recipe') await writeFile(new URL('pack-libraries.py', data.source), 'changed');
      if (change === 'asset') data.lock.files['ghdl/libraries.tar.gz'] = { bytes: 21, sha256: 'other' };
      if (change === 'second build') {
        data.proof.builds[1].artifacts = {};
        await writeFile(new URL('reproduction.json', data.source), JSON.stringify(data.proof));
      }
      const result = verifyGHDLReproduction(data.lock, data.source);
      if (change === 'none') await result;
      else await assert.rejects(result, /Stale GHDL|GHDL clean build differs/);
    } finally {
      await rm(data.root, { recursive: true, force: true });
    }
  });
}
