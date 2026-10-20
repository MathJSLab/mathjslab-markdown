import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { serveStatic } from './static-server.mjs';
const { chromium } = await import(process.env.HDL_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.HDL_PLAYWRIGHT_MODULE).href : 'playwright-core');
const server = await serveStatic();
const browser = await chromium.launch({ executablePath: process.env.HDL_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
const network = [],
  errors = [];
page.on('request', (r) => network.push({ url: r.url(), method: r.method(), body: r.postData() }));
page.on('pageerror', (e) => errors.push(String(e)));
try {
  await page.goto(server.url + '/test/hdl-browser/index.html');
  await page.waitForFunction(() => !!window.hdl);
  const results = await page.evaluate(async (assetsURL) => {
    const executor = hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL(assetsURL, location.href) });
    const results = [];
    for (const [name, source] of [
      [
        'counter',
        '`timescale 1ns/1ps\nmodule probe; reg clk=0; reg [3:0] count=0; always #2 clk=~clk; always @(posedge clk) count<=count+1; initial begin #15; if(count!==4) $fatal(1,"counter mismatch"); $display("CHECK_COUNTER_OK"); end endmodule',
      ],
      [
        'states',
        '`timescale 1ns/1ps\nmodule probe; reg a=0; wire y=a; initial begin #2 a=1; #2 a=1\'bx; #2 a=1\'bz; #2; if(y!==1\'bz) $fatal(1,"state mismatch"); $display("CHECK_STATES_OK"); end endmodule',
      ],
      [
        'math',
        '`timescale 1ns/1ps\nmodule probe; reg[7:0] sample=0; integer bits=0; initial begin #5 sample=81; bits=$countones(sample); if($sqrt(sample)!=9.0 || bits!=3) $fatal(1,"first runtime math mismatch"); #3 sample=144; bits=$countones(sample); if($sqrt(sample)!=12.0 || bits!=2) $fatal(1,"second runtime math mismatch"); #3; $display("CHECK_MATH_OK"); end endmodule',
      ],
      ['invalid', 'module probe; THIS IS NOT VALID; endmodule'],
    ]) {
      const session = await executor.createSession({});
      try {
        const result = await session.execute({ language: 'verilog', operation: 'simulate', top: 'probe', stopTimeNs: 19, files: [{ name: 'probe.sv', source }] }, {});
        let trace;
        if (result.status === 'success') {
          const model = hdl.parseVCD(result.vcd);
          trace = { endTime: model.endTime, signals: model.signals.map((signal) => ({ name: signal.name, changes: signal.changes, final: hdl.vcdValueAt(signal, model.endTime) })) };
        }
        results.push({ name, result, trace });
      } finally {
        await session.dispose();
      }
    }
    return { cases: results, workers: hdl.workers() };
  }, process.env.HDL_ASSETS_URL || '/dist/browser/hdl/');
  await mkdir('test-results/hdl-browser', { recursive: true });
  await writeFile(
    'test-results/hdl-browser/verilog-runtime-' + (process.env.HDL_BROWSER?.includes('msedge') ? 'msedge' : 'chrome') + '.json',
    JSON.stringify({ browser: browser.version(), results, network, errors }, null, 2),
  );
  assert.equal(results.workers, 0);
  for (const item of results.cases) {
    console.log('PASS', item.name);
    assert.equal(item.result.status, item.name === 'invalid' ? 'error' : 'success');
    if (item.name !== 'invalid') assert.match(item.result.logs, /CHECK_.*_OK/);
    if (item.trace) assert.equal(item.trace.endTime, 19_000_000);
    if (item.name === 'counter') assert.equal(item.trace.signals.find((s) => s.name === 'probe.count[3:0]').final, '0101');
    if (item.name === 'states')
      assert.deepEqual(
        item.trace.signals.find((s) => s.name === 'probe.y').changes.map((c) => c.value),
        ['0', '1', 'x', 'z'],
      );
    if (item.name === 'math') {
      assert.equal(item.trace.signals.find((s) => s.name === 'probe.bits[31:0]').final, '00000000000000000000000000000010');
      assert.equal(item.trace.signals.find((s) => s.name === 'probe.sample[7:0]').final, '10010000');
      assert.deepEqual(
        item.trace.signals.find((s) => s.name === 'probe.bits[31:0]').changes.map((c) => c.time),
        [0, 5_000_000, 8_000_000],
      );
    }
    if (item.name === 'invalid') assert.ok(item.result.diagnostics.some((d) => d.file === 'probe.sv' && d.line === 1));
  }
  assert.equal(errors.length, 0);
  assert.ok(network.every((r) => r.method === 'GET' && !r.body && new URL(r.url).origin === server.url));
  console.log('PASS Verilog runtime browser probes', browser.version(), network.length);
} finally {
  await browser.close();
  await server.close();
}
