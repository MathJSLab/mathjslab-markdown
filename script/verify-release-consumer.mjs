import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ts from 'typescript';

// Install the exact validated archive; never substitute workspace source imports.
const archive = path.resolve(process.argv[2] ?? '');
assert.ok(process.argv[2]?.endsWith('.tgz'), 'Run npm run verify:consumer -- ARCHIVE.tgz');
assert.ok(process.env.npm_execpath, 'Run through npm run verify:consumer.');
const root = process.cwd();
mkdirSync('test-results', { recursive: true });
const directory = mkdtempSync(path.join(tmpdir(), 'mathjslab-markdown-consumer-'));
writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ name: 'markdown-release-consumer', private: true, type: 'module' }));
execFileSync(process.execPath, [process.env.npm_execpath, 'install', '--ignore-scripts', '--omit=optional', '--no-audit', '--no-fund', archive, 'mathjslab@2.10.0'], {
  cwd: directory,
  stdio: 'inherit',
  windowsHide: true,
});
const manifest = JSON.parse(readFileSync(path.join(directory, 'node_modules/mathjslab/package.json')));
assert.equal(manifest.version, '2.10.0');
const require = createRequire(path.join(directory, 'package.json'));
for (const name of ['mathjslab-markdown/mathjslab', 'mathjslab/runtime']) {
  assert.ok(require.resolve(name).startsWith(directory + path.sep), `${name} must resolve inside the installed consumer`);
}
cpSync('test/distribution/mathjslab-runtime.test.mjs', path.join(directory, 'mathjslab-runtime.test.mjs'));
cpSync('test/distribution/fixtures', path.join(directory, 'fixtures'), { recursive: true });
execFileSync(process.execPath, ['--test', 'mathjslab-runtime.test.mjs'], { cwd: directory, stdio: 'inherit', windowsHide: true });
const entry = path.join(directory, 'consumer.mts');
writeFileSync(
  entry,
  `import { createBrowserMathJSLabWorkerExecutor, type BrowserMathJSLabWorkerExecutorOptions, type MathJSLabExecutionSession } from 'mathjslab-markdown/mathjslab';
const numeric: BrowserMathJSLabWorkerExecutorOptions['numeric'] = { engine: 'decimal', complex: { precision: 40, precisionCompare: 7 } };
const executor = createBrowserMathJSLabWorkerExecutor({ numeric, toMathML: String, workerFactory: () => new Worker('worker.js', { type: 'module' }) });
const session: MathJSLabExecutionSession = await executor.createSession({});
await session.reset?.(); await session.dispose?.(); await executor.dispose?.();
`,
);
const program = ts.createProgram([entry], {
  noEmit: true,
  strict: true,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2022,
  types: [],
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
});
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: String, getCurrentDirectory: () => root, getNewLine: () => '\n' }));
console.log(`Installed archive imports, public numeric/reset declarations and real Worker tests passed: ${directory}`);
