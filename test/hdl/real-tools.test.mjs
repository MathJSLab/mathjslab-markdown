import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { createNativeHDLExecutor, createHDLHTTPHandler } from '../../dist/source/markdown-hdl-node.js';
import { createHTTPHDLExecutor } from '../../dist/source/markdown-hdl.js';
import { parseVCD, vcdValueAt } from '../../dist/source/markdown/extensions/vcd/parser.js';
import { hdlToolOptions } from '../../script/helper/hdl-tool-options.mjs';

const tools = hdlToolOptions();
const directory = await mkdtemp(path.join(tmpdir(), 'hdl-real-tests-'));
const executor = createNativeHDLExecutor({ allowNativeExecution: true, ...tools, temporaryDirectory: directory });
const extract = async (lesson, locale, family) => {
  const source = await readFile(new URL(`../../example/${locale}/${lesson}.md`, import.meta.url), 'utf8');
  return [...source.matchAll(new RegExp('```(vhdl|verilog)-' + family + '[^\\n]*\\n([\\s\\S]*?)\\n```', 'g'))].map((match) => ({ language: match[1], ...JSON.parse(match[2]) }));
};
const output = (vcd, name) => {
  const recording = parseVCD(vcd);
  const signal = recording.signals.find((signal) => signal.name === name);
  assert.ok(signal, name);
  return vcdValueAt(signal, recording.endTime);
};

test.after(async () => {
  assert.deepEqual(await readdir(directory), [], 'all compiler work directories released');
  await rm(directory, { recursive: true, force: true });
});

test('required real toolchains are available (no mock or silent skip)', async () => {
  const capabilities = await executor.capabilities();
  console.log(JSON.stringify(Object.fromEntries(Object.entries(capabilities.tools).map(([name, tool]) => [name, { ...tool, version: tool.version?.split(/\r?\n/)[0] }])), null, 2));
  for (const language of ['vhdl', 'verilog']) {
    assert.equal(capabilities.languages[language].simulate, true, `Install ${language} simulator or set HDL_* paths`);
    assert.equal(capabilities.languages[language].synthesize, true, 'Install Yosys or set HDL_YOSYS');
    assert.equal(capabilities.languages[language].interactive, 'replay');
  }
});

for (const language of ['vhdl', 'verilog'])
  test(`real ${language} produces ordered log/VCD updates matching the final result`, async () => {
    const request = (await extract('hdl-porta-and', 'en', 'run')).find((value) => value.language === language);
    const session = await executor.createSession({}),
      events = [];
    try {
      const result = await session.execute(request, { onHDLUpdate: (event) => events.push(event) });
      assert.equal(result.status, 'success');
      assert.ok(events.some((event) => event.type === 'progress'));
      assert.equal(
        events
          .filter((event) => event.type === 'log')
          .map((event) => event.text)
          .join(''),
        result.logs,
      );
      assert.equal(
        events
          .filter((event) => event.type === 'vcd')
          .map((event) => event.text)
          .join(''),
        result.vcd,
      );
      parseVCD(result.vcd);
    } finally {
      await session.dispose();
    }
  });

test('replay does not commit time/history when its incremental observer rejects the checkpoint', async () => {
  const request = (await extract('hdl-live-and', 'en', 'live')).find((value) => value.language === 'verilog');
  const session = await executor.createInteractiveSession(request, {});
  const inputs = Object.fromEntries(request.inputs.map((input) => [input.name, input.initial]));
  try {
    await assert.rejects(
      session.step(
        { advanceNs: request.stepNs, inputs },
        {
          onHDLUpdate: (event) => {
            if (event.type === 'vcd') throw new Error('observer failed');
          },
        },
      ),
      /observer failed/,
    );
    const retry = await session.step({ advanceNs: request.stepNs, inputs }, {});
    assert.equal(retry.timeNs, request.stepNs);
  } finally {
    await session.dispose();
  }
});

for (const locale of ['en', 'pt', 'es'])
  for (const lesson of ['hdl-porta-and', 'hdl-multiplexador', 'hdl-somador', 'hdl-contador']) {
    test(`real compilers: ${locale}/${lesson}`, async () => {
      for (const request of await extract(lesson, locale, 'run')) {
        const session = await executor.createSession({});
        try {
          const result = await session.execute(request, {});
          assert.equal(result.status, 'success', `${request.language}: ${result.logs}`);
          if (request.operation === 'simulate') {
            assert.ok(parseVCD(result.vcd).signals.length);
            if (lesson === 'hdl-porta-and') assert.equal(output(result.vcd, 'tb.y'), '1');
          } else {
            const module = result.netlist.netlist.modules[request.top];
            assert.ok(Object.keys(module.ports).length);
            assert.ok(Object.keys(module.cells).length);
          }
        } finally {
          await session.dispose();
        }
      }
    });
  }

