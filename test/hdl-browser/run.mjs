import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { serveStatic } from './static-server.mjs';
const { chromium } = await import(process.env.HDL_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.HDL_PLAYWRIGHT_MODULE).href : 'playwright-core');
const server = await serveStatic();
const browser = await chromium.launch({ executablePath: process.env.HDL_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
const network = [],
  errors = [];
page.on('request', (request) => network.push({ method: request.method(), url: request.url(), body: request.postData() }));
page.on('pageerror', (error) => errors.push(String(error)));
const results = [];
const language = process.env.HDL_LANGUAGE ?? 'verilog';
assert.ok(['verilog', 'vhdl'].includes(language));
const browserName = (language === 'vhdl' ? 'vhdl-' : '') + path.basename(process.env.HDL_BROWSER ?? 'chrome', '.exe');
try {
  await page.goto(server.url + '/test/hdl-browser/index.html');
  await page.waitForFunction(() => !!window.hdl);
  const result = await page.evaluate(async () => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
    const session = await executor.createSession({});
    try {
      return await session.execute(
        {
          language: 'verilog',
          operation: 'simulate',
          top: 'novel',
          stopTimeNs: 11,
          files: [{ name: 'novel.sv', source: "`timescale 1ns/1ps\nmodule novel; reg [2:0] a=3; wire [2:0] y = (a ^ 3'b101); initial begin #3 a=7; #4 a=0; end endmodule" }],
        },
        {},
      );
    } finally {
      await session.dispose();
    }
  });
  results.push({ name: 'novel Verilog', result });
  assert.equal(result.status, 'success', result.logs);
  assert.ok(result.vcd);
  assert.equal(
    await page.evaluate((vcd) => {
      const model = hdl.parseVCD(vcd);
      return hdl.vcdValueAt(
        model.signals.find((signal) => signal.name.startsWith('novel.y')),
        model.endTime,
      );
    }, result.vcd),
    '101',
  );
  const semantics = await page.evaluate(async () => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
    const request = {
      language: 'verilog',
      operation: 'simulate',
      top: 'buffer4',
      files: [{ name: 'buffer.sv', source: 'module buffer4(input[3:0]A,output[3:0]Y);assign Y=A;endmodule' }],
      inputs: [{ name: 'A', width: 4, initial: 'xz10' }],
      outputs: [{ name: 'Y', width: 4 }],
      stepNs: 7,
    };
    const session = await executor.createInteractiveSession(request, {});
    const steps = [];
    try {
      for (const advanceNs of [7, 5]) {
        const result = await session.step({ advanceNs, inputs: { A: 'xz10' } }, {});
        const model = hdl.parseVCD(result.vcd);
        const signal = model.signals.find((signal) => signal.name.startsWith('markdown_replay.Y'));
        steps.push({ value: result.values.Y, timeNs: result.timeNs, endTime: model.endTime, changes: signal.changes });
      }
    } finally {
      await session.dispose();
    }
    const bad = await executor.createSession({});
    let diagnostic;
    try {
      diagnostic = await bad.execute({ language: 'verilog', operation: 'simulate', top: 'broken', files: [{ name: 'broken.sv', source: 'this is invalid HDL;' }] }, {});
    } finally {
      await bad.dispose();
    }
    return { steps, diagnostic };
  });
  assert.deepEqual(
    semantics.steps.map((step) => step.value),
    ['xz10', 'xz10'],
  );
  for (const step of semantics.steps) {
    assert.equal(step.endTime, step.timeNs * 1_000_000);
    assert.ok(
      step.changes.every((change) => change.time === 0),
      'stable duration never invents transitions',
    );
  }
  assert.equal(semantics.diagnostic.status, 'error');
  assert.ok(semantics.diagnostic.diagnostics.some((item) => item.file === 'broken.sv' && item.line > 0));
  const check = async (name, request, interactive = false, lesson = '') => {
    const result = await page.evaluate(
      async ({ request, interactive, lesson }) => {
        const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href), timeoutMs: 60_000 });
        if (!interactive) {
          const session = await executor.createSession({});
          try {
            return await session.execute(request, {});
          } finally {
            await session.dispose();
          }
        }
        const session = await executor.createInteractiveSession(request, {});
        try {
          const initial = Object.fromEntries(request.inputs.map((input) => [input.name, input.initial]));
          if (lesson === 'hdl-stimuli-checks') {
            let time = 0;
            const results = [];
            for (const check of request.checks) {
              for (const stimulus of request.stimuli) if (stimulus.timeNs <= time) Object.assign(initial, stimulus.inputs);
              const result = await session.step({ advanceNs: check.timeNs - time, inputs: { ...initial } }, {});
              time = result.timeNs;
              results.push({ ...result, expected: check.expected, actual: result.values[check.signal] });
            }
            return results;
          }
          const first = await session.step({ advanceNs: 10, inputs: initial }, {});
          const inputs =
            lesson === 'hdl-live-and'
              ? { a: '1', b: '1' }
              : lesson === 'hdl-live-counter'
                ? { rst: '0' }
                : lesson === 'hdl-live-register'
                  ? { d: '1010', enable: '0' }
                  : { ...initial, s: '1' };
          const second = await session.step({ advanceNs: 10, inputs }, {});
          const third = await session.step({ advanceNs: 10, inputs }, {});
          return [first, second, third];
        } finally {
          await session.dispose();
        }
      },
      { request, interactive, lesson },
    );
    if (!interactive) {
      assert.equal(result.status, 'success', `${name}: ${result.logs}`);
      if (request.operation === 'synthesize') assert.ok(Object.keys(result.netlist.netlist.modules[request.top].cells).length);
      if (lesson === 'hdl-porta-and')
        assert.equal(
          await page.evaluate((vcd) => {
            const recording = hdl.parseVCD(vcd);
            return hdl.vcdValueAt(
              recording.signals.find((signal) => signal.name === 'tb.y'),
              recording.endTime,
            );
          }, result.vcd),
          '1',
        );
    } else {
      if (lesson === 'hdl-stimuli-checks') for (const step of result) assert.equal(step.actual, step.expected);
      if (lesson === 'hdl-live-and') assert.equal(result[1].values.y, '1');
      if (lesson === 'hdl-live-mux') assert.equal(result[1].values.y, '1010');
      if (lesson === 'hdl-live-counter')
        assert.deepEqual(
          result.map((step) => step.values.q),
          ['0000', '0001', '0010'],
        );
      if (lesson === 'hdl-live-register')
        assert.deepEqual(
          result.map((step) => step.values.q),
          ['0101', '0101', '0101'],
        );
    }
    results.push({ name, passed: true });
    console.log('PASS', name);
  };
  for (const locale of ['pt', 'en', 'es']) {
    for (const lesson of [
      'hdl-porta-and',
      'hdl-contador',
      'hdl-multiplexador',
      'hdl-somador',
      'hdl-live-and',
      'hdl-live-mux',
      'hdl-live-counter',
      'hdl-live-register',
      'hdl-stimuli-checks',
    ]) {
      const text = await readFile(new URL(`../../example/${locale}/${lesson}.md`, import.meta.url), 'utf8');
      for (const match of text.matchAll(new RegExp('```' + language + '-(run|live)[^\\n]*\\n([\\s\\S]*?)\\n```', 'g')))
        await check(`${locale}/${lesson}`, { language, ...JSON.parse(match[2]) }, match[1] === 'live', lesson);
    }
    const text = await readFile(new URL(`../../example/${locale}/codigo-hdl.md`, import.meta.url), 'utf8');
    let index = 0;
    for (const match of text.matchAll(new RegExp('```' + language + '\\r?\\n([\\s\\S]*?)\\n```', 'g'))) {
      await check(`${locale}/codigo-hdl/${index}`, {
        language,
        operation: 'synthesize',
        top: ['and_gate', 'mux2', 'dff', 'counter4'][index++],
        files: [{ name: language === 'vhdl' ? 'design.vhd' : 'design.v', source: match[1] }],
      });
    }
  }
  assert.equal(results.length, 40);
  for (const locale of ['pt', 'en', 'es'])
    for (const lesson of ['hdl-porta-and', 'hdl-contador', 'hdl-multiplexador', 'hdl-somador']) {
      const text = await readFile(new URL(`../../example/${locale}/${lesson}.md`, import.meta.url), 'utf8');
      const request = { language, ...JSON.parse(new RegExp('```' + language + '-run[^\\n]*\\n([\\s\\S]*?)\\n```').exec(text)[1]) };
      await page.evaluate(({ request, locale }) => hdl.mountBatch(request, locale), { request, locale });
      assert.ok(await page.locator('#lesson svg').count(), `${locale}/${lesson} renders an actual batch waveform/netlist`);
      assert.equal(await page.evaluate(() => hdl.diagnostics.filter((item) => item.severity === 'error').length), 0);
      for (const format of request.operation === 'synthesize' ? ['json', 'svg'] : ['json', 'vcd', 'csv', 'svg']) await page.locator(`[data-hdl-export=${format}]`).first().click();
      assert.ok((await page.evaluate(() => hdl.exports)).length >= 2);
      await page.evaluate(() => hdl.unmount());
      results.push({ name: `UI batch ${locale}/${lesson}`, passed: true });
      console.log('PASS UI batch', locale, lesson);
    }
  for (const locale of ['pt', 'en', 'es']) {
    for (const lesson of ['hdl-live-and', 'hdl-live-mux', 'hdl-live-counter', 'hdl-live-register', 'hdl-stimuli-checks']) {
      const text = await readFile(new URL(`../../example/${locale}/${lesson}.md`, import.meta.url), 'utf8');
      const request = { language, ...JSON.parse(new RegExp('```' + language + '-live[^\\n]*\\n([\\s\\S]*?)\\n```').exec(text)[1]) };
      await page.evaluate(({ request, locale }) => hdl.mount(request, locale), { request, locale });
      const step = page.locator('[data-hdl-action=step]');
      await step.click();
      await page.waitForFunction(() => Number(document.querySelector('#lesson').getAttribute('data-hdl-time')) > 0 && !document.querySelector('[data-hdl-action=step]').disabled);
      assert.ok(await page.locator('.vcd-graphic svg').count());
      for (const format of ['json', 'txt', 'vcd', 'csv', 'svg']) await page.locator(`[data-hdl-export=${format}]`).click();
      const artifacts = await page.evaluate(() => hdl.exports);
      assert.equal(artifacts.length, 5);
      const recording = JSON.parse(artifacts.find((item) => item.filename.endsWith('.json')).text);
      assert.equal(recording.history.length, 1);
      assert.ok(artifacts.find((item) => item.filename.endsWith('.svg')).text.includes('<svg'));
      await page.locator('[data-hdl-action=run]').click();
      await page.locator('[data-hdl-action=pause]').click();
      await page.waitForFunction(() => document.querySelector('[data-hdl-action=pause]').disabled && hdl.workers() === 0);
      const paused = await page.locator('#lesson').getAttribute('data-hdl-time');
      await page.waitForTimeout(150);
      assert.equal(await page.locator('#lesson').getAttribute('data-hdl-time'), paused);
      if (lesson === 'hdl-live-and') {
        await page.getByLabel('a', { exact: true }).selectOption('z');
        await page.getByLabel('b', { exact: true }).selectOption('1');
        await step.click();
        await page.waitForFunction(() => !document.querySelector('[data-hdl-action=step]').disabled);
        assert.ok((await page.locator('#lesson > table').first().textContent()).includes('x'));
      }
      await page.locator('[data-hdl-action=reset]').click();
      await page.waitForFunction(() => document.querySelector('#lesson').getAttribute('data-hdl-time') === '0' && !document.querySelector('[data-hdl-action=step]').disabled);
      await page.locator('#lesson > .hdl-exports [data-hdl-export=json]').click();
      assert.equal(await page.evaluate(() => JSON.parse(hdl.exports.at(-1).text).history.length), 0);
      await step.click();
      await page.waitForFunction(() => Number(document.querySelector('#lesson').getAttribute('data-hdl-time')) > 0 && !document.querySelector('[data-hdl-action=step]').disabled);
      if (lesson === 'hdl-live-counter') assert.ok((await page.locator('#lesson > table').first().textContent()).includes('0000'));
      if (locale === 'pt' && lesson === 'hdl-live-counter') {
        await mkdir('test-results/hdl-browser', { recursive: true });
        await page.screenshot({ path: `test-results/hdl-browser/${browserName}.png`, fullPage: true });
      }
      await page.evaluate(() => hdl.unmount());
      assert.equal(await page.evaluate(() => hdl.workers()), 0);
      results.push({ name: `UI ${locale}/${lesson}`, passed: true });
      console.log('PASS UI', locale, lesson);
    }
  }
  const safety = await page.evaluate(async (language) => {
    const base = language === 'vhdl' ? { language, operation: 'simulate', top: 'hang', files: [{ name: 'hang.vhd', source: 'entity hang is end;architecture test of hang is begin process variable n:natural:=0;begin loop if n=10 then n:=0;else n:=n+1;end if;end loop;wait;end process;end;' }] } : { language: 'verilog', operation: 'simulate', top: 'hang', files: [{ name: 'hang.v', source: 'module hang; initial forever begin end endmodule' }] };
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href), timeoutMs: 1000, maxSessions: 1 });
    let ticks = 0;
    const timer = setInterval(() => ticks++, 10);
    const session = await executor.createSession({});
    let limited = false;
    try {
      await executor.createSession({});
    } catch {
      limited = true;
    }
    let timeout = '';
    try {
      await session.execute(base, {});
    } catch (error) {
      timeout = error.message;
    }
    const controller = new AbortController();
    const next = await executor.createSession({ signal: controller.signal });
    const pending = next.execute(base, {}).catch((error) => error.name);
    setTimeout(() => controller.abort(), 100);
    const cancelled = await pending;
    const invalid = await executor.createSession({});
    let oversized = false;
    try {
      await invalid.execute({ ...base, files: [{ name: 'big.v', source: ' '.repeat(300000) }] }, {});
    } catch {
      oversized = true;
    }
    const reuse = await executor.createSession({});
    await reuse.dispose();
    clearInterval(timer);
    return { limited, timeout, cancelled, oversized, ticks, workers: hdl.workers() };
  }, language);
  assert.equal(safety.limited, true);
  assert.match(safety.timeout, /timed out/);
  assert.equal(safety.cancelled, 'AbortError');
  assert.equal(safety.oversized, true);
  assert.ok(safety.ticks > 20, 'main-thread timers remain responsive');
  assert.equal(safety.workers, 0);
  results.push({ name: 'limits, actual Worker cancellation, responsiveness', ...safety, passed: true });
  results.push({ name: 'four-state buffers, stable recording duration, located diagnostics', ...semantics, passed: true });
  await page.evaluate((language) =>
    hdl.mount(
      {
        language,
        top: 'busy',
        files: [language === 'vhdl' ? { name: 'busy.vhd', source: 'library ieee;use ieee.std_logic_1164.all;entity busy is port(a:in std_logic;y:out std_logic);end;architecture test of busy is begin y<=a;process variable n:natural:=0;begin loop if n=10 then n:=0;else n:=n+1;end if;end loop;wait;end process;end;' } : { name: 'busy.sv', source: 'module busy(input a,output y);assign y=a;initial forever begin end endmodule' }],
        inputs: [{ name: 'a', width: 1, initial: '0' }],
        outputs: [{ name: 'y', width: 1 }],
        stepNs: 10,
      },
      'pt',
    ),
    language,
  );
  await page.locator('[data-hdl-action=step]').click();
  await page.waitForFunction(() => hdl.workers() > 0);
  await page.evaluate((language) =>
    hdl.mount(
      {
        language,
        top: 'replacement',
        files: [language === 'vhdl' ? { name: 'replacement.vhd', source: 'library ieee;use ieee.std_logic_1164.all;entity replacement is port(a:in std_logic;y:out std_logic);end;architecture rtl of replacement is begin y<=not a;end;' } : { name: 'replacement.v', source: 'module replacement(input a,output y);assign y=~a;endmodule' }],
        inputs: [{ name: 'a', width: 1, initial: '0' }],
        outputs: [{ name: 'y', width: 1 }],
        stepNs: 10,
      },
      'pt',
    ),
    language,
  );
  assert.equal(await page.evaluate(() => hdl.workers()), 0);
  await page.locator('[data-hdl-action=step]').click();
  await page.waitForFunction(() => document.querySelector('#lesson').getAttribute('data-hdl-time') === '10');
  assert.ok((await page.locator('#lesson > table').first().textContent()).includes('1'));
  await page.evaluate(() => hdl.unmount());
  results.push({ name: 'replacement cancels active compilation/simulation', passed: true });
  for (const locale of ['pt', 'en', 'es']) {
    const request = {
      language: 'vhdl',
      standard: '19',
      top: 'pending_vhdl',
      files: [
        {
          name: 'pending.vhd',
          source: 'library ieee;use ieee.std_logic_1164.all;entity pending_vhdl is port(a:in std_logic;y:out std_logic);end;architecture rtl of pending_vhdl is begin y<=a;end;',
        },
      ],
      inputs: [{ name: 'a', width: 1, initial: '0' }],
      outputs: [{ name: 'y', width: 1 }],
      stepNs: 10,
    };
    await page.evaluate(({ request, locale }) => hdl.mount(request, locale, false), { request, locale });
    assert.equal(await page.locator('[data-hdl-action=step]').count(), 0, 'Markdown cannot grant execution');
    assert.equal(await page.evaluate(() => hdl.workers()), 0);
    await page.evaluate(({ request, locale }) => hdl.mount(request, locale), { request, locale });
    await page.locator('[data-hdl-action=step]').click();
    await page.waitForFunction(() => document.querySelector('.hdl-interactive-logs').textContent.includes('2008'));
    assert.equal(await page.evaluate(() => hdl.workers()), 0, 'unsupported VHDL standard never falls back to a service');
    await page.evaluate(() => hdl.unmount());
  }
  results.push({ name: 'explicit authorization and unsupported VHDL standard diagnostics in pt/en/es (negative checks)', passed: true });
  await page.evaluate((language) => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
    window.pendingJob = executor
      .createSession({})
      .then((session) =>
        session.execute({ language, operation: 'simulate', top: 'hang', files: [language === 'vhdl' ? { name: 'hang.vhd', source: 'entity hang is end;architecture test of hang is begin process variable n:natural:=0;begin loop if n=10 then n:=0;else n:=n+1;end if;end loop;wait;end process;end;' } : { name: 'hang.v', source: 'module hang; initial forever begin end endmodule' }] }, {}),
      )
      .catch(() => {});
  }, language);
  await page.waitForFunction(() => hdl.workers() > 0);
  await page.goto(server.url + '/test/hdl-browser/index.html');
  await page.waitForFunction(() => !!window.hdl);
  assert.equal(page.workers().length, 0, 'navigation releases the previous document Workers');
  results.push({ name: 'navigation releases document Workers', passed: true });
  assert.deepEqual(errors, []);
  assert.ok(
    network.every((request) => request.method === 'GET' && !request.body && new URL(request.url).origin === server.url),
    'Only same-origin GET requests, no source upload',
  );
  console.log('Real browser:', browser.version(), results.length, 'cases passed');
} finally {
  await mkdir('test-results/hdl-browser', { recursive: true });
  await writeFile(`test-results/hdl-browser/${browserName}.json`, JSON.stringify({ browser: browser.version(), results, errors, network, staticRequests: server.requests }, null, 2));
  await browser.close();
  await server.close();
}
