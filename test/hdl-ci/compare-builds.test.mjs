import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const compare = fileURLToPath(new URL('../../script/hdl/ghdl-synth/compare-builds.mjs', import.meta.url));
for (const differing of [undefined, 'ghdl-synth.wasm', 'libraries.tar.gz']) {
  test(`CI comparison ${differing ? `rejects differing ${differing}` : 'accepts identical candidates'}`, () => {
    const root = mkdtempSync(join(tmpdir(), 'ghdl-ci-'));
    try {
      const first = join(root, 'first');
      const second = join(root, 'second');
      mkdirSync(first);
      mkdirSync(second);
      for (const name of ['ghdl-synth.wasm', 'libraries.tar.gz']) {
        writeFileSync(join(first, name), Buffer.from([0, 1, 2, 255]));
        writeFileSync(join(second, name), Buffer.from(name === differing ? [0, 1, 3, 255] : [0, 1, 2, 255]));
      }
      const report = join(root, 'comparison.json');
      const result = spawnSync(process.execPath, [compare, first, second, report]);
      assert.equal(result.status, differing ? 1 : 0, result.stderr.toString());
      const evidence = JSON.parse(readFileSync(report));
      assert.equal(evidence.identical, !differing);
      assert.deepEqual(
        evidence.files.filter((file) => !file.identical).map((file) => file.name),
        differing ? [differing] : [],
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}
