import { TextEncoder } from 'node:util';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import { MarkdownEngine, type MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { hdlExtension } from '../../src/markdown/extensions/hdl/extension.js';
import { hdlInteractiveExtension } from '../../src/markdown/extensions/hdl-interactive/extension.js';
import { markdownHDLConfiguration } from '../../doc/integration/MarkdownHDLConfiguration.js';
Object.assign(globalThis, { TextEncoder });
const request = { top: 'gate', operation: 'simulate', files: [{ name: 'gate.v', source: 'module gate;endmodule' }] };
const live = { ...request, inputs: [], outputs: [{ name: 'y', width: 1 }], stepNs: 10 };
const source = (language: string, data: unknown) => '```' + language + '\n' + JSON.stringify(data) + '\n```';
const flush = () => new Promise((resolve) => setTimeout(resolve, 30));

describe('HDL availability and application integration', () => {
  test.each(['en', 'pt', 'es'])('all recognizes unavailable execution without presenting a running simulator: %s', async (locale) => {
    const engine = createEducationalMarkdownEngine({ features: 'all', executionPolicy: { hdl: { enabled: true }, 'hdl-interactive': { enabled: true } } });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    try {
      await engine.renderDocument(source('verilog-run', request) + '\n' + source('vhdl-live', live), container, { locale, onDiagnostic: (value) => diagnostics.push(value) });
      expect(diagnostics.map((value) => value.code)).toEqual(['hdl-executor-missing', 'hdl-executor-missing']);
      expect(container.querySelector('button')).toBeNull();
      expect(container.textContent).toContain('hdlExtension(executor)');
    } finally {
      await engine.dispose();
    }
  });
  test('explicit extension overrides the all fallback without duplicate registration; plain fences only highlight', async () => {
    let calls = 0;
    const engine = createEducationalMarkdownEngine({
      features: 'all',
      extensions: [
        hdlExtension({
          createSession: () => {
            calls++;
            return { execute: () => ({ status: 'success' }), dispose: () => {} };
          },
        }),
      ],
      executionPolicy: { hdl: { enabled: true } },
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(source('verilog', 'module gate;endmodule'), container);
      expect(calls).toBe(0);
      await engine.renderDocument(source('verilog-run', request), container);
      expect(calls).toBe(1);
    } finally {
      await engine.dispose();
    }
  });
  test.each([false, true])('unavailable capabilities prevent compiler/session creation: interactive=%s', async (interactive) => {
    let calls = 0;
    const executor = {
      capabilities: async () => ({
        languages: { vhdl: { simulate: false, synthesize: false, interactive: false as const }, verilog: { simulate: false, synthesize: false, interactive: false as const } },
        tools: { ghdl: { available: false }, iverilog: { available: false }, vvp: { available: false } },
      }),
      createSession: () => {
        calls++;
        throw new Error('must not execute');
      },
      createInteractiveSession: () => {
        calls++;
        throw new Error('must not execute');
      },
    };
    const engine = new MarkdownEngine({
      extensions: [interactive ? hdlInteractiveExtension(executor) : hdlExtension(executor)],
      executionPolicy: { hdl: { enabled: true }, 'hdl-interactive': { enabled: true } },
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(source(interactive ? 'verilog-live' : 'verilog-run', interactive ? live : request), container);
      if (interactive) {
        container.querySelector<HTMLButtonElement>('[data-hdl-action=step]')!.click();
        await flush();
      }
      expect(calls).toBe(0);
      expect(container.textContent).toContain('iverilog');
      expect(container.textContent).toContain('GET /capabilities');
    } finally {
      await engine.dispose();
    }
  });
  test('authorization is checked before capability discovery', async () => {
    let calls = 0;
    const engine = new MarkdownEngine({
      extensions: [
        hdlExtension({
          capabilities: async () => {
            calls++;
            throw new Error('unexpected');
          },
          createSession: () => {
            throw new Error('unexpected');
          },
        }),
      ],
    });
    try {
      await engine.renderDocument(source('verilog-run', request), document.createElement('div'));
      expect(calls).toBe(0);
    } finally {
      await engine.dispose();
    }
  });
  test.each(['production', 'development'])('drop-in app candidate shows blocked fences with absent configuration: %s', async (environment) => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = environment;
    window.sessionStorage.removeItem('mathjslab.hdl.backend');
    const configuration = markdownHDLConfiguration();
    const engine = new MarkdownEngine(configuration);
    const container = document.createElement('div');
    try {
      await engine.renderDocument(source('verilog-live', live), container);
      expect(container.querySelector('[role=alert]')).not.toBeNull();
      expect(container.querySelector('button')).toBeNull();
      expect(configuration.executionPolicy).toEqual({});
    } finally {
      await engine.dispose();
      process.env.NODE_ENV = previous;
    }
  });
  test('drop-in app candidate validates loopback credentials and preserves the production boundary', () => {
    const previous = process.env.NODE_ENV;
    const settings = { enabled: true, endpoint: 'http://127.0.0.1:8787/hdl', token: 'a'.repeat(64) };
    try {
      process.env.NODE_ENV = 'development';
      window.sessionStorage.setItem('mathjslab.hdl.backend', JSON.stringify(settings));
      expect(markdownHDLConfiguration().executionPolicy).toEqual({ hdl: { enabled: true }, 'hdl-interactive': { enabled: true } });
      process.env.NODE_ENV = 'production';
      expect(markdownHDLConfiguration().executionPolicy).toEqual({});
      process.env.NODE_ENV = 'development';
      for (const data of [
        { ...settings, token: '' },
        { ...settings, endpoint: 'https://external.test/hdl' },
        { ...settings, enabled: false },
      ]) {
        window.sessionStorage.setItem('mathjslab.hdl.backend', JSON.stringify(data));
        const configuration = markdownHDLConfiguration();
        expect(configuration.executionPolicy).toEqual({});
        expect(configuration.extensions.map((extension) => extension.name)).toEqual(['hdl', 'hdl-interactive']);
      }
    } finally {
      process.env.NODE_ENV = previous;
      window.sessionStorage.removeItem('mathjslab.hdl.backend');
    }
  });
});
