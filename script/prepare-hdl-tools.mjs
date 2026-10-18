import { mkdir, writeFile, readFile, appendFile, stat, unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Explicit repository helper, not an npm install hook or an engine feature.
if (process.platform !== 'win32' || process.arch !== 'x64')
  throw new Error('This portable profile requires Windows x64. Other hosts should install GHDL, Icarus and Yosys and configure HDL_* paths.');
const root = fileURLToPath(new URL('../', import.meta.url));
const cache = path.join(root, 'node_modules', '.cache', 'mathjslab-hdl-tools');
await mkdir(cache, { recursive: true });
const digest = async (file) => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
};
const extract = (file, directory) =>
  new Promise((resolve, reject) => {
    const child = spawn('tar', ['-xf', file, '-C', directory], { shell: false, windowsHide: true, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`HDL archive extraction failed (${code})`))));
  });
const download = (url, filename, start, end) =>
  new Promise((resolve, reject) => {
    // Windows curl uses the system certificate store. Never disable TLS checks.
    const executable = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'curl.exe');
    const child = spawn(
      executable,
      [
        '--location',
        '--fail',
        '--silent',
        '--show-error',
        '--proto',
        '=https',
        '--proto-redir',
        '=https',
        '--range',
        `${start}-${end}`,
        '--max-time',
        '120',
        '--max-filesize',
        String(end - start + 1),
        '--output',
        filename,
        url,
      ],
      { shell: false, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let error = '';
    child.stderr.on('data', (chunk) => {
      error += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(error.trim() || `HDL download failed (${code})`))));
  });
const profiles = [
  {
    name: 'ghdl-6.0.0.zip',
    url: 'https://github.com/ghdl/ghdl/releases/download/v6.0.0/ghdl-mcode-6.0.0-mingw64.zip',
    size: 24053403,
    sha256: 'c1562b2a4767e34d33159b536b5e36a8a38ebdb6e7672aa9969a4f4ac2cadffe',
    directory: path.join(cache, 'ghdl'),
  },
  {
    name: 'oss-cad-suite-20261017.tgz',
    url: 'https://github.com/YosysHQ/oss-cad-suite-build/releases/download/2026-10-17/oss-cad-suite-windows-x64-20261017.tgz',
    size: 603962849,
    sha256: '842e7890bbfd1b7527f256ba6ff52666392f9707339f1189829849de9ef77dbf',
    directory: cache,
  },
];
for (const profile of profiles) {
  const archive = path.join(cache, profile.name);
  let ready = false;
  try {
    ready = (await stat(archive)).size === profile.size && (await digest(archive)) === profile.sha256;
  } catch {
    /* Download below. */
  }
  if (!ready) {
    const chunkSize = 8 * 1024 * 1024;
    const count = Math.ceil(profile.size / chunkSize);
    let next = 0;
    let done = 0;
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (next < count) {
          const part = next++;
          const start = part * chunkSize;
          const end = Math.min(profile.size - 1, start + chunkSize - 1);
          const filename = archive + '.part-' + part;
          for (let attempt = 0; ; attempt++) {
            try {
              await download(profile.url, filename, start, end);
              if ((await stat(filename)).size !== end - start + 1) throw new Error('HDL download length mismatch');
              break;
            } catch (error) {
              if (attempt === 2) throw error;
            }
          }
          done++;
          if (done % 10 === 0 || done === count) console.log(`${profile.name}: ${done}/${count} parts`);
        }
      }),
    );
    await writeFile(archive, '');
    for (let part = 0; part < count; part++) await appendFile(archive, await readFile(archive + '.part-' + part));
    if ((await digest(archive)) !== profile.sha256) throw new Error('HDL toolchain SHA-256 mismatch');
    for (let part = 0; part < count; part++) await unlink(archive + '.part-' + part);
  }
  await mkdir(profile.directory, { recursive: true });
  await extract(archive, profile.directory);
  console.log(`${profile.name}: verified and extracted`);
}
await writeFile(
  path.join(cache, 'inventory.json'),
  JSON.stringify(
    profiles.map(({ directory: _directory, ...profile }) => profile),
    null,
    2,
  ) + '\n',
);
console.log('Portable tools ready in ' + cache + '. System PATH unchanged; no installer executed.');