for (const lesson of ['hdl-live-and', 'hdl-live-mux', 'hdl-live-counter', 'hdl-live-register']) {
  test(`real interactive HDL: ${lesson} preserves input history and sequential state`, async () => {
    for (const request of await extract(lesson, 'en', 'live')) {
      const session = await executor.createInteractiveSession(request, {});
      try {
        const initial = Object.fromEntries(request.inputs.map((input) => [input.name, input.initial]));
        const first = await session.step({ advanceNs: 10, inputs: initial }, {});
        assert.equal(first.timeNs, 10);
        const secondInputs =
          lesson === 'hdl-live-and'
            ? { a: '1', b: '1' }
            : lesson === 'hdl-live-counter'
              ? { rst: '0' }
              : lesson === 'hdl-live-register'
                ? { d: '1010', enable: '0' }
                : { ...initial, s: '1' };
        const second = await session.step({ advanceNs: 10, inputs: secondInputs }, {});
        const third = await session.step({ advanceNs: 10, inputs: secondInputs }, {});
        assert.equal(third.timeNs, 30);
        assert.ok(parseVCD(third.vcd).signals.length);
        if (lesson === 'hdl-live-and') assert.equal(second.values.y, '1');
        if (lesson === 'hdl-live-mux') assert.equal(second.values.y, '1010');
        if (lesson === 'hdl-live-counter') {
          assert.equal(first.values.q, '0000');
          assert.equal(second.values.q, '0001');
          assert.equal(third.values.q, '0010');
        }
        if (lesson === 'hdl-live-register') {
          assert.equal(first.values.q, '0101');
          assert.equal(second.values.q, '0101');
          assert.equal(third.values.q, '0101');
        }
      } finally {
        await session.dispose();
      }
      const reset = await executor.createInteractiveSession(request, {});
      try {
        const again = await reset.step({ advanceNs: 10, inputs: Object.fromEntries(request.inputs.map((input) => [input.name, input.initial])) }, {});
        assert.equal(again.timeNs, 10);
        if (lesson === 'hdl-live-counter') assert.equal(again.values.q, '0000');
      } finally {
        await reset.dispose();
      }
    }
  });
}

test('real compilation errors include source locations and changed source changes behavior', async () => {
  for (const language of ['vhdl', 'verilog']) {
    const session = await executor.createSession({});
    try {
      const result = await session.execute(
        { language, operation: 'simulate', top: 'broken', files: [{ name: language === 'vhdl' ? 'broken.vhd' : 'broken.sv', source: 'this is not HDL;' }] },
        {},
      );
      assert.equal(result.status, 'error');
      assert.ok(result.diagnostics.some((diagnostic) => diagnostic.file?.startsWith('broken.') && diagnostic.line > 0));
    } finally {
      await session.dispose();
    }
    const request = (await extract('hdl-live-and', 'en', 'live')).find((request) => request.language === language);
    request.files[0].source = request.files[0].source.replace(language === 'vhdl' ? 'a and b' : 'a&b', language === 'vhdl' ? 'a or b' : 'a|b');
    const interactive = await executor.createInteractiveSession(request, {});
    try {
      assert.equal((await interactive.step({ advanceNs: 10, inputs: { a: '0', b: '1' } }, {})).values.y, '1');
    } finally {
      await interactive.dispose();
    }
  }
});

test('real replay preserves four-state vectors and VHDL case-insensitive port matching', async () => {
  for (const language of ['vhdl', 'verilog']) {
    const source =
      language === 'vhdl'
        ? 'library ieee;use ieee.std_logic_1164.all;entity buffer4 is port(A:in std_logic_vector(3 downto 0);Y:out std_logic_vector(3 downto 0));end;architecture rtl of buffer4 is begin Y<=A;end;'
        : 'module buffer4(input[3:0]A,output[3:0]Y);assign Y=A;endmodule';
    const session = await executor.createInteractiveSession(
      {
        language,
        operation: 'simulate',
        top: 'buffer4',
        files: [{ name: language === 'vhdl' ? 'buffer.vhd' : 'buffer.sv', source }],
        inputs: [{ name: 'A', width: 4, initial: 'xz10' }],
        outputs: [{ name: 'Y', width: 4 }],
        stepNs: 10,
      },
      {},
    );
    try {
      assert.equal((await session.step({ advanceNs: 10, inputs: { A: 'xz10' } }, {})).values.Y, 'xz10');
    } finally {
      await session.dispose();
    }
  }
});

