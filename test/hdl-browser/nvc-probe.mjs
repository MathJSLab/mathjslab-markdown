import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { serveStatic } from './static-server.mjs';

// Intentionally fails if the experimental compiler has not been built.
// Passing this probe alone must not advertise interactive/executor support.
const candidateDirectory = process.env.HDL_NVC_DIRECTORY ?? '.hdl-research/simulation/build/browser';
assert.ok(!path.isAbsolute(candidateDirectory) && !candidateDirectory.split(/[\\/]/).includes('..'), 'Use a workspace-relative candidate directory');
await readFile(path.join(candidateDirectory, 'nvc.mjs'));
const server = await serveStatic();
const executablePath = process.env.HDL_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage();
const network = [], errors = [], results = [];
page.on('request', (request) => network.push({ url: request.url(), method: request.method(), body: request.postData() }));
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto(server.url + '/test/hdl-browser/index.html');
  await page.waitForFunction(() => !!window.hdl);
  for (const [name, top, checkpoint] of [
    ['semantics', 'browser_semantics', 'browser semantics checkpoint'],
    ['delays', 'browser_delays', 'delay transactions checkpoint'],
    ['stable', 'browser_stable', 'stable recording checkpoint at 137 ns'],
    ['empty', 'browser_empty', 'empty recording checkpoint at 133 ns'],
    ['delta-pulse', 'browser_delta_pulse', 'delta pulse checkpoint'],
    ['instances', 'browser_instances', 'instance checkpoint'],
    ['manual-clock', 'browser_manual', 'manual clock checkpoint'],
  ]) {
    const source = await readFile(new URL(`./fixtures/vhdl-simulation/${name}.vhd`, import.meta.url), 'utf8');
    const result = await page.evaluate((request) => new Promise((resolve, reject) => {
      const worker = new Worker('/test/hdl-browser/nvc-probe.worker.mjs', { type: 'module' });
      const timer = setTimeout(() => { worker.terminate(); reject(new Error('NVC probe timed out')); }, 60000);
      worker.onerror = (event) => { clearTimeout(timer); worker.terminate(); reject(new Error(event.message)); };
      worker.onmessage = ({ data }) => { clearTimeout(timer); worker.terminate(); resolve(data); };
      worker.postMessage(request);
    }), { base: '/' + candidateDirectory.replaceAll('\\', '/').replace(/\/$/, '') + '/', top, files: [{ name: name + '.vhd', source }] });
    results.push({ name, result });
    assert.equal(result.error, undefined, JSON.stringify(result));
    assert.equal(result.exit, 0, result.logs);
    assert.ok(result.logs.includes(checkpoint), result.logs);
    assert.equal(result.isolated, false, 'No COOP/COEP needed');
    assert.ok(result.vcd?.includes('$enddefinitions'), 'Real waveform missing');
    const recording = await page.evaluate((vcd) => hdl.parseVCD(vcd), result.vcd);
    if (name === 'semantics') {
      assert.deepEqual(recording.signals.find((item) => item.name.endsWith('.nine')).changes.map((item) => item.value), ['x', '0', '1', 'z', 'x', '0', '1', 'x']);
    }
    if (name === 'delta-pulse') {
      assert.ok(recording.sameTimeChanges >= 3, 'Delta transitions must survive export');
      const signal = recording.signals.find((item) => item.name.endsWith('.pulse'));
      const values = result.vcd.split(/\s+/).filter((token) => token.slice(1) === signal.id && /^[01]/.test(token)).map((token) => token[0]);
      assert.deepEqual(values, ['0', '1', '0', '1', '0']);
    }
    if (name === 'empty') {
      assert.deepEqual(recording.signals, []);
      assert.equal(recording.endTime * recording.timescale.magnitude, 133000000);
      assert.ok(!result.logs.includes('fstReaderOpen failed'), result.logs);
    }
    if (name === 'stable') {
      const units = { fs: 1e-6, ps: 1e-3, ns: 1, us: 1e3, ms: 1e6, s: 1e9 };
      assert.equal(recording.endTime * recording.timescale.magnitude * units[recording.timescale.unit], 137);
      const signal = recording.signals.find((item) => item.name.endsWith('.steady'));
      assert.deepEqual(signal?.changes, [{ time: 0, value: '1' }], 'No invented stable transitions');
    }
    console.log('PASS experimental NVC', name);
  }
  assert.deepEqual(errors, []);
  assert.ok(network.every((request) => request.method === 'GET' && !request.body && new URL(request.url).origin === server.url));
} finally {
  await mkdir('test-results/hdl-browser', { recursive: true });
  await writeFile(`test-results/hdl-browser/nvc-probe-${path.basename(executablePath, '.exe')}.json`, JSON.stringify({ candidateDirectory, browser: browser.version(), results, errors, network }, null, 2));
  await browser.close();
  await server.close();
}

