import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { serveStatic } from './static-server.mjs';

const server = await serveStatic();
const executablePath = process.env.HDL_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage();
const results = [], network = [], errors = [];
page.on('request', (request) => network.push({ url: request.url(), method: request.method(), body: request.postData() }));
page.on('pageerror', (error) => errors.push(error.message));
const execute = (request) => page.evaluate(async (request) => {
  const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
  const session = await executor.createSession({});
  try { return await session.execute(request, {}); } finally { await session.dispose(); }
}, request);
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
    const request = { language: 'vhdl', operation: 'simulate', top, files: [{ name: name + '.vhd', source }] };
    const result = await execute(request);
    assert.equal(result.status, 'success', result.logs);
    assert.ok(result.logs.includes(checkpoint), result.logs);
    const recording = await page.evaluate((vcd) => hdl.parseVCD(vcd), result.vcd);
    if (name === 'semantics') assert.deepEqual(recording.signals.find((signal) => signal.name.endsWith('.nine')).changes.map((change) => change.value), ['x', '0', '1', 'z', 'x', '0', '1', 'x']);
    if (name === 'delta-pulse') assert.ok(recording.sameTimeChanges >= 3);
    if (name === 'empty') {
      assert.deepEqual(recording.signals, []);
      assert.equal(recording.endTime * recording.timescale.magnitude, 133000000);
      assert.ok(!result.logs.includes('fstReaderOpen failed'), result.logs);
      for (const locale of ['pt', 'en', 'es']) {
        await page.evaluate(({ request, locale }) => hdl.mountBatch(request, locale), { request, locale });
        assert.ok(await page.locator('#lesson svg').count(), 'Signal-free timeline must render');
        for (const format of ['vcd', 'csv', 'svg']) await page.locator(`[data-hdl-export=${format}]`).first().click();
        const exports = await page.evaluate(() => hdl.exports);
        assert.equal(exports.length, 3);
        assert.ok(exports.find((artifact) => artifact.filename.endsWith('.vcd')).text.includes('#133000000'));
        assert.equal(exports.find((artifact) => artifact.filename.endsWith('.csv')).text, '"tick (1 fs)"\r\n"0"\r\n"133000000"\r\n');
        assert.ok(exports.find((artifact) => artifact.filename.endsWith('.svg')).text.includes('<svg'));
        assert.ok(!(await page.evaluate(() => hdl.diagnostics)).some((diagnostic) => diagnostic.severity === 'error'));
        await page.evaluate(() => hdl.unmount());
        assert.equal(await page.evaluate(() => hdl.workers()), 0);
      }
    }
    if (name === 'stable') {
      const units = { fs: 1e-6, ps: 1e-3, ns: 1, us: 1e3, ms: 1e6, s: 1e9 };
      assert.equal(recording.endTime * recording.timescale.magnitude * units[recording.timescale.unit], 137);
      assert.deepEqual(recording.signals.find((signal) => signal.name.endsWith('.steady')).changes, [{ time: 0, value: '1' }]);
    }
    results.push({ name, result });
    console.log('PASS packaged VHDL', name);
  }
  for (const [name, source] of [
    ['broken', 'entity broken is port(not valid);end;'],
    ['assert_fail', 'use std.env.all;entity assert_fail is end;architecture test of assert_fail is begin process begin wait for 3 ns;assert false report "deliberate assertion" severity failure;wait;end process;end;'],
  ]) {
    const result = await execute({ language: 'vhdl', operation: 'simulate', top: name, files: [{ name: name + '.vhd', source }] });
    assert.equal(result.status, 'error', result.logs);
    assert.ok(!result.logs.includes('fstReaderOpen failed'), result.logs);
    assert.ok(result.diagnostics.some((item) => item.file === name + '.vhd' && item.line > 0), result.logs);
    results.push({ name, result });
  }
  for (const locale of ['pt', 'en', 'es']) {
    for (const lesson of ['hdl-live-and', 'hdl-live-mux', 'hdl-live-counter', 'hdl-live-register', 'hdl-stimuli-checks']) {
      const text = await readFile(new URL(`../../example/${locale}/${lesson}.md`, import.meta.url), 'utf8');
      const request = { language: 'vhdl', ...JSON.parse(/```vhdl-live[^\n]*\n([\s\S]*?)\n```/.exec(text)[1]) };
      const steps = await page.evaluate(async ({ request, lesson }) => {
        const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
        const session = await executor.createInteractiveSession(request, {});
        try {
          const initial = Object.fromEntries(request.inputs.map((input) => [input.name, input.initial]));
          if (lesson === 'hdl-stimuli-checks') {
            let time = 0;
            const outputs = [];
            for (const check of request.checks) {
              for (const stimulus of request.stimuli) if (stimulus.timeNs <= time) Object.assign(initial, stimulus.inputs);
              const result = await session.step({ advanceNs: check.timeNs - time, inputs: { ...initial } }, {});
              time = result.timeNs;
              outputs.push({ ...result, expected: check.expected, actual: result.values[check.signal] });
            }
            return outputs;
          }
          const next = lesson === 'hdl-live-and' ? { a: '1', b: '1' } : lesson === 'hdl-live-counter' ? { rst: '0' } : lesson === 'hdl-live-register' ? { d: '1010', enable: '0' } : { ...initial, s: '1' };
          const outputs = [];
          for (const inputs of [initial, next, next]) outputs.push(await session.step({ advanceNs: 10, inputs }, {}));
          return outputs;
        } finally { await session.dispose(); }
      }, { request, lesson });
      if (lesson === 'hdl-stimuli-checks') for (const step of steps) assert.equal(step.actual, step.expected);
      if (lesson === 'hdl-live-and') assert.equal(steps[1].values.y, '1');
      if (lesson === 'hdl-live-mux') assert.equal(steps[1].values.y, '1010');
      if (lesson === 'hdl-live-counter') assert.deepEqual(steps.map((step) => step.values.q), ['0000', '0001', '0010']);
      if (lesson === 'hdl-live-register') assert.deepEqual(steps.map((step) => step.values.q), ['0101', '0101', '0101']);
      results.push({ name: `${locale}/${lesson}`, steps });
      console.log('PASS VHDL replay contract', locale, lesson);
    }
  }
  const stable = await page.evaluate(async () => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
    const session = await executor.createInteractiveSession({ language: 'vhdl', top: 'novel_buffer', files: [{ name: 'buffer.vhd', source: 'library ieee;use ieee.std_logic_1164.all;entity novel_buffer is port(a:in std_logic_vector(3 downto 0);y:out std_logic_vector(3 downto 0));end;architecture rtl of novel_buffer is begin y<=a;end;' }], inputs: [{ name: 'a', width: 4, initial: 'xz10' }], outputs: [{ name: 'y', width: 4 }], stepNs: 7 }, {});
    try {
      const results = [];
      for (const advanceNs of [7, 5]) {
        const result = await session.step({ advanceNs, inputs: { a: 'xz10' } }, {});
        const model = hdl.parseVCD(result.vcd);
        results.push({ value: result.values.y, timeNs: result.timeNs, duration: model.endTime * model.timescale.magnitude * ({ fs: 1e-6, ps: 1e-3, ns: 1 })[model.timescale.unit], changes: model.signals.find((signal) => signal.name.startsWith('markdown_replay.y')).changes });
      }
      return results;
    } finally { await session.dispose(); }
  });
  assert.deepEqual(stable.map((step) => [step.value, step.timeNs, step.duration]), [['xz10', 7, 7], ['xz10', 12, 12]]);
  for (const step of stable) assert.ok(step.changes.every((change) => change.time === 0));
  results.push({ name: 'new four-state stable replay and preserved history duration', stable });
  const clocked = await page.evaluate(async () => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
    const session = await executor.createInteractiveSession({ language: 'vhdl', top: 'manual_counter', files: [{ name: 'manual.vhd', source: "library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity manual_counter is port(clk,rst:in std_logic;q:out std_logic_vector(2 downto 0));end;architecture rtl of manual_counter is signal n:unsigned(2 downto 0):=(others=>'0');begin q<=std_logic_vector(n);process(clk)begin if rising_edge(clk)then if rst='1'then n<=(others=>'0');else n<=n+3;end if;end if;end process;end;" }], inputs: [{ name: 'clk', width: 1, initial: '0' }, { name: 'rst', width: 1, initial: '1' }], outputs: [{ name: 'q', width: 3 }], stepNs: 5 }, {});
    try {
      const values = [];
      for (const [clk, rst] of [['0', '1'], ['1', '1'], ['0', '0'], ['1', '0'], ['0', '0'], ['1', '0']]) values.push((await session.step({ advanceNs: 5, inputs: { clk, rst } }, {})).values.q);
      return values;
    } finally { await session.dispose(); }
  });
  assert.deepEqual(clocked, ['000', '000', '000', '011', '011', '110']);
  results.push({ name: 'new externally driven clock and synchronous reset', clocked });
  for (const halfPeriodNs of [10, 10000]) {
    const boundary = await page.evaluate(async (halfPeriodNs) => {
      const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
      const session = await executor.createInteractiveSession({ language: 'vhdl', top: 'boundary_counter', files: [{ name: 'boundary.vhd', source: "library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity boundary_counter is port(q:out std_logic_vector(2 downto 0));end;architecture rtl of boundary_counter is signal clk:std_logic:='0';signal n:unsigned(2 downto 0):=(others=>'0');begin clk<=not clk after 10 ns;q<=std_logic_vector(n);process(clk)begin if rising_edge(clk)then n<=n+1;end if;end process;end;".replace("after 10 ns", `after ${halfPeriodNs} ns`) }], inputs: [], outputs: [{ name: 'q', width: 3 }], stepNs: halfPeriodNs }, {});
      try {
        const values = [];
        for (let i = 0; i < 3; i++) values.push((await session.step({ advanceNs: halfPeriodNs, inputs: {} }, {})).values.q);
        return values;
      } finally { await session.dispose(); }
    }, halfPeriodNs);
    assert.deepEqual(boundary, ['001', '001', '010']);
    results.push({ name: halfPeriodNs === 10 ? 'clock edge and delta propagation exactly at each step endpoint' : '64-bit simulation times past 4 us preserve clock, state and replay', boundary });
  }
  const rollback = await page.evaluate(async () => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
    const session = await executor.createInteractiveSession({ language: 'vhdl', top: 'early', files: [{ name: 'early.vhd', source: "library ieee;use ieee.std_logic_1164.all;use std.env.all;entity early is port(a:in std_logic;y:out std_logic);end;architecture rtl of early is begin y<=a;process begin wait for 3 ns;if a='1'then report \"markdown replay checkpoint\";stop;end if;wait;end process;end;" }], inputs: [{ name: 'a', width: 1, initial: '1' }], outputs: [{ name: 'y', width: 1 }], stepNs: 10 }, {});
    try {
      let failure = '';
      try { await session.step({ advanceNs: 10, inputs: { a: '1' } }, {}); } catch (error) { failure = error.message; }
      const recovered = await session.step({ advanceNs: 10, inputs: { a: '0' } }, {});
      return { failure, recovered };
    } finally { await session.dispose(); }
  });
  assert.match(rollback.failure, /before the replay checkpoint/);
  assert.equal(rollback.recovered.timeNs, 10);
  assert.equal(rollback.recovered.values.y, '0');
  results.push({ name: 'premature stop rejected and failed step not committed', rollback });
  const safety = await page.evaluate(async () => {
    const request = { language: 'vhdl', operation: 'simulate', top: 'busy', files: [{ name: 'busy.vhd', source: 'entity busy is end;architecture test of busy is begin process variable n:natural:=0;begin loop if n=10 then n:=0;else n:=n+1;end if;end loop;wait;end process;end;' }] };
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href), timeoutMs: 2000, maxSessions: 1 });
    const session = await executor.createSession({});
    let limited = false, timeout = '', ticks = 0;
    const timer = setInterval(() => ticks++, 10);
    try { await executor.createSession({}); } catch { limited = true; }
    try { await session.execute(request, {}); } catch (error) { timeout = error.message; } finally { await session.dispose(); }
    const controller = new AbortController();
    const next = await executor.createSession({ signal: controller.signal });
    const pending = next.execute(request, {}).catch((error) => error.name);
    setTimeout(() => controller.abort(), 500);
    const cancelled = await pending;
    await next.dispose();
    const oversized = await executor.createSession({});
    let rejected = false;
    try { await oversized.execute({ ...request, files: [{ name: 'large.vhd', source: ' '.repeat(300000) }] }, {}); } catch { rejected = true; } finally { await oversized.dispose(); }
    const reuse = await executor.createSession({});
    await reuse.dispose();
    clearInterval(timer);
    return { limited, timeout, cancelled, rejected, ticks, workers: hdl.workers() };
  });
  assert.equal(safety.limited, true);
  assert.match(safety.timeout, /timed out/);
  assert.equal(safety.cancelled, 'AbortError');
  assert.equal(safety.rejected, true);
  assert.ok(safety.ticks > 20);
  assert.equal(safety.workers, 0);
  results.push({ name: 'real VHDL busy loop terminated, quotas and responsive main thread', safety });
  assert.equal(await page.evaluate(() => hdl.workers()), 0);
  assert.equal(await page.evaluate(() => crossOriginIsolated), false);
  assert.deepEqual(errors, []);
  assert.ok(network.every((request) => request.method === 'GET' && !request.body && new URL(request.url).origin === server.url));
  console.log('VHDL public runtime:', browser.version(), results.length, 'passed');
} finally {
  await mkdir('test-results/hdl-browser', { recursive: true });
  await writeFile(`test-results/hdl-browser/vhdl-runtime-${path.basename(executablePath, '.exe')}.json`, JSON.stringify({ browser: browser.version(), results, errors, network }, null, 2));
  await browser.close();
  await server.close();
}
