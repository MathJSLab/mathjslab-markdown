// Development convenience only. No credentials enter the browser package.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../../', import.meta.url));
const branch = 'codex/hdl-build';
const repository = 'MathJSLab/mathjslab-markdown';
const workflow = 'hdl-ghdl-build.yml';
const page = `https://github.com/${repository}/actions/workflows/${workflow}`;
const [command = 'help', runId] = process.argv.slice(2);
// Respect the workstation's trusted CA store (including corporate roots).
// Never bypass certificate verification. Older Node versions can use their
// normal CA configuration; recent versions can add the OS trust store.
if (command === 'status' && process.allowedNodeEnvironmentFlags.has('--use-system-ca') && !process.execArgv.includes('--use-system-ca')) {
  const child = spawnSync(process.execPath, ['--use-system-ca', fileURLToPath(import.meta.url), ...process.argv.slice(2)], { cwd, stdio: 'inherit', shell: false });
  if (child.error) console.error(child.error.message);
  process.exit(child.status ?? 1);
}
function run(tool, args, capture = false) {
  const result = spawnSync(tool, args, { cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', shell: false });
  if (result.error) throw new Error(`${tool} indisponível: ${result.error.message}`);
  if (result.status !== 0) throw new Error(capture ? result.stderr.trim() : `${tool} terminou com código ${result.status}`);
  return capture ? result.stdout.trim() : undefined;
}
try {
  if (command === 'branch') {
    const current = run('git', ['branch', '--show-current'], true);
    if (current !== branch) run('git', ['switch', '-c', branch]);
    console.log(`Branch de build: ${branch}. Alterações locais preservadas.`);
  } else if (command === 'push') {
    if (run('git', ['branch', '--show-current'], true) !== branch) throw new Error('Execute npm run hdl:ci:branch antes de preparar o commit.');
    if (run('git', ['status', '--porcelain'], true))
      throw new Error('Existem alterações sem commit. Revise e crie o commit antes do push; o script não adiciona arquivos nem cria commits automaticamente.');
    const remote = run('git', ['remote', 'get-url', '--push', 'origin'], true);
    if (!/^(?:https:\/\/github\.com\/|git@github\.com:)MathJSLab\/mathjslab-markdown(?:\.git)?$/i.test(remote)) throw new Error('origin não corresponde ao repositório esperado.');
    run('git', ['cat-file', '-e', `HEAD:.github/workflows/${workflow}`], true);
    run('git', ['push', '--set-upstream', 'origin', `HEAD:refs/heads/${branch}`]);
    console.log(`Push concluído. Um commit novo nessa branch inicia o build. Se já estava atualizado, use Re-run jobs na execução anterior.\n${page}`);
  } else if (command === 'status') {
    const url = `https://api.github.com/repos/${repository}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=10`;
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`GitHub API: HTTP ${response.status}. Consulte ${page}`);
    const { workflow_runs: runs } = await response.json();
    const matching = runs.filter((item) => item.path === `.github/workflows/${workflow}`);
    for (const item of matching) {
      console.log(`${item.id} | ${item.head_sha.slice(0, 12)} | ${item.status} | ${item.conclusion ?? '-'}\n${item.html_url}`);
    }
    if (!matching.length) console.log(`Nenhuma execução encontrada. O GitHub pode levar alguns instantes após o push para registrar a execução.\n${page}`);
  } else if (command === 'download') {
    if (!/^\d+$/.test(runId ?? '')) throw new Error('Informe o ID: npm run hdl:ci:download -- 123456789');
    const probe = spawnSync('gh', ['--version'], { stdio: 'ignore', shell: false });
    if (probe.error || probe.status !== 0)
      throw new Error(`O download por script requer GitHub CLI (gh) e gh auth login. Alternativamente baixe Artifacts na execução: https://github.com/${repository}/actions/runs/${runId}`);
    run('gh', ['run', 'download', runId, '--repo', repository, '--dir', `.hdl-research/github-actions/${runId}`]);
  } else {
    console.log(
      'npm run hdl:ci:branch   cria a branch dedicada preservando as alterações\nApós revisar e criar o commit:\nnpm run hdl:ci:push     envia a branch e inicia o build para commits novos\nnpm run hdl:ci:status   consulta execuções públicas, sem token\nnpm run hdl:ci:download -- ID   baixa artefatos com gh autenticado\n' +
        page,
    );
    if (command !== 'help') process.exitCode = 2;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
