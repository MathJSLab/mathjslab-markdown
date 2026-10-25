import { readFileSync } from 'node:fs';
import { auditExampleReferences } from '../examples/reference-audit.mjs';
import { TextEncoder, TextDecoder } from 'node:util';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import { mathJSLabExtension } from '../../src/markdown/extensions/mathjslab/extension.js';
import { didacticExtension, crossReferencesExtension, type StructuredBlockOptions } from '../../src/markdown-extensions.js';
import { MarkdownEngine } from '../../src/MarkdownEngine.js';

Object.assign(globalThis, { TextEncoder, TextDecoder });

const table = '| A | B |\n| :---: | ---: |\n| 0 | 1 |';
const block = (kind: string, title: string, body = 'Body.') => `::: ${kind} ${title}\n\n${body}\n\n:::\n`;
const engineFor = (titleMode: StructuredBlockOptions['titleMode'] = 'inline') =>
  createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'], structuredBlockOptions: { titleMode } });

describe('structured block inline titles', () => {
  test.each(['definition', 'theorem', 'proof', 'example', 'exercise', 'hint', 'solution', 'warning', 'figure', 'table', 'equation'])(
    'renders formatting and forward references in %s without replacing the title on updates',
    async (kind) => {
      const engine = engineFor();
      const container = document.createElement('div');
      try {
        const source = block(kind, '**Bold** *emphasis* `literal {@ref absent}` {@ref target} [later][doc] {#self}') + block('figure', 'Target {#target}') + '\n[doc]: #destination\n';
        const session = await engine.renderDocument(source, container, { locale: 'pt' });
        const heading = container.querySelector('.markdown-block-heading')!;
        expect(heading.querySelector('strong')?.textContent).toBe('Bold');
        expect(heading.querySelector('em')?.textContent).toBe('emphasis');
        expect(heading.querySelector('code')?.textContent).toBe('literal {@ref absent}');
        expect(heading.querySelector('[data-markdown-reference] a')?.textContent).toBe(kind === 'figure' ? 'Figura 2' : 'Figura 1');
        expect(heading.querySelector('a[href="#destination"]')?.textContent).toBe('later');
        expect(container.querySelector('[data-markdown-label="self"]')?.id).toBeTruthy();
        await engine.typeset(container, { locale: 'es' });
        expect(heading.querySelectorAll('strong')).toHaveLength(1);
        await session.update(block(kind, 'Replacement {#self}'));
        expect(container.querySelector('strong, code, [data-markdown-reference]')).toBeNull();
      } finally {
        await engine.dispose();
      }
    },
  );

  test.each([
    ['didactic', 'cross-references'],
    ['cross-references', 'didactic'],
  ] as const)('composes title walkers with registration order %j', async (...features) => {
    const engine = createEducationalMarkdownEngine({ features, securityMode: 'strict', profile: 'core' });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(block('example', '**Example** {@ref heading} {#example}') + block('figure', '*Caption* {@ref example} {#figure}') + '\n## Target {#heading}\n', container);
      expect(container.querySelectorAll('.markdown-block-heading [data-markdown-reference] a')).toHaveLength(2);
      expect(container.querySelector('h2')?.id).toBe('heading');
      expect(container.querySelector('.markdown-figure em')?.textContent).toBe('Caption');
    } finally {
      await engine.dispose();
    }
  });

  test.each(['definition', 'example', 'figure', 'table', 'hint', 'solution'])('routes both MathJSLab syntaxes in %s exactly once', async (kind) => {
    const calls: string[] = [];
    const extension = mathJSLabExtension({
      toMathML(source, display) {
        calls.push(`${display}:${source}`);
        return '<math><mi>result</mi></math>';
      },
      createSession() {
        throw new Error('Inline mathematics must not execute commands');
      },
    });
    const engine = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'], extensions: [extension], securityMode: 'sanitized' });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(block(kind, '%F=A*B+C% and %`a < b && b > 0`% {#math}'), container);
      expect(calls).toEqual(['inline:F=A*B+C', 'inline:a < b && b > 0']);
      expect(container.querySelectorAll('.markdown-block-heading math')).toHaveLength(2);
      await engine.typeset(container);
      expect(calls).toHaveLength(2);
    } finally {
      await engine.dispose();
    }
  });

  test.each(['trusted', 'sanitized', 'strict'] as const)('escapes authored HTML at every title depth in %s mode', async (securityMode) => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'], securityMode });
    const container = document.createElement('div');
    const title = '**<img src=x onerror=bad()>** <script>bad()</script> [<b>link</b>](#safe) & text {#safe}';
    try {
      await engine.renderDocument(block('example', title), container);
      const heading = container.querySelector('.markdown-block-heading')!;
      expect(heading.querySelector('img, script, b')).toBeNull();
      expect(heading.querySelector('strong')?.textContent).toBe('<img src=x onerror=bad()>');
      expect(heading.textContent).toContain('<script>bad()</script>');
      expect(heading.textContent).toContain('<b>link</b>');
      expect(heading.textContent).toContain('& text');
    } finally {
      await engine.dispose();
    }
  });

  test('sanitizes links and generated MathJSLab markup through the existing document policy', async () => {
    const engine = createEducationalMarkdownEngine({
      features: ['didactic'],
      securityMode: 'sanitized',
      extensions: [
        mathJSLabExtension({
          toMathML: () => '<math><mi>x</mi></math><img src=x onerror=bad()><script>bad()</script>',
          createSession() {
            throw new Error('unexpected execution');
          },
        }),
      ],
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(block('example', '[bad](javascript:alert%281%29) %x%'), container);
      expect(container.querySelector('script, [onerror], a[href^="javascript:"]')).toBeNull();
      expect(container.querySelector('math mi')?.textContent).toBe('x');
    } finally {
      await engine.dispose();
    }
  });

  test.each(['trusted', 'sanitized', 'strict'] as const)('walks HTML inside custom inline child tokens in %s mode', async (securityMode) => {
    const engine = createEducationalMarkdownEngine({
      features: ['didactic', 'cross-references'],
      securityMode,
      extensions: [
        {
          name: 'nested-inline',
          marked: {
            extensions: [
              {
                name: 'nested-inline',
                level: 'inline',
                childTokens: ['children'],
                start: (source) => source.indexOf('@@'),
                tokenizer(source) {
                  const match = /^@@(.+?)@@/.exec(source);
                  if (match) return { type: 'nested-inline', raw: match[0], children: this.lexer.inlineTokens(match[1]!) };
                },
                renderer(token) {
                  return this.parser.parseInline(token.children);
                },
              },
            ],
          },
        },
      ],
    });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(block('figure', '@@<img src=x onerror=bad()>@@ {#figure}') + block('example', '@@<b>literal</b>@@ {#example}'), container);
      expect(container.querySelector('img, b')).toBeNull();
      expect(container.querySelector('.markdown-figure .markdown-block-heading')?.textContent).toContain('<img src=x onerror=bad()>');
      expect(container.querySelector('.markdown-example .markdown-block-heading')?.textContent).toContain('<b>literal</b>');
    } finally {
      await engine.dispose();
    }
  });

  test('diagnoses missing and ambiguous references inside titles', async () => {
    const engine = engineFor();
    const container = document.createElement('div');
    const diagnostics: (string | undefined)[] = [];
    try {
      await engine.renderDocument(block('example', '{@ref missing} {@ref duplicate} {#self}') + block('figure', '{#duplicate}') + block('table', '{#duplicate}', table), container, {
        onDiagnostic: (value) => diagnostics.push(value.code),
      });
      expect(container.querySelector('.markdown-block-heading')?.textContent).toContain('{@ref missing} {@ref duplicate}');
      expect(container.querySelectorAll('.markdown-block-heading .markdown-reference-unresolved')).toHaveLength(2);
      expect(diagnostics).toEqual(['cross-reference-duplicate', 'cross-reference-missing']);
    } finally {
      await engine.dispose();
    }
  });

  test('supports legacy literal titles in the factory and standalone extensions', async () => {
    for (const engine of [engineFor('plain'), new MarkdownEngine({ extensions: [didacticExtension({ titleMode: 'plain' }), crossReferencesExtension({ titleMode: 'plain' })] })]) {
      const container = document.createElement('div');
      try {
        await engine.renderDocument(block('example', '**Title** $x$ %`x`% {@ref target} <b>raw</b> {#target}') + block('table', '*Table* {#tbl .full-width}', table), container);
        expect(container.querySelector('.markdown-block-heading')?.textContent).toBe('Example 1: **Title** $x$ %`x`% {@ref target} <b>raw</b>');
        expect(container.querySelector('strong, b, .mathjax-pending, [data-markdown-reference]')).toBeNull();
        expect(container.querySelector('.markdown-table-full-width')?.getAttribute('data-markdown-label')).toBe('tbl');
      } finally {
        await engine.dispose();
      }
    }
  });

  test.each(['`{#literal}`', '**{#literal}**', '[{#literal}](#elsewhere)', String.raw`\{#literal}`, '{#invalid width="100%"}', '{#9invalid}'])(
    'keeps protected or invalid metadata visible: %s',
    async (title) => {
      const engine = engineFor();
      const container = document.createElement('div');
      try {
        await engine.renderDocument(block('example', title), container);
        expect(container.querySelector('[data-markdown-label]')).toBeNull();
        expect(container.textContent).toContain('{#');
      } finally {
        await engine.dispose();
      }
    },
  );

  test('audits the generic example with inline titles and presentation metadata', async () => {
    const engine = engineFor();
    try {
      const source = readFileSync(new URL('../../example/structured-blocks.md', import.meta.url), 'utf8');
      const audit = auditExampleReferences(source, engine, crossReferencesExtension(), document);
      expect(audit.issues).toEqual([]);
      expect(audit.metadata.targets.map((target) => target.label)).toEqual(['function', 'evaluation', 'model', 'values']);
      expect(audit.metadata.references.every((reference) => reference.linked)).toBe(true);
    } finally {
      await engine.dispose();
    }
  });

  test('keeps unsupported note containers literal and requires ordinary inline math delimiters', () => {
    const engine = engineFor();
    try {
      const html = engine.parse(block('example', String.raw`\(x\) $\left(x\right)$ {#id}`) + block('note', 'Unsupported'));
      expect(html).toContain('data-markdown-label="id"');
      expect(html.match(/mathjax-pending/g)).toHaveLength(1);
      expect(html).toContain('::: note Unsupported');
    } finally {
      void engine.dispose();
    }
  });
});

