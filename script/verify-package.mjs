import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(manifest.repository.url, 'git+https://github.com/MathJSLab/mathjslab-markdown.git');
assert.equal(manifest.private, undefined);
assert.equal(manifest.peerDependenciesMeta.mathjslab.optional, true);
for (const group of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
  for (const [name, version] of Object.entries(manifest[group] ?? {})) {
    assert.ok(!/^(file:|link:|workspace:)/.test(version), group + ': ' + name + ' must be installable from npm');
  }
}
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run this check with npm run verify:package.');
const result = spawnSync(process.execPath, [npmCli, 'pack', '--dry-run', '--ignore-scripts', '--json'], { cwd: root, encoding: 'utf8' });
if (result.error) throw result.error;
assert.equal(result.status, 0, result.stderr);
const output = JSON.parse(result.stdout);
const packed = Array.isArray(output) ? output[0] : (output[manifest.name] ?? output);
assert.ok(Array.isArray(packed.files), 'Unexpected npm pack result keys: ' + Object.keys(packed).join(', '));
const files = new Set(packed.files.map((file) => file.path));
for (const file of [
  'script/3dmol/prepare.mjs',
  'script/3dmol/runtime.lock.json',
  'script/3dmol/initGL.js.txt',
  'script/3dmol/README.md',
  'dist/source/markdown/extensions/molecule-3d/vendor/3dmol.js',
  'dist/source/markdown/extensions/molecule-3d/vendor/LICENSE',
  'dist/browser/molecule-3d/licenses/3dmol-LICENSE',
])
  assert.ok(files.has(file), 'Missing private molecular runtime or reproduction input: ' + file);
