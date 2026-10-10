import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const command = process.argv[2];
const remove = (relative) => {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error('Cleanup target is outside this project.');
  fs.rmSync(target, { recursive: true, force: true });
};
const run = (executable, args) => {
  const result = spawnSync(executable, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(executable + ' failed with exit code ' + result.status);
};
const copy = (source, destination) => {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};
switch (command) {
  case 'clean-build':
    remove('dist');
    remove('report');
    break;
  case 'clean-results':
    for (const name of ['report', 'coverage', 'test-results', 'playwright-report', 'test/markdown/chunk-baseline.json']) remove(name);
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isFile() && /\.(log|tgz|tsbuildinfo)$/.test(entry.name)) remove(entry.name);
    }
    break;
  case 'clean-repository':
    remove('repo');
    break;
  case 'clone':
    remove('repo');
    fs.mkdirSync(path.join(root, 'repo'), { recursive: true });
    run('git', ['clone', 'https://github.com/MathJSLab/.github.git', path.join(root, 'repo', '.github')]);
    break;
  case 'copy': {
    // A local organization checkout can be supplied while its changes are unpublished.
    const sourceRoot = process.argv[3] ? path.resolve(process.cwd(), process.argv[3]) : path.join(root, 'repo', '.github');
    const configPath = path.join(sourceRoot, 'resource', 'mathjslab-markdown', 'copy.repo.config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    // Use the same synchronization implementation as the core package.
    for (const item of config.files) {
      const destination = typeof item === 'string' ? item : (item.dest ?? item.src);
      const destinationPath = path.resolve(root, destination);
      if (!destinationPath.startsWith(root + path.sep)) throw new Error('Copy target is outside this project.');
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    }
    copy(path.join(sourceRoot, 'script/helper/copy-repo-files.ts'), path.join(root, 'script/helper/copy-repo-files.ts'));
    copy(configPath, path.join(root, 'copy.repo.config.json'));
    // The shared helper resolves baseDir/repository; override the name for a local checkout.
    const localConfig = { ...config, repository: path.basename(sourceRoot) };
    const originalConfig = fs.readFileSync(path.join(root, 'copy.repo.config.json'), 'utf8');
    try {
      fs.writeFileSync(path.join(root, 'copy.repo.config.json'), JSON.stringify(localConfig, null, 2));
      run(process.execPath, [path.join(root, 'node_modules/tsx/dist/cli.mjs'), 'script/helper/copy-repo-files.ts', '--base-dir', path.dirname(sourceRoot)]);
    } finally {
      fs.writeFileSync(path.join(root, 'copy.repo.config.json'), originalConfig);
    }
    console.log('Organization common files synchronized.');
    break;
  }
  default:
    throw new Error('Expected clean-build, clean-results, clean-repository, clone or copy.');
}