test('replay includes target-time clock edges without rewriting previous edge inputs', async () => {
  for (const language of ['vhdl', 'verilog']) {
    const source =
      language === 'vhdl'
        ? "library ieee;use ieee.std_logic_1164.all;use ieee.numeric_std.all;entity edge_counter is port(rst:in std_logic;q:out std_logic_vector(3 downto 0));end;architecture rtl of edge_counter is signal clk:std_logic:='0';signal count:unsigned(3 downto 0):=(others=>'0');begin clk<=not clk after 10 ns;q<=std_logic_vector(count);process(clk)begin if rising_edge(clk)then if rst='1'then count<=(others=>'0');else count<=count+1;end if;end if;end process;end;"
        : 'module edge_counter(input rst,output reg[3:0]q=0);reg clk=0;always #10 clk=~clk;always @(posedge clk)if(rst)q<=0;else q<=q+1;endmodule';
    const session = await executor.createInteractiveSession(
      {
        language,
        operation: 'simulate',
        top: 'edge_counter',
        files: [{ name: language === 'vhdl' ? 'counter.vhd' : 'counter.sv', source }],
        inputs: [{ name: 'rst', width: 1, initial: '0' }],
        outputs: [{ name: 'q', width: 4 }],
        stepNs: 10,
      },
      {},
    );
    try {
      const first = await session.step({ advanceNs: 10, inputs: { rst: '0' } }, {});
      assert.equal(first.values.q, '0001', language + ' includes edge at 10 ns');
      const second = await session.step({ advanceNs: 10, inputs: { rst: '1' } }, {});
      assert.equal(second.values.q, '0001', language + ' preserves old input at preceding edge');
      const third = await session.step({ advanceNs: 10, inputs: { rst: '1' } }, {});
      assert.equal(third.values.q, '0000');
      const recording = parseVCD(first.vcd);
      assert.ok(recording.endTime * recording.timescale.magnitude * (recording.timescale.unit === 'fs' ? 1e-6 : recording.timescale.unit === 'ps' ? 1e-3 : 1) <= 10);
    } finally {
      await session.dispose();
    }
  }
});

test('real simulator timeout terminates the process and releases files', async () => {
  const bounded = createNativeHDLExecutor({ allowNativeExecution: true, ...tools, temporaryDirectory: directory, timeoutMs: 2000 });
  const session = await bounded.createSession({});
  try {
    const result = await session.execute(
      { language: 'verilog', operation: 'simulate', top: 'tb', files: [{ name: 'tb.sv', source: 'module tb;reg clk=0;initial forever begin #0;clk=~clk;end endmodule' }] },
      {},
    );
    assert.equal(result.status, 'error');
    assert.match(result.logs, /vvp(?:\.exe)? timed out/);
  } finally {
    await session.dispose();
  }
});

