import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright-core';
import { serveStatic } from './static-server.mjs';

const digest = async (root, prefix = '') => {
  const files = {};
  for (const item of await readdir(root, { withFileTypes: true })) {
    const name = prefix + item.name;
    if (item.isDirectory()) Object.assign(files, await digest(path.join(root, item.name), name + '/'));
    else
      files[name] = createHash('sha256')
        .update(await readFile(path.join(root, item.name)))
        .digest('hex');
  }
  return files;
};
const frozen = await digest('assets/hdl');
assert.deepEqual(await digest('dist/browser/hdl'), frozen);
const server = await serveStatic();
const browser = await chromium.launch({ executablePath: process.env.HDL_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const browserName = path.basename(process.env.HDL_BROWSER ?? 'chrome', '.exe');
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
const network = [],
  errors = [],
  cases = [];
page.on('request', (r) => network.push({ url: r.url(), method: r.method(), body: r.postData() }));
page.on('pageerror', (e) => errors.push(e.message));
const ansi = /[\x00-\x08\x0b-\x1f\x7f-\x9f]/;
const lesson = async (locale, name, language, live = false) => {
  const text = await readFile(`example/${locale}/${name}.md`, 'utf8');
  const match = new RegExp('```' + language + (live ? '-live' : '-run') + '[^\\n]*\\n([\\s\\S]*?)\\n```').exec(text);
  return { language, ...JSON.parse(match[1]) };
};
const mount = async (request, locale = 'pt') => page.evaluate(({ request, locale }) => hdl.mountBatch(request, locale), { request, locale });
const exported = async (type) => {
  await page.locator(`#lesson > .hdl-exports [data-hdl-export=${type}]`).click();
  return page.evaluate(() => hdl.exports.at(-1));
};
const inspect = async (name, status = 'success') => {
  const details = page.locator('#lesson > details.hdl-log-details');
  assert.equal(await page.locator(`#lesson > [data-hdl-status=${status}]`).count(), 1);
  assert.equal(await details.evaluate((e) => e.open), status !== 'success');
  assert.equal(await page.locator('#lesson .hdl-logs').count(), 1);
  const text = await details.locator('.hdl-logs').textContent();
  assert.ok(!ansi.test(text), 'clean log');
  const txt = await exported('txt');
  assert.equal(txt.text, text);
  const json = JSON.parse((await exported('json')).text);
  assert.equal(json.result.logs, text);
  assert.ok(!ansi.test(JSON.stringify(json.result.diagnostics ?? [])));
  if (status === 'success') {
    const svg = page.locator('#lesson .netlist svg').first();
    assert.ok(await svg.isVisible());
    assert.equal(await details.evaluate((e) => !!e.previousElementSibling?.querySelector('svg')), true);
    await details.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await details.evaluate((e) => e.open), true);
    assert.ok(await details.locator('.hdl-logs').isVisible());
    await details.locator('summary').click();
    assert.equal(await details.evaluate((e) => e.open), false);
    const svgExport = page.locator('#lesson .netlist [data-hdl-export=svg]');
    await svgExport.click();
    assert.ok((await page.evaluate(() => hdl.exports.at(-1))).text.includes('<svg'));
  }
  cases.push({ name, status: 'passed', logLength: text.length });
  console.log('PASS', name);
};
await mkdir('test-results/hdl-browser', { recursive: true });
try {
  await page.goto(server.url + '/test/hdl-browser/index.html');
  await page.waitForFunction(() => !!window.hdl);
  if (process.env.HDL_PUBLISHED_BASELINE) {
    const request = await lesson('pt', 'hdl-multiplexador', 'vhdl');
    const baseline = await page.evaluate(
      async ({ request, url }) => {
        const { hdlExtension } = await import(url);
        const extension = hdlExtension(hdl.createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) }));
        const node = document.querySelector('#lesson');
        const { language, ...data } = request;
        await extension.fences
          .find((f) => f.language === 'vhdl-run')
          .render(node, JSON.stringify(data), { locale: 'pt', securityMode: 'trusted', executionPolicy: { hdl: { enabled: true } } });
        const log = node.querySelector('.hdl-logs'),
          visual = node.querySelector('.netlist');
        const result = {
          ansi: /\x1b\[/.test(log.textContent),
          logsBeforeDiagram: !!(log.compareDocumentPosition(visual) & Node.DOCUMENT_POSITION_FOLLOWING),
          svg: !!visual.querySelector('svg'),
        };
        await extension.dispose();
        return result;
      },
      { request, url: process.env.HDL_PUBLISHED_BASELINE },
    );
    assert.deepEqual(baseline, { ansi: true, logsBeforeDiagram: true, svg: true });
    cases.push({ name: 'published 0.7.1 baseline: valid synthesis with raw ANSI log before schematic', status: 'passed' });
  }
  for (const locale of ['pt', 'en', 'es'])
    for (const language of ['vhdl', 'verilog']) {
      await mount(await lesson(locale, 'hdl-multiplexador', language), locale);
      await inspect(`${locale}/${language} mux: status, schematic first, keyboard details, normalized TXT/JSON/SVG`);
      if (locale === 'pt' && language === 'vhdl') {
        await page.screenshot({ path: `test-results/hdl-browser/presentation-${browserName}-desktop.png` });
        await page.setViewportSize({ width: 360, height: 780 });
        await page.locator('#lesson > details summary').click();
        assert.equal(await page.locator('#lesson > details').evaluate((e) => e.scrollWidth <= e.clientWidth + 1), true);
        await page.screenshot({ path: `test-results/hdl-browser/presentation-${browserName}-mobile.png` });
        await page.setViewportSize({ width: 1100, height: 800 });
      }
      await page.evaluate(() => hdl.unmount());
    }
  for (const language of ['vhdl', 'verilog']) {
    const request = {
      language,
      operation: 'synthesize',
      top: 'fresh',
      standard: language === 'vhdl' ? '08' : '2012',
      files: [
        {
          name: language === 'vhdl' ? 'fresh.vhd' : 'fresh.sv',
          source:
            language === 'vhdl'
              ? 'library ieee; use ieee.std_logic_1164.all; entity fresh is port(a,b:in std_logic_vector(2 downto 0); y:out std_logic_vector(2 downto 0));end; architecture rtl of fresh is begin y <= not(a xor b);end;'
              : 'module fresh(input [2:0] a,b,output [2:0] y); assign y=~(a^b); endmodule',
        },
      ],
    };
    await mount(request);
    await inspect(`${language} novel XNOR source compiled and synthesized`);
    await mount({
      ...request,
      files: [{ name: request.files[0].name, source: language === 'vhdl' ? 'entity fresh is\n port(a: in std_logic);\n nonsense; end;' : 'module fresh;\n assign y = ;\nendmodule' }],
    });
    await inspect(`${language} real compiler error diagnostics and TXT/JSON`, 'error');
    assert.match(await page.locator('#lesson > details').textContent(), /fresh\.(vhd|sv):/);
    await mount(await lesson('pt', 'hdl-contador', language));
    assert.ok(await page.locator('#lesson .vcd svg').isVisible());
    assert.equal(await page.locator('#lesson > details').evaluate((e) => e.open), false);
    await exported('txt');
    cases.push({ name: `${language} batch simulation presentation`, status: 'passed' });
    await page.evaluate(({ request }) => hdl.mount(request, 'pt'), { request: await lesson('pt', 'hdl-live-and', language, true) });
    await page.locator('[data-hdl-action=step]').click();
    await page.waitForFunction(() => document.querySelector('#lesson [data-hdl-export=json]')?.disabled === false);
    assert.ok(await page.locator('#lesson .vcd-viewer svg').isVisible());
    assert.equal(await page.locator('#lesson > details').evaluate((e) => e.open), false);
    await page.locator('#lesson > details summary').click();
    assert.equal(await page.locator('#lesson > details').evaluate((e) => e.open), true);
    await page.locator('[data-hdl-action=reset]').click();
    await page.waitForFunction(() => !document.querySelector('#lesson .vcd-viewer svg'));
    assert.equal(await page.locator('#lesson > details').evaluate((e) => e.open), false);
    await page.evaluate(() => hdl.unmount());
    assert.equal(await page.evaluate(() => hdl.workers()), 0);
    cases.push({ name: `${language} interactive step/reset/details/disposal`, status: 'passed' });
  }
  assert.equal(await page.evaluate(() => crossOriginIsolated), false);
  assert.deepEqual(errors, []);
  assert.ok(network.every((r) => new URL(r.url).origin === server.url && r.method === 'GET' && !r.body));
  assert.deepEqual(await digest('assets/hdl'), frozen);
  assert.deepEqual(await digest('dist/browser/hdl'), frozen);
  await writeFile(`test-results/hdl-browser/presentation-${browserName}.json`, JSON.stringify({ browser: await browser.version(), cases, network, errors, assetHashes: frozen }, null, 2));
  console.log('PASS', cases.length, 'presentation checks; static GETs only; compiler assets unchanged');
} finally {
  await browser.close();
  await server.close();
}
