import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import type { MarkdownDiagnostic } from '../../src/MarkdownEngine.js';
import { TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder });

const references = [
  { id: 'ada', type: 'book', author: [{ family: 'Lovelace', given: 'Ada' }], title: 'Notes on the Engine', issued: { 'date-parts': [[1843]] } },
  { id: 'turing', type: 'article-journal', author: [{ family: 'Turing', given: 'Alan' }], title: 'Computable Numbers', issued: { 'date-parts': [[1936]] } },
];
const fence = (language: string, source = '') => `\n\n\`\`\`${language}\n${source}\n\`\`\``;
const source = (text: string, config = '{}', items: unknown = references) => text + fence('csl-json', JSON.stringify(items)) + fence('bibliography', config);
const create = (securityMode: 'strict' | 'sanitized' | 'trusted' = 'sanitized') => createEducationalMarkdownEngine({ features: ['citations'], securityMode });

describe('CSL citations and bibliographies', () => {
  test('accepts a host CSL style without changing other documents', async () => {
    const styleXml =
      '<style xmlns="http://purl.org/net/xbiblio/csl" version="1.0" class="in-text"><info><title>Test</title><id>https://example.test/test</id></info><citation><layout prefix="[" suffix="]"><text variable="title"/></layout></citation><bibliography><layout><text variable="title"/></layout></bibliography></style>';
    const custom = createEducationalMarkdownEngine({ features: ['citations'], citationsOptions: { styleXml } });
    const standard = create();
    const first = document.createElement('div');
    const second = document.createElement('div');
    await Promise.all([custom.renderDocument(source('[@ada]'), first), standard.renderDocument(source('[@ada]'), second)]);
    expect(first.querySelector('[data-markdown-citation]')?.textContent).toBe('[Notes on the Engine]');
    expect(second.querySelector('[data-markdown-citation]')?.textContent).toContain('Lovelace');
    await Promise.all([custom.dispose(), standard.dispose()]);
  });

  test('formats Harvard, works without a bibliography and remains stable on repeated typesetting', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['citations'], citationsOptions: { style: 'harvard1' } });
    const container = document.createElement('div');
    await engine.renderDocument('[@ada]' + fence('csl-json', JSON.stringify(references)), container);
    const text = container.querySelector('[data-markdown-citation]')?.textContent;
    expect(text).toContain('Lovelace');
    expect(container.querySelector('[data-markdown-citation] a')).toBeNull();
    await engine.typeset(container);
    expect(container.querySelector('[data-markdown-citation]')?.textContent).toBe(text);
    await engine.dispose();
  });

  test.each(['{}', '[{"id":"ada"}]', '[{"id":1,"type":"book"}]'])('rejects invalid CSL record shapes: %s', async (data) => {
    const engine = create();
    const container = document.createElement('div');
    await engine.renderDocument('[@ada]' + fence('csl-json', data) + fence('bibliography'), container);
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe(data);
    expect(container.querySelector('[data-markdown-citation]')?.textContent).toBe('[@ada]');
    await engine.dispose();
  });

  test('enforces byte and entry limits while preserving source', async () => {
    const engine = create();
    const container = document.createElement('div');
    const data = JSON.stringify(Array.from({ length: 1001 }, (_, index) => ({ ...references[0], id: `ref${index}` })));
    await engine.renderDocument('[@ada]' + fence('csl-json', data) + fence('bibliography'), container);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('1000 references');
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe(data);
    await engine.renderDocument(fence('bibtex', '@book{ada,title={A title}}'), container, { maxSourceBytes: 10 });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Source exceeds');
    await engine.dispose();
  });

  test('rejects multiple bibliography blocks', async () => {
    const engine = create();
    const container = document.createElement('div');
    await engine.renderDocument(source('[@ada]') + fence('bibliography'), container);
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(2);
    expect(container.querySelector('[data-markdown-citation]')?.textContent).toBe('[@ada]');
    await engine.dispose();
  });
  test('formats BibTeX, grouped citations and page locators in Portuguese', async () => {
    const engine = create();
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    await engine.renderDocument(
      'Uma fonte [@ada, pp. 12-15] e duas [@ada; @turing].' +
        fence('bibtex', '@book{ada, author={Lovelace, Ada}, title={Notes on the Engine}, year={1843}}') +
        fence('csl-json', JSON.stringify([references[1]])) +
        fence('bibliography'),
      container,
      { locale: 'pt-BR', onDiagnostic: (d) => diagnostics.push(d) },
    );
    expect(diagnostics).toEqual([]);
    const citations = container.querySelectorAll('[data-markdown-citation]');
    expect(citations[0]?.textContent).toContain('Lovelace');
    expect(citations[0]?.textContent).toContain('12');
    expect(citations[1]?.textContent).toContain('Turing');
    expect(container.querySelectorAll('.markdown-bibliography-entry')).toHaveLength(2);
    const link = container.querySelector<HTMLAnchorElement>('[data-markdown-citation] a')!;
    expect(container.querySelector(link.getAttribute('href')!)?.textContent).toContain('Notes on the Engine');
    expect(container.querySelectorAll('[hidden]')).toHaveLength(2);
    await engine.dispose();
  });

  test('numbers by citation order and resets after an update', async () => {
    const engine = create('strict');
    const container = document.createElement('div');
    const session = await engine.renderDocument(source('First [@turing]. Then [@ada]. Again [@turing].', '{"style":"vancouver"}'), container);
    expect([...container.querySelectorAll('[data-markdown-citation]')].map((n) => n.textContent)).toEqual(['(1)', '(2)', '(1)']);
    expect(container.querySelector('.markdown-bibliography-entry')?.textContent).toContain('Computable Numbers');
    await session.update(source('Only [@ada].', '{"style":"vancouver"}'));
    expect(container.querySelector('[data-markdown-citation]')?.textContent).toBe('(1)');
    expect(container.querySelectorAll('.markdown-bibliography-entry')).toHaveLength(1);
    expect(container.textContent).not.toContain('Computable Numbers');
    await engine.dispose();
  });

  test('disambiguates all citations in context', async () => {
    const engine = create();
    const container = document.createElement('div');
    await engine.renderDocument(
      source(
        '[@a] [@b]',
        '{}',
        ['A title', 'B title'].map((title, index) => ({ ...references[0], id: index ? 'b' : 'a', title })),
      ),
      container,
    );
    expect(container.querySelectorAll('[data-markdown-citation]')[0]?.textContent).toContain('1843a');
    expect(container.querySelectorAll('[data-markdown-citation]')[1]?.textContent).toContain('1843b');
    await engine.dispose();
  });

  test('keeps unknown and duplicate keys unresolved and reports stable diagnostics', async () => {
    const engine = create();
    const container = document.createElement('div');
    const diagnostics: MarkdownDiagnostic[] = [];
    await engine.renderDocument(source('[@ada; @missing] [@turing]', '{}', [...references, references[1]]), container, { onDiagnostic: (d) => diagnostics.push(d) });
    expect(container.querySelectorAll('.markdown-citation-unresolved')).toHaveLength(2);
    expect(container.textContent).toContain('[@ada; @missing]');
    expect(diagnostics.map((d) => d.code)).toEqual(expect.arrayContaining(['citation-missing', 'citation-duplicate']));
    expect(container.querySelectorAll('.markdown-bibliography-entry')).toHaveLength(0);
    await engine.dispose();
  });

  test.each(['strict', 'sanitized', 'trusted'] as const)('sanitizes formatted output in %s mode', async (mode) => {
    const engine = create(mode);
    const container = document.createElement('div');
    const malicious = { ...references[0], title: '<img src="https://evil.test/a" onerror="alert(1)"><script>alert(2)</script><i>Safe</i><a href="javascript:alert(3)">Link</a>' };
    await engine.renderDocument(source('[@ada]', '{}', [malicious]), container);
    expect(container.querySelector('img,script,[onerror],a[href^="javascript:"]')).toBeNull();
    expect(container.querySelector('.markdown-bibliography-entry')?.textContent).toContain('Safe');
    await engine.dispose();
  });

  test('isolates documents and works inside a ShadowRoot', async () => {
    const engine = create();
    const first = document.createElement('div');
    const second = document.createElement('div');
    const shadow = document.createElement('div').attachShadow({ mode: 'open' });
    shadow.append(second);
    await Promise.all([engine.renderDocument(source('[@ada]'), first), engine.renderDocument(source('[@turing]', '{"style":"vancouver"}'), second)]);
    expect(first.textContent).toContain('Lovelace');
    expect(second.querySelector('[data-markdown-citation]')?.textContent).toBe('(1)');
    expect(first.querySelector('.markdown-bibliography-entry')?.id).not.toBe(second.querySelector('.markdown-bibliography-entry')?.id);
    expect(shadow.querySelector('[data-markdown-extension-style="citations"]')).not.toBeNull();
    await engine.dispose();
  });

  test.each(['not json', '{"style":"missing"}', '{"includeUncited":"yes"}', '{"url":"https://evil.test"}'])('preserves invalid bibliography configuration: %s', async (config) => {
    const engine = create();
    const container = document.createElement('div');
    await engine.renderDocument(source('[@ada]', config), container);
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe(config);
    expect(container.querySelector('[data-markdown-citation]')?.textContent).toBe('[@ada]');
    await engine.dispose();
  });

  test('preserves malformed data and still formats other valid blocks', async () => {
    const engine = create();
    const container = document.createElement('div');
    await engine.renderDocument(source('[@ada]') + fence('csl-json', 'not json'), container);
    expect(container.querySelector('.markdown-extension-fallback')?.textContent).toBe('not json');
    expect(container.querySelector('[role="alert"]')?.closest('[hidden]')).toBeNull();
    expect(container.querySelector('[data-markdown-citation]')?.textContent).toContain('Lovelace');
    await engine.dispose();
  });

  test('supports uncited references and leaves code and malformed syntax literal', async () => {
    const engine = create();
    const container = document.createElement('div');
    await engine.renderDocument(source('`[@ada]` [@ada, arbitrary text]', '{"includeUncited":true}') + fence('text', '[@ada]'), container);
    expect(container.querySelectorAll('[data-markdown-citation]')).toHaveLength(0);
    expect(container.querySelectorAll('.markdown-bibliography-entry')).toHaveLength(2);
    expect(container.querySelector('code')?.textContent).toBe('[@ada]');
    await engine.dispose();
  });
});