test('browser HTTP contract reaches real simulators for batch and interactive requests', async () => {
  const token = 'b'.repeat(64);
  const handler = createHDLHTTPHandler(executor, { token, allowedOrigins: ['http://localhost:8080'] });
  const server = createServer((request, response) => {
    void handler.handle(request, response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const client = createHTTPHDLExecutor({ endpoint: `http://127.0.0.1:${server.address().port}/hdl`, token });
    assert.equal((await client.capabilities()).languages.vhdl.simulate, true);
    for (const request of await extract('hdl-porta-and', 'en', 'run')) {
      const session = await client.createSession({});
      try {
        const result = await session.execute(request, {});
        assert.equal(result.status, 'success', result.logs);
        assert.equal(output(result.vcd, 'tb.y'), '1');
      } finally {
        await session.dispose();
      }
    }
    for (const request of await extract('hdl-live-and', 'en', 'live')) {
      const session = await client.createInteractiveSession(request, {});
      try {
        assert.equal((await session.step({ advanceNs: 10, inputs: { a: '1', b: '1' } }, {})).values.y, '1');
      } finally {
        await session.dispose();
      }
    }
  } finally {
    await handler.dispose();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Markdown controls render real HDL over HTTP, inspect results and release sessions', async () => {
  const dom = new JSDOM('<!doctype html>', { url: 'http://localhost:8080' });
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'HTMLElement', 'Element', 'Node', 'DOMParser']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  const token = 'c'.repeat(64);
  const handler = createHDLHTTPHandler(executor, { token, allowedOrigins: ['http://localhost:8080'] });
  const server = createServer((request, response) => {
    void handler.handle(request, response);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let engine;
  try {
    const { MarkdownEngine } = await import('../../dist/source/MarkdownEngine.js');
    const { hdlExtension } = await import('../../dist/source/markdown/extensions/hdl/extension.js');
    const { hdlInteractiveExtension } = await import('../../dist/source/markdown/extensions/hdl-interactive/extension.js');
    const client = createHTTPHDLExecutor({ endpoint: `http://127.0.0.1:${server.address().port}/hdl`, token });
    engine = new MarkdownEngine({
      extensions: [hdlExtension(client), hdlInteractiveExtension(client)],
      securityMode: 'strict',
      executionPolicy: { hdl: { enabled: true, allowInRestrictedMode: true }, 'hdl-interactive': { enabled: true, allowInRestrictedMode: true } },
    });
    const container = document.createElement('div');
    const diagnostics = [];
    const artifacts = [];
    let documentSession = await engine.renderDocument(await readFile(new URL('../../example/en/hdl-porta-and.md', import.meta.url), 'utf8'), container, {
      onHDLExport: (artifact) => artifacts.push(artifact),
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    assert.equal(container.querySelectorAll('.vcd-viewer svg').length, 2);
    container.querySelector('.vcd-viewer [data-hdl-export=vcd]').click();
    assert.ok(parseVCD(artifacts.at(-1).text).signals.length);
    container.querySelector('.hdl-execution > .hdl-exports [data-hdl-export=json]').click();
    assert.equal(JSON.parse(artifacts.at(-1).text).result.status, 'success');
    await documentSession.dispose();
    documentSession = await engine.renderDocument(await readFile(new URL('../../example/en/hdl-somador.md', import.meta.url), 'utf8'), container, {
      onHDLExport: (artifact) => artifacts.push(artifact),
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    assert.equal(container.querySelectorAll('.netlist svg').length, 2);
    await documentSession.dispose();
    documentSession = await engine.renderDocument(await readFile(new URL('../../example/en/hdl-live-and.md', import.meta.url), 'utf8'), container, {
      onHDLExport: (artifact) => artifacts.push(artifact),
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    const wait = async (predicate) => {
      for (let i = 0; i < 200 && !predicate(); i++) await new Promise((resolve) => setTimeout(resolve, 20));
      assert.ok(predicate(), container.textContent);
    };
    for (const frame of container.querySelectorAll('.hdl-interactive')) {
      frame.querySelector('[data-hdl-action=step]').click();
      await wait(() => frame.getAttribute('data-hdl-time') === '10');
      assert.equal(frame.querySelector('table').rows[1].cells[1].textContent, '0');
      frame.querySelector('fieldset select').value = '1';
      frame.querySelector('[data-hdl-action=step]').click();
      await wait(() => frame.getAttribute('data-hdl-time') === '20');
      assert.equal(frame.querySelector('table').rows[1].cells[1].textContent, '1');
      assert.ok(frame.querySelector('svg'));
      frame.querySelector('[data-hdl-action=reset]').click();
      await wait(() => frame.getAttribute('data-hdl-time') === '0');
    }
    await documentSession.dispose();
    documentSession = await engine.renderDocument(await readFile(new URL('../../example/en/hdl-stimuli-checks.md', import.meta.url), 'utf8'), container, {
      onHDLExport: (artifact) => artifacts.push(artifact),
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    for (const frame of container.querySelectorAll('.hdl-interactive')) {
      frame.querySelector('[data-hdl-action=run]').click();
      await wait(() => frame.getAttribute('data-hdl-time') === '12');
      assert.equal(frame.querySelectorAll('[data-status=passed]').length, 2, frame.textContent);
      frame.querySelector(':scope > .hdl-exports [data-hdl-export=json]').click();
      assert.ok(JSON.parse(artifacts.at(-1).text).checks.every((check) => check.status === 'passed'));
      assert.equal(frame.querySelector('[data-hdl-action=run]').disabled, true);
      frame.querySelector('[data-hdl-action=reset]').click();
      await wait(() => frame.getAttribute('data-hdl-time') === '0');
      assert.equal(frame.querySelectorAll('[data-status=pending]').length, 2);
    }
    assert.deepEqual(
      diagnostics.filter((diagnostic) => diagnostic.severity === 'error'),
      [],
    );
    await documentSession.dispose();
    assert.equal(container.querySelector('button'), null);
  } finally {
    await engine?.dispose();
    await handler.dispose();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
