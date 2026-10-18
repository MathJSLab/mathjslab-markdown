import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createRequire } from 'node:module';

test('citations exports remain load-free and ship a lazy browser chunk', async () => {
  const extensions = await import('mathjslab-markdown/extensions');
  assert.equal(typeof extensions.citationsExtension, 'function');
  assert.equal(extensions.citationsManifest.name, 'citations');
  const require = createRequire(import.meta.url);
  assert.equal(
    Object.keys(require.cache).some((file) => /[\\/]node_modules[\\/](?:@citation-js|citeproc)[\\/]/.test(file)),
    false,
  );
  const files = readdirSync(new URL('../../dist/browser/chunks/', import.meta.url));
  assert.ok(files.some((file) => /^markdown-citations\..*\.js$/.test(file)));
  const licenses = new URL('../../dist/browser/citations/licenses/', import.meta.url);
  assert.match(readFileSync(new URL('citeproc-LICENSE', licenses), 'utf8'), /Frank Bennett/);
  for (const file of ['citation-js-core-LICENSE.md', 'citation-js-plugin-bibtex-LICENSE.md', 'citation-js-plugin-csl-LICENSE.md']) assert.ok(statSync(new URL(file, licenses)).size > 0);
});

test('TikZ exports are load-free and ship the worker, TeX assets, fonts and licenses', async () => {
  const extensions = await import('mathjslab-markdown/extensions');
  assert.equal(typeof extensions.tikzExtension, 'function');
  assert.deepEqual(extensions.tikzManifest.capabilities, ['wasm', 'network']);
  const root = new URL('../../dist/browser/tikzjax/', import.meta.url);
  for (const file of ['run-tex.js', 'tex.wasm.gz', 'core.dump.gz', 'tex_files/circuitikz.sty.gz', 'fonts/cmr10.woff2', 'LICENSE', 'run-tex.js.LICENSE.txt'])
    assert.ok(statSync(new URL(file, root)).size > 0, file);
  const files = readdirSync(new URL('../../dist/browser/chunks/', import.meta.url));
  assert.ok(files.some((file) => /^markdown-tikz\..*\.js$/.test(file)));
});

test('geometry exports stay load-free and produce a lazy browser chunk', async () => {
  const extensions = await import('mathjslab-markdown/extensions');
  assert.equal(typeof extensions.geometryExtension, 'function');
  assert.equal(extensions.geometryManifest.name, 'geometry');
  assert.deepEqual(extensions.geometryManifest.capabilities, ['interactive']);
  const require = createRequire(import.meta.url);
  assert.equal(
    Object.keys(require.cache).some((file) => /[\\/]node_modules[\\/]jsxgraph[\\/]/.test(file)),
    false,
  );
  const files = readdirSync(new URL('../../dist/browser/chunks/', import.meta.url));
  assert.ok(files.some((file) => /^markdown-geometry\..*\.js$/.test(file)));
});

test('WaveDrom exports stay load-free and produce a lazy browser chunk', async () => {
  const extensions = await import('mathjslab-markdown/extensions');
  assert.equal(typeof extensions.waveDromExtension, 'function');
  assert.equal(extensions.waveDromManifest.name, 'wavedrom');
  assert.deepEqual(extensions.waveDromManifest.dependencies, ['wavedrom', 'json5', 'dompurify']);
  const require = createRequire(import.meta.url);
  assert.equal(
    Object.keys(require.cache).some((file) => /[\\/]node_modules[\\/]wavedrom[\\/]/.test(file)),
    false,
  );
  const files = readdirSync(new URL('../../dist/browser/chunks/', import.meta.url));
  assert.ok(files.some((file) => /^markdown-wavedrom\..*\.js$/.test(file)));
});

test('netlist exports stay load-free and ship the layout chunk and licenses', async () => {
  const extensions = await import('mathjslab-markdown/extensions');
  assert.equal(typeof extensions.netlistExtension, 'function');
  assert.equal(extensions.netlistManifest.name, 'netlist');
  const require = createRequire(import.meta.url);
  assert.equal(
    Object.keys(require.cache).some((file) => /[\\/]node_modules[\\/]netlistsvg[\\/]/.test(file)),
    false,
  );
  const files = readdirSync(new URL('../../dist/browser/chunks/', import.meta.url));
  assert.ok(files.some((file) => /^markdown-netlist\..*\.js$/.test(file)));
  for (const file of ['netlistsvg-LICENSE', 'elkjs-LICENSE']) assert.ok(statSync(new URL('../../dist/browser/netlist/licenses/' + file, import.meta.url)).size > 0);
});

test('teaching extensions are available from the emitted public entry point without a DOM', async () => {
  const extensions = await import('mathjslab-markdown/extensions');
  const core = await import('mathjslab-markdown');
  for (const [factory, manifest, feature] of [
    ['didacticExtension', 'didacticManifest', 'didactic'],
    ['crossReferencesExtension', 'crossReferencesManifest', 'cross-references'],
  ]) {
    assert.equal(typeof extensions[factory], 'function');
    assert.equal(extensions[manifest].name, feature);
    assert.deepEqual(extensions[manifest].dependencies, []);
    assert.ok(core.educationalMarkdownFeatures.includes(feature));
  }
});

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
