import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright-core';
import { serveStatic } from './static-server.mjs';

const server = await serveStatic();
const executablePath = process.env.HDL_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browserName = path.basename(executablePath, '.exe');
const reportTag = process.env.HDL_GHDL_CANDIDATE ? '-candidate' : '';
const candidateHashes = process.env.HDL_GHDL_CANDIDATE
  ? Object.fromEntries(
      await Promise.all(
        ['frontend.mjs', 'ghdl-synth.wasm', 'libraries.tar.gz'].map(async (name) => [
          name,
          createHash('sha256')
            .update(await readFile(path.resolve(process.env.HDL_GHDL_CANDIDATE, name)))
            .digest('hex'),
        ]),
      ),
    )
  : null;
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage();
const network = [],
  errors = [],
  results = [];
page.on('request', (request) => network.push({ url: request.url(), method: request.method(), body: request.postData() }));
page.on('pageerror', (error) => errors.push(error.message));
const execute = (request) =>
  page.evaluate(async (request) => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href), timeoutMs: 60000 });
    const session = await executor.createSession({});
    try {
      return await session.execute(request, {});
    } finally {
      await session.dispose();
    }
  }, request);
try {
  await page.goto(server.url + '/test/hdl-browser/index.html');
  await page.waitForFunction(() => !!window.hdl);
  const capabilities = await page.evaluate(() => hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) }).capabilities());
  assert.deepEqual(capabilities.languages.vhdl, { simulate: true, synthesize: true, interactive: 'replay' });
  for (const locale of ['pt', 'en', 'es']) {
    for (const lesson of ['hdl-multiplexador', 'hdl-somador']) {
      const text = await readFile(new URL(`../../example/${locale}/${lesson}.md`, import.meta.url), 'utf8');
      const match = /```vhdl-run[^\n]*\n([\s\S]*?)\n```/.exec(text);
      const request = { language: 'vhdl', ...JSON.parse(match[1]) };
      const result = await execute(request);
      assert.equal(result.status, 'success', result.logs);
      assert.ok(Object.keys(result.netlist.netlist.modules[request.top].cells).length);
      await page.evaluate(({ request, locale }) => hdl.mountBatch(request, locale), { request, locale });
      assert.ok(await page.locator('#lesson svg').count(), JSON.stringify(await page.evaluate(() => hdl.diagnostics)));
      await page.locator('[data-hdl-export=svg]').first().click();
      assert.ok((await page.evaluate(() => hdl.exports))[0].text.includes('<svg'));
      await page.evaluate(() => hdl.unmount());
      results.push({ name: `${locale}/${lesson}`, status: 'passed' });
      console.log('PASS VHDL synthesis and schematic', locale, lesson);
    }
    const source = await readFile(new URL(`../../example/${locale}/codigo-hdl.md`, import.meta.url), 'utf8');
    let index = 0;
    for (const match of source.matchAll(/```vhdl\r?\n([\s\S]*?)\n```/g)) {
      const top = ['and_gate', 'mux2', 'dff', 'counter4'][index++];
      const result = await execute({ language: 'vhdl', operation: 'synthesize', top, files: [{ name: 'source.vhd', source: match[1] }] });
      assert.equal(result.status, 'success', `${locale}/${top}: ${result.logs}`);
      assert.ok(Object.keys(result.netlist.netlist.modules[top].cells).length);
      results.push({ name: `${locale}/codigo-hdl/${top}`, status: 'passed' });
    }
  }
  const novel = {
    language: 'vhdl',
    operation: 'synthesize',
    standard: '08',
    top: 'NOVEL_ARITHMETIC',
    files: [
      {
        name: 'novel.vhd',
        source:
          'library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity Novel_Arithmetic is port(a,b:in unsigned(3 downto 0); y:out unsigned(4 downto 0));end;architecture rtl of Novel_Arithmetic is begin y<=resize(a,5)+resize(b,5)+to_unsigned(3,5);end;',
      },
    ],
  };
  const result = await execute(novel);
  assert.equal(result.status, 'success', result.logs);
  assert.equal(result.netlist.top, 'Novel_Arithmetic');
  assert.ok(Object.values(result.netlist.netlist.modules[result.netlist.top].cells).some((cell) => cell.type === '$add'));
  // Independent real Yosys evaluation of the returned GHDL-synthesized circuit.
  const verification = await page.evaluate(
    async (netlist) =>
      new Promise((resolve, reject) => {
        const worker = new Worker('/test/hdl-browser/verify-netlist.worker.mjs', { type: 'module' });
        const timer = setTimeout(() => {
          worker.terminate();
          reject(new Error('Netlist verification timed out'));
        }, 60000);
        worker.onerror = (error) => {
          clearTimeout(timer);
          worker.terminate();
          reject(new Error(error.message));
        };
        worker.onmessage = (event) => {
          clearTimeout(timer);
          worker.terminate();
          resolve(event.data);
        };
        worker.postMessage(netlist);
      }),
    result.netlist,
  );
  assert.equal(verification.error, undefined, verification.error);
  assert.match(verification.logs, /Eval result:.*y = 5'11001/); // 9 + 13 + 3 = 25, not a fixture answer.
  assert.ok(Object.values(result.netlist.netlist.modules[result.netlist.top].cells).some((cell) => /novel\.vhd/.test(cell.attributes?.src ?? '')));
  results.push({ name: 'novel numeric_std arithmetic, case-insensitive top and source locations; actual Yosys eval', status: 'passed' });
  const invalid = await execute({ ...novel, top: 'broken', files: [{ name: 'broken.vhd', source: 'entity broken is port(what is this);end;' }] });
  assert.equal(invalid.status, 'error');
  assert.ok(invalid.diagnostics.some((item) => item.file === 'broken.vhd' && item.line > 0));
  results.push({ name: 'syntax diagnostic with original file/line', status: 'passed' });
  const semantic = await execute({
    ...novel,
    top: 'bad_semantic',
    files: [
      {
        name: 'semantic.vhd',
        source: 'library ieee;use ieee.std_logic_1164.all;entity bad_semantic is port(y:out std_logic);end;architecture rtl of bad_semantic is begin y<=missing_signal;end;',
      },
    ],
  });
  assert.equal(semantic.status, 'error');
  assert.ok(semantic.diagnostics.some((item) => item.file === 'semantic.vhd' && item.line > 0));
  results.push({ name: 'semantic diagnostic with original file/line', status: 'passed' });
  const packages = await execute({
    ...novel,
    top: 'package_user',
    files: [
      { name: 'delta.vhd', source: 'package delta is constant increment:natural:=3;end;' },
      {
        name: 'use_delta.vhd',
        source:
          'library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;use work.delta.all;entity package_user is port(a:in unsigned(3 downto 0);y:out unsigned(3 downto 0));end;architecture rtl of package_user is begin y<=a+increment;end;',
      },
    ],
  });
  assert.equal(packages.status, 'success', packages.logs);
  assert.ok(Object.values(packages.netlist.netlist.modules.package_user.cells).some((cell) => cell.type === '$add'));
  results.push({ name: 'new multi-file package analyzed in request order', status: 'passed' });
  const sequential = await execute({
    ...novel,
    top: 'novel_counter',
    files: [
      {
        name: 'sequential.vhd',
        source:
          "library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity novel_counter is generic(W:positive:=5);port(clk,rst:in std_logic;q:out unsigned(W-1 downto 0));end;architecture rtl of novel_counter is signal count:unsigned(W-1 downto 0):=(others=>'0');begin process(clk)begin if rising_edge(clk)then if rst='1'then count<=(others=>'0');else count<=count+3;end if;end if;end process;q<=count;end;",
      },
    ],
  });
  assert.equal(sequential.status, 'success', sequential.logs);
  assert.equal(sequential.netlist.netlist.modules.novel_counter.ports.q.bits.length, 5);
  assert.ok(Object.values(sequential.netlist.netlist.modules.novel_counter.cells).some((cell) => /dff/i.test(cell.type)));
  results.push({ name: 'new generic numeric_std counter synthesizes actual storage cells (not a simulation test)', status: 'passed' });
  const rejected = await page.evaluate(async (request) => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) });
    const results = [];
    for (const change of [{ standard: '93' }, { standard: '19' }]) {
      const session = await executor.createSession({});
      try {
        await session.execute({ ...request, ...change }, {});
        results.push('unexpected success');
      } catch (error) {
        results.push(error.message);
      } finally {
        await session.dispose();
      }
    }
    return results;
  }, novel);
  assert.match(rejected[0], /2008/);
  assert.match(rejected[1], /2008/);
  assert.deepEqual(errors, []);
  assert.ok(network.every((request) => request.method === 'GET' && !request.body && new URL(request.url).origin === server.url));
  assert.equal(await page.evaluate(() => hdl.workers()), 0);
  assert.equal(results.length, 23);
  console.log('VHDL synthesis:', browser.version(), results.length, 'passed');
} finally {
  await mkdir('test-results/hdl-browser', { recursive: true });
  await writeFile(
    `test-results/hdl-browser/vhdl-synthesis-${browserName}${reportTag}.json`,
    JSON.stringify({ browser: browser.version(), candidate: process.env.HDL_GHDL_CANDIDATE ?? null, candidateHashes, results, errors, network }, null, 2),
  );
  await browser.close();
  await server.close();
}
