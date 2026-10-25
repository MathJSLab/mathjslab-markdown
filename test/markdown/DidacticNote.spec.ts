import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';

const note = '::: note **Equivalence** {#equivalence}\n\nEquivalent expressions may have different implementations.\n\n:::\n';

describe('didactic notes', () => {
  test.each([
    ['en-US', 'Note'],
    ['pt-BR', 'Nota'],
    ['es', 'Nota'],
    ['fr', 'Note'],
  ])('localizes notes and preserves numbering on updates in %s', async (locale, label) => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'], securityMode: 'strict' });
    const container = document.createElement('div');
    try {
      const session = await engine.renderDocument(`{@ref equivalence}\n\n${note}`, container, { locale });
      const section = container.querySelector('section.markdown-note')!;
      expect(section.querySelector('strong')?.textContent).toBe('Equivalence');
      expect(section.querySelector('[data-markdown-block-label]')?.textContent).toBe(`${label} 1`);
      expect(container.querySelector('a')?.getAttribute('href')).toBe('#' + section.id);
      expect(container.querySelector('a')?.textContent).toBe(`${label} 1`);
      expect(section.querySelector('details, summary, [role="alert"]')).toBeNull();
      expect(section.hasAttribute('role')).toBe(false);
      await session.update(`::: note\nFirst.\n:::\n\n${note}\n{@ref equivalence}`, { locale });
      expect(container.querySelector('a')?.textContent).toBe(`${label} 2`);
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    ['didactic', 'cross-references'],
    ['cross-references', 'didactic'],
  ] as const)('balances notes in captions with order %j', async (...features) => {
    const engine = createEducationalMarkdownEngine({ features, securityMode: 'sanitized' });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(`::: figure Outer {#outer}\n\n${note}\n:::\n\n{@ref equivalence}`, container);
      expect(container.querySelector('.markdown-figure > .markdown-note strong')?.textContent).toBe('Equivalence');
      expect(container.querySelector('a')?.textContent).toBe('Note 1');
    } finally {
      await engine.dispose();
    }
  });

  test('escapes title HTML and keeps notes literal when disabled or fenced', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic'], securityMode: 'trusted' });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(note.replace('**Equivalence**', '<img src=x onerror=bad()>'), container);
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('.markdown-note')?.id).toBe('');
      expect(container.textContent).toContain('<img src=x onerror=bad()>');
      expect(engine.parse('```markdown\n' + note + '\n```')).not.toContain('class="markdown-didactic');
    } finally {
      await engine.dispose();
    }
    const disabled = createEducationalMarkdownEngine({ features: ['cross-references'] });
    try {
      expect(disabled.parse(note)).not.toContain('class="markdown-didactic');
    } finally {
      await disabled.dispose();
    }
  });
});
