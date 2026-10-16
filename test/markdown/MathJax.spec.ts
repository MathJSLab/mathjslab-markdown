import { readFileSync } from 'node:fs';
import { TextEncoder, TextDecoder } from 'node:util';
import { MarkdownEngine } from '../../src/MarkdownEngine.js';

Object.assign(globalThis, { TextEncoder, TextDecoder });

describe('MathJax dynamic glyphs with the real renderer', () => {
  test.each(['pt', 'en', 'es'])(
    'renders every formula in the unchanged %s pendulum lesson',
    async (locale) => {
      const engine = new MarkdownEngine();
      const container = document.createElement('div');
      document.body.append(container);
      try {
        const source = readFileSync(new URL(`../../example/${locale}/pendulo-simples.md`, import.meta.url), 'utf8');
        const session = await engine.renderDocument(source, container);
        expect(container.querySelector('.mathjax-error, mjx-merror')).toBeNull();
        expect(container.querySelectorAll('mjx-container').length).toBeGreaterThanOrEqual(7);
        expect(container.querySelectorAll('mjx-container svg path').length).toBeGreaterThan(0);
        await session.dispose();
      } finally {
        await engine.dispose();
        container.remove();
      }
    },
    30_000,
  );
});
