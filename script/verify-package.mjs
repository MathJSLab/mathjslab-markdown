import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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
for (const file of files) assert.ok(!/^(src|test|script|repo|report|coverage|test-results|playwright-report)\//.test(file), 'Development artifact in package: ' + file);
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filename);
    else if (/\.(js|ts)$/.test(entry.name)) {
      const content = fs.readFileSync(filename, 'utf8');
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
