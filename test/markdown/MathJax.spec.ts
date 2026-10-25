import { readFileSync } from 'node:fs';
import { TextEncoder, TextDecoder } from 'node:util';
import { MarkdownEngine } from '../../src/MarkdownEngine.js';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';

Object.assign(globalThis, { TextEncoder, TextDecoder });

describe('MathJax dynamic glyphs with the real renderer', () => {
  test.each(['trusted', 'sanitized', 'strict'] as const)(
    'preserves Boolean mathematics and warnings in %s mode',
    async (securityMode) => {
      const engine = createEducationalMarkdownEngine({
        features: ['didactic', 'cross-references'],
        securityMode,
        ...(securityMode === 'strict' ? { allowedCapabilities: ['interactive'] } : {}),
      });
      const container = document.createElement('div');
      document.body.append(container);
      const first = String.raw`Y=A\overline B`;
      const second = 'Y=A';
      const logical = String.raw`F_1=\overline{A}\land B\lor\neg C\oplus D`;
      const display = String.raw`F_2=\overline{A+B}=\bar A\cdot\bar B`;
      const source = `Uma implementação possível é $${first}$. Outra é $${second}$.\n\n::: warning Assumptions {#assumptions}\n\n$${logical}$\n\n$$${display}$$\n\n$$\n${first}\n$$\n\n:::\n\nSee {@ref assumptions}.\n\n\`$Y=A$\``;
      try {
        // Parsing emits inert source placeholders; rendering performs typesetting.
        expect(engine.parse(source)).not.toContain('<svg');
        await engine.renderDocument(source, container);
        expect(container.querySelector('.mathjax-error, mjx-merror')).toBeNull();
        const formulas = Array.from(container.querySelectorAll('.mathjax-pending'));
        expect(formulas).toHaveLength(5);
        for (const [index, latex] of [first, second, logical, display, first].entries()) {
          const formula = formulas[index]!;
          expect(formula.hasAttribute('data-mathjax-rendered')).toBe(true);
          expect(formula.querySelector('[data-mml-node="math"]')?.getAttribute('data-latex')).toBe(latex);
          expect(formula.querySelector('svg path, svg use')).not.toBeNull();
          expect(formula.querySelector('svg')?.getAttribute('viewBox')).toMatch(/\S+ \S+ \S+ \S+/);
          expect(formula.textContent).not.toContain('svg');
          for (const use of formula.querySelectorAll('svg use')) {
            const href = use.getAttribute('xlink:href') ?? use.getAttribute('href');
            expect(href).toMatch(/^#.+/);
            expect(document.getElementById(href!.slice(1))?.tagName.toLowerCase()).toBe('path');
          }
        }
        expect(formulas[0]!.querySelector('[data-mml-node="mover"]')?.getAttribute('data-latex')).toBe(String.raw`\overline B`);
        expect(Array.from(formulas[0]!.querySelectorAll('[data-mml-node="mi"]'), (node) => node.getAttribute('data-latex'))).toEqual(['Y', 'A', 'B']);
        expect(formulas[1]!.querySelector('[data-mml-node="mover"]')).toBeNull();
        expect(formulas[2]!.querySelector('[data-mml-node="msub"]')?.getAttribute('data-latex')).toBe('F_1');
        expect(Array.from(formulas[2]!.querySelectorAll('[data-mml-node="mo"]'), (node) => node.getAttribute('data-latex'))).toEqual(
          expect.arrayContaining([String.raw`\land`, String.raw`\lor`, String.raw`\oplus`]),
        );
        expect(formulas[2]!.querySelector('use[data-c="AC"], path[data-c="AC"]')).not.toBeNull();
        expect(formulas[3]!.querySelector('mjx-container')?.getAttribute('display')).toBe('true');
        expect(formulas[4]!.querySelector('mjx-container')?.getAttribute('display')).toBe('true');
        expect(container.querySelector('.markdown-warning')?.contains(formulas[2]!)).toBe(true);
        expect(container.querySelector('a')?.getAttribute('href')).toBe(`#${container.querySelector('.markdown-warning')?.id}`);
        expect(container.querySelector('code')?.textContent).toBe('$Y=A$');
      } finally {
        await engine.dispose();
        container.remove();
      }
    },
    30_000,
  );

  test.each(['trusted', 'sanitized', 'strict'] as const)(
    'typesets real inline mathematics in captions and teaching titles in %s mode',
    async (securityMode) => {
      const engine = createEducationalMarkdownEngine({
        features: ['didactic', 'cross-references'],
        securityMode,
        ...(securityMode === 'strict' ? { allowedCapabilities: ['interactive'] } : {}),
      });
      const container = document.createElement('div');
      document.body.append(container);
      const kinds = ['figure', 'table', 'example', 'definition', 'hint', 'solution'];
      const source = kinds.map((kind) => `::: ${kind} **Formula** $F=AB+C$ and $\`\\left(x\\right)\`$ {#${kind}}\n\nBody.\n\n:::\n`).join('\n') + '\nSee {@ref figure}.';
      try {
        await engine.renderDocument(source, container);
        expect(container.querySelector('.mathjax-error, mjx-merror')).toBeNull();
        const formulas = Array.from(container.querySelectorAll('.markdown-block-heading .mathjax-pending'));
        expect(formulas).toHaveLength(12);
        for (const formula of formulas) expect(formula.querySelector('svg path, svg use')).not.toBeNull();
        expect(container.querySelector('[data-markdown-reference] a')?.getAttribute('href')).toBe(`#${container.querySelector('.markdown-figure')?.id}`);
        const firstSVG = formulas[0]!.querySelector('svg');
        await engine.typeset(container);
        expect(container.querySelectorAll('.markdown-block-heading .mathjax-pending')).toHaveLength(12);
        expect(formulas[0]!.querySelector('svg')).toBe(firstSVG);
        expect(container.querySelectorAll('.markdown-block-heading strong')).toHaveLength(6);
      } finally {
        await engine.dispose();
        container.remove();
      }
    },
    30_000,
  );

  test('leaves math pending when strict mode has not granted interactive capability', async () => {
    const engine = new MarkdownEngine({ securityMode: 'strict' });
    const container = document.createElement('div');
    try {
      await engine.renderDocument('$Y=A$', container);
      expect(container.querySelector('.mathjax-source')?.textContent).toBe('Y=A');
      expect(container.querySelector('svg, [data-mathjax-rendered], .mathjax-error')).toBeNull();
    } finally {
      await engine.dispose();
    }
  });

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
