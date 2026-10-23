import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { prepare3DMol } from '../../script/3dmol/prepare.mjs';

test('reproduces the private runtime without modifying the pinned dependency and retains its license', async () => {
  const root = new URL('../../', import.meta.url);
  const original = new URL('node_modules/3dmol/build/3Dmol.js', root);
  const lock = JSON.parse(await readFile(new URL('script/3dmol/runtime.lock.json', root), 'utf8'));
  const before = await readFile(original);
  await prepare3DMol();
  const generated = await readFile(new URL('dist/source/markdown/extensions/molecule-3d/vendor/3dmol.js', root));
  await prepare3DMol();
  assert.deepEqual(await readFile(original), before);
  assert.equal(createHash('sha256').update(before).digest('hex'), lock.sha256);
  assert.deepEqual(await readFile(new URL('dist/source/markdown/extensions/molecule-3d/vendor/3dmol.js', root)), generated);
  assert.deepEqual(await readFile(new URL('src/markdown/extensions/molecule-3d/vendor/3dmol.js', root)), generated);
  assert.equal(generated.toString().includes('if (OffscreenCanvas &&'), false);
  assert.ok(generated.toString().includes((await readFile(new URL('script/3dmol/initGL.js.txt', root), 'utf8')).replaceAll('\r\n', '\n')));
  assert.deepEqual(await readFile(new URL('dist/source/markdown/extensions/molecule-3d/vendor/LICENSE', root)), await readFile(new URL('node_modules/3dmol/LICENSE', root)));
  const extension = await readFile(new URL('dist/source/markdown/extensions/molecule-3d/extension.js', root), 'utf8');
  assert.ok(extension.includes("'./vendor/3dmol.js'"), 'Source entry points must use the patched runtime too');
});
