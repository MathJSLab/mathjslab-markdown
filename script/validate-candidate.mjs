import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
if (!process.env.npm_execpath || process.argv.length !== 2) throw new Error('Run npm run test:candidate without skip flags.');
const digest = (value) => createHash('sha256').update(value).digest('hex');
const sources = () =>
  Object.fromEntries(
    execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean)
      .sort()
      .map((name) => [name, existsSync(path.join(root, name)) ? digest(readFileSync(path.join(root, name))) : null]),
  );
const before = sources();
mkdirSync(path.join(root, 'test-results'), { recursive: true });
const directory = mkdtempSync(path.join(root, 'test-results/candidate-'));
const report = { startedAt: new Date().toISOString(), status: 'running', sourceFingerprint: digest(JSON.stringify(before)), steps: [] };
const save = () => writeFileSync(path.join(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flush: true });
const steps = [
  'release:check',
  'build',
  'verify:distribution',
  'test:browser',
  'test:browser:mathjslab',
  'test:hdl:browser',
  'test:hdl:browser:vhdl',
  'test:hdl:browser:vhdl:runtime',
  'test:hdl:browser:verilog:runtime',
];
console.log(`Candidate report: ${directory}`);
try {
  for (const name of steps) {
    const step = { name, startedAt: new Date().toISOString(), status: 'running' };
    report.steps.push(step);
    save();
    console.log(`Checking ${name}...`);
    const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', name], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
    writeFileSync(path.join(directory, name.replaceAll(':', '-') + '.log'), (result.stdout ?? '') + (result.stderr ?? ''), { flush: true });
    step.exitCode = result.status;
    step.finishedAt = new Date().toISOString();
    step.status = result.status === 0 && !result.error ? 'passed' : 'failed';
    save();
    if (step.status !== 'passed') throw new Error(`${name} failed; see candidate log.`);
  }
  const packed = JSON.parse(
    execFileSync(process.execPath, [process.env.npm_execpath, 'pack', '--ignore-scripts', '--json', '--pack-destination', directory], { cwd: root, encoding: 'utf8' }),
  );
  const artifact = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];
  report.artifact = { filename: artifact.filename, integrity: artifact.integrity, sha256: digest(readFileSync(path.join(directory, artifact.filename))) };
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.error = error.message;
  process.exitCode = 1;
} finally {
  const after = sources();
  report.sourceChanges = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((name) => before[name] !== after[name]);
  if (report.sourceChanges.length) {
    report.status = 'failed';
    report.error = 'Candidate validation changed source/document/configuration files.';
    process.exitCode = 1;
  }
  report.finishedAt = new Date().toISOString();
  save();
  console.log(`Candidate ${report.status}: ${path.join(directory, 'report.json')}`);
}
