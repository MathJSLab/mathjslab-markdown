import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import type { MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { headingIdsExtension } from '../../src/markdown/extensions/heading-ids/extension.js';
import { MarkdownNavigator } from '../../src/markdown/MarkdownNavigator.js';
import { jest } from '@jest/globals';

describe('explicit heading references', () => {
  test('navigates direct fragment links through the existing navigator', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references'] });
    const container = document.createElement('div');
    const session = await engine.renderDocument('## Title {#sec-title}\n\n[Title](#sec-title) {@ref sec-title}', container, { sourceUrl: new URL('https://example.test/chapter.md') });
    const scrollToFragment = jest.fn();
    const navigator = new MarkdownNavigator(session, { scrollToFragment });
    await navigator.navigate('#sec-title');
    expect(scrollToFragment).toHaveBeenCalledWith('sec-title', container.querySelector('h2'), container);
    navigator.dispose();
    await engine.dispose();
  });

  test.each(['1', '1.', '1.4', '1.4.', '1.4.2.'])('reuses the manual decimal number %s without modifying the title', async (number) => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references'] });
    const container = document.createElement('div');
    await engine.renderDocument(`## ${number} Title {#title}\n\n{@ref title}`, container);
    expect(container.querySelector('a')?.textContent).toBe(`Section ${number.replace(/\.$/, '')}`);
    expect(container.querySelector('h2')?.textContent).toBe(`${number} Title`);
    await engine.dispose();
  });

  test.each(['core', 'gfm'] as const)('supports every heading level and forward references in %s', async (profile) => {
    const engine = createEducationalMarkdownEngine({ profile, features: ['cross-references', 'didactic'] });
    const container = document.createElement('div');
    const source =
      Array.from({ length: 6 }, (_, i) => `{@ref sec-${i + 1}}`).join(' ') +
      '\n\n' +
      Array.from({ length: 6 }, (_, i) => `${'#'.repeat(i + 1)} ${i + 1}. **Título** {#sec-${i + 1}}`).join('\n\n');
    await engine.renderDocument(source, container, { locale: 'pt-BR' });
    for (let i = 1; i <= 6; i++) {
      expect(container.querySelector(`h${i}`)?.id).toBe(`sec-${i}`);
      expect(container.querySelector(`h${i}`)?.textContent).toBe(`${i}. Título`);
      expect(container.querySelector(`a[href="#sec-${i}"]`)?.textContent).toBe(`Seção ${i}`);
    }
    expect(container.querySelectorAll('strong')).toHaveLength(6);
    await engine.dispose();
  });

  test.each(['trusted', 'sanitized', 'strict'] as const)('preserves syntax boundaries and inline content in %s', async (securityMode) => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references'], securityMode });
    const container = document.createElement('div');
    await engine.renderDocument(
      [
        '## 1.4. **Logic** and `signals` {#logic} ##',
        'Unnumbered *heading* {#plain}\n-------------------',
        '## Code `{#code}`',
        '## Escaped \\{#escaped}',
        '## Invalid {#1bad}',
        '## Nested **{#nested}**',
        '```markdown\n## Literal {#literal}\n```',
        '{@ref logic} {@ref plain}',
      ].join('\n\n'),
      container,
    );
    expect(container.querySelector('#logic')?.textContent).toBe('1.4. Logic and signals');
    expect(container.querySelector('#plain')?.textContent).toBe('Unnumbered heading');
    expect(Array.from(container.querySelectorAll('[data-markdown-reference] a'), (node) => node.textContent)).toEqual(['Section 1.4', 'Unnumbered heading']);
    expect(container.querySelectorAll('[data-markdown-heading]')).toHaveLength(2);
    expect(container.textContent).toContain('{#escaped}');
    expect(container.textContent).toContain('{#literal}');
    await engine.dispose();
  });

  test('keeps stable anchors across translations, updates, Shadow DOM and repeated typesetting', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references'] });
    const container = document.createElement('div');
    document.createElement('div').attachShadow({ mode: 'open' }).append(container);
    const session = await engine.renderDocument('## 1.4. Lógica {#logic}\n\n{@ref logic}', container, { locale: 'pt-BR' });
    for (const [locale, title, expected] of [
      ['en-US', 'Logic', 'Section 1.4'],
      ['es-ES', 'Lógica', 'Sección 1.4'],
      ['fr', 'Logique', 'Section 1.4'],
    ]) {
      await session.update(`## 1.4. ${title} {#logic}\n\n{@ref logic}`, { locale });
      await engine.typeset(container, { locale });
      expect(container.querySelector('h2')?.id).toBe('logic');
      expect(container.querySelector('a')?.textContent).toBe(expected);
    }
    await engine.dispose();
  });

  test.each(['heading-first', 'block-first', 'headings-only'])('diagnoses duplicate labels and missing targets: %s', async (order) => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references', 'didactic'] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    const heading = '## Heading {#same}';
    const block = order === 'headings-only' ? '### Other {#same}' : '::: theorem {#same}\nResult\n:::';
    await engine.renderDocument((order === 'block-first' ? [block, heading] : [heading, block]).join('\n\n') + '\n\n{@ref same} {@ref missing}', container, {
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
    });
    expect(container.querySelectorAll('[data-markdown-reference] a')).toHaveLength(0);
    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['cross-reference-duplicate', 'cross-reference-missing']);
    expect(container.textContent).toContain('{@ref same}');
    await engine.dispose();
  });

  test.each([false, true])('reserves explicit anchors before automatic headings regardless of order: %s', async (reverse) => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references'] });
    const container = document.createElement('div');
    const headings = ['## Same', '## Same', '## Explicit {#same}', '## Reserved {#same-1}'];
    await engine.renderDocument((reverse ? headings.reverse() : headings).join('\n\n') + '\n\n{@ref same}', container);
    const ids = Array.from(container.querySelectorAll('[id]'), (node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(container.querySelector('[data-markdown-heading="same"]')?.id).toBe('same');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('#same');
    await engine.typeset(container);
    expect(Array.from(container.querySelectorAll('[id]'), (node) => node.id)).toEqual(ids);
    await engine.dispose();
  });

  test('preserves HTML anchors and diagnoses conflicting explicit headings', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references'] });
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    await engine.renderDocument('<div id="reserved">HTML</div>\n\n## Title {#reserved}\n\n{@ref reserved}', container, { onDiagnostic: (value) => diagnostics.push(value) });
    expect(container.querySelectorAll('#reserved')).toHaveLength(1);
    expect(container.querySelector('div#reserved')?.textContent).toBe('HTML');
    expect(container.querySelector('a')).toBeNull();
    expect(diagnostics.map((value) => value.code)).toEqual(['cross-reference-duplicate']);
    await engine.dispose();
  });

  test('works when heading IDs are registered after cross references and leaves disabled syntax literal', async () => {
    const engine = createEducationalMarkdownEngine({ profile: 'core', features: ['cross-references'], extensions: [headingIdsExtension()] });
    // The automatic renderer must delegate explicit headings regardless of registration order.
    const container = document.createElement('div');
    await engine.renderDocument('## Title {#stable}\n\n{@ref stable}', container);
    expect(container.querySelector('h2')?.id).toBe('stable');
    await engine.dispose();
    const disabled = createEducationalMarkdownEngine();
    expect(disabled.parse('## Title {#stable}')).toContain('Title {#stable}');
    await disabled.dispose();
  });

  test('shares a registry with every existing category without changing category counters', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'] });
    const container = document.createElement('div');
    const kinds = ['figure', 'table', 'equation', 'definition', 'theorem', 'proof', 'example', 'exercise', 'hint', 'solution'];
    await engine.renderDocument(
      '## 2.3. Targets {#targets}\n\n' + kinds.map((kind) => `::: ${kind} {#${kind}}\nSee {@ref targets}.\n:::`).join('\n\n') + '\n\n' + kinds.map((kind) => `{@ref ${kind}}`).join(' '),
      container,
    );
    expect(container.querySelectorAll('[data-markdown-reference] a')).toHaveLength(20);
    expect(Array.from(container.querySelectorAll('[data-markdown-block-label]'), (node) => node.textContent)).toEqual(kinds.map((kind) => `${kind[0]!.toUpperCase()}${kind.slice(1)} 1`));
    await engine.dispose();
  });
});
