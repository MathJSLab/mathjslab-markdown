import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';

const warning = '::: warning Attention {#assumptions}\n\nUse **valid** assumptions.\n\n:::';

describe('didactic warnings', () => {
  test.each([
    ['en-US', 'Warning'],
    ['pt-BR', 'Advertência'],
    ['es', 'Advertencia'],
    ['fr', 'Warning'],
  ])('localizes and resolves warnings in %s', async (locale, label) => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'], securityMode: 'sanitized' });
    const container = document.createElement('div');
    try {
      const diagnostics: (string | undefined)[] = [];
      const session = await engine.renderDocument(`{@ref assumptions}\n\n${warning}`, container, { locale, onDiagnostic: (d) => diagnostics.push(d.code) });
      const block = container.querySelector('section.markdown-warning')!;
      expect(block.getAttribute('data-markdown-label')).toBe('assumptions');
      expect(block.querySelector(':scope > .markdown-block-heading')?.textContent).toBe(`${label} 1: Attention`);
      expect(block.querySelector('p > strong')?.textContent).toBe('valid');
      expect(block.querySelector('details, summary, [role="alert"]')).toBeNull();
      expect(block.hasAttribute('role')).toBe(false);
      expect(container.querySelector('a')?.textContent).toBe(`${label} 1`);
      expect(container.querySelector('a')?.getAttribute('href')).toBe(`#${block.id}`);
      expect(diagnostics).toEqual([]);
      await engine.typeset(container, { locale });
      expect(container.querySelector('a')?.textContent).toBe(`${label} 1`);
      await session.update(`::: warning\nFirst\n:::\n\n${warning}\n\n{@ref assumptions}`, { locale });
      expect(container.querySelector('a')?.textContent).toBe(`${label} 2`);
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    ['didactic', 'cross-references'],
    ['cross-references', 'didactic'],
  ] as const)('balances warnings inside captions and teaching blocks with order %j', async (...features) => {
    const engine = createEducationalMarkdownEngine({ features, securityMode: 'strict', profile: 'core' });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(`::: exercise Outer\n\n::: figure Caption\n\n${warning}\n\n:::\n\n::: hint Clue\nHint\n:::\n\n:::\n\nAfter. {@ref assumptions}`, container);
      expect(container.querySelector('.markdown-exercise > .markdown-figure > .markdown-warning strong')?.textContent).toBe('valid');
      expect(container.querySelector('.markdown-exercise > .markdown-hint > summary')?.textContent).toBe('Hint 1: Clue');
      expect(container.querySelector('.markdown-exercise > .markdown-block-heading')?.textContent).toBe('Exercise 1: Outer');
      expect(container.querySelectorAll('[data-markdown-block]')).toHaveLength(4);
      expect(container.querySelector(':scope > p:last-of-type')?.textContent).toBe('After. Warning 1');
      expect(container.querySelector('a')?.getAttribute('href')).toBe(`#${container.querySelector('.markdown-warning')?.id}`);
    } finally {
      await engine.dispose();
    }
  });

  test('keeps labels as metadata without references and escapes titles', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic'], securityMode: 'sanitized' });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(warning.replace('Attention', '<img src=x onerror=bad()>') + '\n\n{@ref assumptions}', container);
      const block = container.querySelector('.markdown-warning')!;
      expect(block.getAttribute('data-markdown-label')).toBe('assumptions');
      expect(block.id).toBe('');
      expect(block.querySelector('img')).toBeNull();
      expect(block.querySelector('.markdown-block-heading')?.textContent).toBe('Warning: <img src=x onerror=bad()>');
      expect(container.textContent).toContain('{@ref assumptions}');
    } finally {
      await engine.dispose();
    }
  });

  test.each([warning.slice(0, warning.lastIndexOf(':::')), warning.replace(/:::$/, '::::'), warning.replace('warning', 'unknown'), '```markdown\n' + warning + '\n```'])(
    'preserves unrecognized or literal syntax: %s',
    async (source) => {
      const engine = createEducationalMarkdownEngine({ features: ['didactic'] });
      const container = document.createElement('div');
      try {
        await engine.renderDocument(source, container);
        expect(container.querySelector('[data-markdown-block]')).toBeNull();
        expect(container.textContent).toContain(source.includes('unknown') ? '::: unknown' : '::: warning');
      } finally {
        await engine.dispose();
      }
    },
  );

  test('preserves warnings as ordinary Markdown when didactic is disabled', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references'] });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(warning, container);
      expect(container.querySelector('[data-markdown-block]')).toBeNull();
      expect(container.textContent).toContain('::: warning Attention {#assumptions}');
    } finally {
      await engine.dispose();
    }
  });
});
