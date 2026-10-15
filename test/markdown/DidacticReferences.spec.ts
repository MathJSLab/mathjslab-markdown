import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import type { MarkdownDiagnostic } from '../../src/MarkdownEngine.js';

const createEngine = () => createEducationalMarkdownEngine({ features: ['cross-references', 'didactic'], securityMode: 'sanitized' });

describe('didactic blocks and document references', () => {
  test('works independently in strict mode and localizes inside Shadow DOM', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic'], securityMode: 'strict' });
    const root = document.createElement('div').attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    root.append(container);
    await engine.renderDocument('::: definition Título\n<script>alert(1)</script>\n:::\n\n{@ref absent}', container, { locale: 'pt' });
    expect(container.querySelector('[data-markdown-block-label]')?.textContent).toBe('Definição');
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('{@ref absent}');
    expect(root.querySelector('[data-markdown-extension-style="didactic"]')).not.toBeNull();
    await engine.dispose();

    const references = createEducationalMarkdownEngine({ features: ['cross-references'], securityMode: 'strict' });
    await references.renderDocument('::: equation Identity {#identity}\n1 = 1\n:::\n\n{@ref identity}', container);
    expect(container.querySelector('a')?.textContent).toBe('Equation 1');
    await references.dispose();
  });

  test('resolves references with either extension registration order', async () => {
    for (const features of [
      ['didactic', 'cross-references'],
      ['cross-references', 'didactic'],
    ] as const) {
      const engine = createEducationalMarkdownEngine({ features });
      const container = document.createElement('div');
      await engine.renderDocument('::: theorem {#result}\nResult\n:::\n\n{@ref result}', container, { locale: 'pt' });
      expect(container.querySelector('[data-markdown-block-label]')?.textContent).toBe('Teorema 1');
      expect(container.querySelector('a')?.textContent).toBe('Teorema 1');
      await engine.dispose();
    }
  });

  test('renders nested Markdown and closed, native solutions with localized numbering and forward references', async () => {
    const engine = createEngine();
    const container = document.createElement('div');
    const session = await engine.renderDocument('Veja {@ref pitagoras}.\n\n:::: theorem Pitágoras {#pitagoras}\n**Hipótese** e $a^2$.\n\n::: solution\nUma resposta.\n:::\n::::', container, {
      locale: 'pt-BR',
    });
    expect(container.querySelector('a')?.textContent).toBe('Teorema 1');
    expect(container.querySelector('a')?.getAttribute('href')).toBe(`#${container.querySelector('section')?.id}`);
    expect(container.querySelector('strong')?.textContent).toBe('Hipótese');
    expect(container.querySelector('summary')?.textContent).toBe('Solução 1');
    expect(container.querySelector('details')?.hasAttribute('open')).toBe(false);
    await session.dispose();
    await engine.dispose();
  });

  test('numbers categories independently, resolves captions, and recomputes on update and typeset', async () => {
    const engine = createEngine();
    const container = document.createElement('div');
    const source =
      '::: figure First {#first}\nText\n:::\n\n::: table Values {#values}\n| A | B |\n| - | - |\n| 1 | 2 |\n:::\n\n::: figure Second {#second}\nText\n:::\n\n{@ref second} and {@ref values}';
    const session = await engine.renderDocument(source, container);
    expect(Array.from(container.querySelectorAll('a'), (link) => link.textContent)).toEqual(['Figure 2', 'Table 1']);
    expect(container.querySelector('table')).not.toBeNull();
    await engine.typeset(container);
    expect(container.querySelector('a')?.textContent).toBe('Figure 2');
    await session.update('::: figure Second {#second}\nText\n:::\n\n{@ref second}', { locale: 'es' });
    expect(container.querySelector('a')?.textContent).toBe('Figura 1');
    await engine.dispose();
  });

  test('preserves missing and ambiguous references and emits actionable diagnostics', async () => {
    const engine = createEngine();
    const diagnostics: MarkdownDiagnostic[] = [];
    const container = document.createElement('div');
    await engine.renderDocument('::: theorem {#same}\nOne\n:::\n\n::: theorem {#same}\nTwo\n:::\n\n{@ref same} {@ref absent}', container, {
      onDiagnostic: (value) => diagnostics.push(value),
    });
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.querySelectorAll('[id]')).toHaveLength(1);
    expect(container.textContent).toContain('{@ref absent}');
    expect(diagnostics.map((value) => value.code)).toEqual(['cross-reference-duplicate', 'cross-reference-missing']);
    await engine.dispose();
  });

  test('keeps code literal, ignores colon closers in code fences, and preserves unclosed containers', async () => {
    const engine = createEngine();
    const container = document.createElement('div');
    await engine.renderDocument('::: example Code\n```text\n:::\n{@ref absent}\n```\n:::\n\n`{@ref absent}`\n\n::: theorem Unclosed\nStill readable', container);
    expect(container.querySelectorAll('[data-markdown-block]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-markdown-reference]')).toHaveLength(0);
    expect(container.textContent).toContain('::: theorem Unclosed');
    await engine.dispose();
  });

  test('escapes titles and isolates target IDs across documents sharing an engine', async () => {
    const engine = createEngine();
    const first = document.createElement('div');
    const second = document.createElement('div');
    const source = '::: definition <img src=x onerror=alert(1)> {#same}\nText\n:::\n\n{@ref same}';
    await engine.renderDocument(source, first);
    await engine.renderDocument(source, second);
    expect(first.querySelector('img')).toBeNull();
    expect(first.querySelector('section')?.id).not.toBe(second.querySelector('section')?.id);
    expect(first.querySelector('a')?.getAttribute('href')).toBe(`#${first.querySelector('section')?.id}`);
    await engine.dispose();
  });
});
