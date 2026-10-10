import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('package core imports without a DOM, component registration or optional renderer load', async () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const core = await import('mathjslab-markdown');
  assert.equal(core.markdownPublicApiVersion, 2);
  assert.equal(typeof core.MarkdownEngine, 'function');
  assert.equal('MarkdownDocumentElement' in core, false);
  assert.equal(typeof globalThis.customElements, 'undefined');
  const engine = core.createMarkdownEnginePreset('safe-remote');
  assert.equal(engine.profile, 'gfm');
  await engine.dispose();
});

test('public package exports point to emitted modules and declarations', () => {
  const root = new URL('../../', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  for (const [name, entry] of Object.entries(manifest.exports)) {
    if (name.includes('*')) continue;
    assert.equal(existsSync(fileURLToPath(new URL(entry.types, root))), true, name + ' declarations');
    assert.equal(existsSync(fileURLToPath(new URL(entry.import, root))), true, name + ' module');
  }
  assert.equal('mathjslab-app' in manifest.dependencies, false);
  assert.equal('plotly.js-dist-min' in manifest.dependencies, false);
  assert.equal(manifest.peerDependenciesMeta.mathjslab.optional, true);
});

test('browser distribution contains shared runtime, entry points and nonempty lazy chunks', () => {
  const browser = new URL('../../dist/browser/', import.meta.url);
  for (const entry of ['runtime', 'core', 'component', 'component-register', 'extensions', 'mathjslab', 'mathjslab-worker', 'markdown-document']) {
    assert.ok(statSync(new URL(entry + '.js', browser)).size > 0, entry);
  }
  const chunks = new URL('chunks/', browser);
  const files = readdirSync(chunks).filter((name) => name.endsWith('.js'));
  assert.ok(files.length > 0, 'Optional renderers must produce lazy chunks');
  for (const name of files) assert.ok(statSync(new URL(name, chunks)).size > 0, name);
});