const hdlPrefix = 'dist/browser/hdl/';
const hdlLock = JSON.parse(fs.readFileSync(path.join(root, hdlPrefix, 'toolchain.lock.json'), 'utf8'));
for (const [name, entry] of Object.entries(hdlLock.files)) {
  assert.ok(files.has(hdlPrefix + name), 'Missing packaged HDL asset: ' + name);
  const bytes = fs.readFileSync(path.join(root, hdlPrefix, name));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, 'Packaged HDL integrity: ' + name);
}
for (const name of ['browser-worker.mjs', 'NOTICE.md', 'toolchain.lock.json']) {
  assert.ok(files.has(hdlPrefix + name), 'Missing HDL integration asset: ' + name);
  assert.deepEqual(fs.readFileSync(path.join(root, hdlPrefix, name)), fs.readFileSync(path.join(root, 'assets/hdl', name)), 'Stale HDL distribution: ' + name);
}
for (const file of ['README.md', 'CHANGES.md', 'LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md']) assert.ok(files.has(file), 'Missing package file: ' + file);
for (const [name, entry] of Object.entries(manifest.exports)) {
  for (const target of typeof entry === 'string' ? [entry] : Object.values(entry)) {
    const relative = target.replace(/^\.\//, '');
    if (relative.includes('*')) {
      const [prefix, suffix] = relative.split('*');
      assert.ok(
        [...files].some((file) => file.startsWith(prefix) && file.endsWith(suffix)),
        'Empty export: ' + name,
      );
    } else {
      assert.ok(files.has(relative), 'Missing export: ' + name + ' -> ' + relative);
    }
  }
}
// Deliberately distribute the pinned compiler build recipe/patches, not general
// development tooling. Consumers can audit the source of the shipped Wasm port.
const ghdlBuildInputs = new Set(
  [
    'blackbox-verilog.patch',
    'bug.adb',
    'build-in-container.sh',
    'build.sh',
    'Dockerfile',
    'build-packages.lock',
    'build-debs.sha256',
    'sources.lock.json',
    'reproduction.json',
    'ghdl_synth_test.mjs',
    'pack-libraries.py',
    'grt-stdio.adb',
    'grt-stdio.patch',
    'README.md',
    'synth_api.adb',
    'synth_api.ads',
    'test.sh',
    'tests/and_gate.vhdl',
    'tests/adder8.vhdl',
    'tests/counter.vhdl',
    'tests/fsm.vhdl',
    'tests/syntax_error.vhdl',
    'tests/sem_error.vhdl',
  ].map((name) => 'script/hdl/ghdl-synth/' + name),
);
for (const file of ghdlBuildInputs) assert.ok(files.has(file), 'Missing GHDL build input: ' + file);
const nvcBuildInputs = new Set(
  [
    'README.md',
    'sources.lock.json',
    'reproduction.json',
    'release-wasm.patch',
    'upstream-wasm.patch',
    'single-thread.patch',
    'build.sh',
    'prepare.py',
    'pack-libraries.py',
    'compare-builds.py',
    'gen_wasm_symtab.sh',
    'libffi_stub.c',
    'sources/nvc-1.22.0.tar.gz',
    'sources/zstd-1.5.6.tar.gz',
    'sources/libffi-3.4.6.tar.gz',
    'sources/zlib-1.3.2.tar.gz',
  ].map((name) => 'script/hdl/nvc-browser/' + name),
);
for (const file of nvcBuildInputs) assert.ok(files.has(file), 'Missing corresponding NVC source/build input: ' + file);
const icarusBuildInputs = new Set(
  [
    'README.md',
    'sources.lock.json',
    'reproduction.json',
    'browser.patch',
    'build.sh',
    'prepare.py',
    'compare-builds.py',
    'bootstrap/configure',
    'bootstrap/lexor_keyword.cc',
    'bootstrap/vhdlpp/lexor_keyword.cc',
    'sources/iverilog-c7530db.tar.gz',
    'RUNTIME-LICENSES.txt',
  ].map((name) => 'script/hdl/icarus-browser/' + name),
);
for (const file of icarusBuildInputs) assert.ok(files.has(file), 'Missing corresponding Icarus source/build input: ' + file);
for (const file of files)
  assert.ok(
    ghdlBuildInputs.has(file) ||
      nvcBuildInputs.has(file) ||
      icarusBuildInputs.has(file) ||
      /^script\/3dmol\/(prepare\.mjs|runtime\.lock\.json|initGL\.js\.txt|README\.md)$/.test(file) ||
      !/^(src|test|script|repo|report|coverage|test-results|playwright-report)\//.test(file),
    'Development artifact in package: ' + file,
  );
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filename);
    else if (/\.(js|ts)$/.test(entry.name)) {
      const content = fs.readFileSync(filename, 'utf8');
      if (filename === path.join(root, 'dist/source/markdown/extensions/molecule-3d/vendor/3dmol.js')) {
        // Upstream bundle comments quote original TypeScript imports. Check
        // actual syntax instead of treating those comments as relative imports.
        const parsed = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
        assert.equal(parsed.parseDiagnostics.length, 0, 'Invalid private molecular ES module');
        const imports = [];
        const visit = (node) => {
          if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) imports.push(node.moduleSpecifier.getText(parsed));
          if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) imports.push(node.arguments[0]?.getText(parsed));
          ts.forEachChild(node, visit);
        };
        visit(parsed);
        assert.deepEqual(imports, [], 'Private molecular runtime must be self-contained');
        continue;
      }
      for (const match of content.matchAll(/(?:from\s*|import\s*\(\s*)['"](\.\.?\/[^'"]+)['"]/g)) {
        const imported = path.resolve(path.dirname(filename), match[1]);
        assert.ok(
          fs.existsSync(imported) || (filename.endsWith('.d.ts') && imported.endsWith('.js') && fs.existsSync(imported.slice(0, -3) + '.d.ts')),
          'Unresolved relative import: ' + filename + ' -> ' + match[1],
        );
      }
    }
  }
};
walk(path.join(root, 'dist/source'));
walk(path.join(root, 'dist/types'));
console.log('Package verified: ' + manifest.name + '@' + manifest.version + ', ' + files.size + ' files; exports, declarations and relative imports complete.');