describe('opt-in full-width captioned tables', () => {
  test.each(['{#tbl .full-width}', '{.full-width}', '{#tbl}'])('preserves GFM cells, numbering and metadata for %s', async (metadata) => {
    const engine = engineFor();
    const container = document.createElement('div');
    try {
      await engine.renderDocument(block('table', `**Values** ${metadata}`, table), container);
      const section = container.querySelector('.markdown-table')!;
      expect(section.classList.contains('markdown-table-full-width')).toBe(metadata.includes('.full-width'));
      expect(section.getAttribute('data-markdown-label')).toBe(metadata.includes('#tbl') ? 'tbl' : null);
      expect(section.querySelector('th')?.getAttribute('align')).toBe('center');
      expect(section.querySelector('td:last-child')?.getAttribute('align')).toBe('right');
      expect(section.querySelector('.markdown-block-heading')?.textContent).toBe('Table 1: Values');
      expect(section.querySelector('strong')?.textContent).toBe('Values');
      expect(container.querySelector('[data-markdown-extension-style="cross-references"]')?.textContent).toContain('.markdown-table-full-width>table{width:100%;table-layout:auto}');
    } finally {
      await engine.dispose();
    }
  });

  test.each(['{#tbl width="100%"}', '{#tbl .unknown}', '{#tbl .full-width onclick="bad()"}'])('does not consume unsupported presentation attributes: %s', async (metadata) => {
    const engine = engineFor();
    const container = document.createElement('div');
    try {
      await engine.renderDocument(block('table', `Values ${metadata}`, table), container);
      expect(container.querySelector('[data-markdown-label], .markdown-table-full-width, [onclick]')).toBeNull();
      expect(container.querySelector('.markdown-block-heading')?.textContent).toContain(metadata);
    } finally {
      await engine.dispose();
    }
  });

  test('scopes presentation to tables and leaves ordinary tables and core-profile parsing unchanged', async () => {
    const engine = engineFor();
    const container = document.createElement('div');
    try {
      await engine.renderDocument(block('figure', 'Caption {#fig .full-width}', table) + '\n' + table, container);
      expect(container.querySelector('.markdown-table-full-width, [data-markdown-label]')).toBeNull();
      expect(container.querySelectorAll('table')).toHaveLength(2);
    } finally {
      await engine.dispose();
    }
    const core = createEducationalMarkdownEngine({ profile: 'core', features: ['cross-references'] });
    try {
      expect(core.parse(block('table', 'Caption {#tbl .full-width}', table))).not.toContain('<table>');
    } finally {
      await core.dispose();
    }
  });
});
