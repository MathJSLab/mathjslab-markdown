import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright-core';
import { serveStatic } from '../hdl-browser/static-server.mjs';

const server = await serveStatic();
try {
  for (const name of (process.env.MARKDOWN_STRUCTURED_BROWSERS ?? 'chromium,firefox,webkit').split(',')) {
    const browser = await { chromium, firefox, webkit }[name].launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(server.url + '/test/browser/structured-blocks.html');
      const result = await page.evaluate(async () => {
        const { createEducationalMarkdownEngine } = await import('/dist/browser/core.js');
        const { mathJSLabExtension } = await import('/dist/browser/mathjslab.js');
        const calls = [];
        const engine = createEducationalMarkdownEngine({
          features: ['didactic', 'cross-references'],
          securityMode: 'sanitized',
          extensions: [
            mathJSLabExtension({
              toMathML(source) {
                calls.push(source);
                return '<math><mi>x</mi></math>';
              },
              createSession() {
                throw new Error('Inline mathematics must not execute commands');
              },
            }),
          ],
        });
        const table = '| A | B |\n| :---: | ---: |\n| 0 | 1 |';
        const source =
          `::: figure **Formula** $F=AB+C$ and %\`F=A*B+C\`% {@ref wide} {#figure}\n\nBody.\n\n:::\n\n` +
          `::: table Values {#wide .full-width}\n\n${table}\n\n::: table Nested {#nested}\n\n${table}\n\n:::\n\n:::\n\n` +
          `::: table Natural {#natural}\n\n${table}\n\n:::\n\n${table}\n`;
        const contentWidth = (element) => {
          const style = getComputedStyle(element);
          return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        };
        const results = [];
        try {
          for (const shadow of [false, true]) {
            const host = document.createElement('div');
            document.body.append(host);
            const root = shadow ? host.attachShadow({ mode: 'open' }) : host;
            const container = document.createElement('article');
            container.style.width = '800px';
            root.append(container);
            const diagnostics = [];
            const session = await engine.renderDocument(source, container, { locale: 'pt-BR', onDiagnostic: (value) => diagnostics.push(value.code) });
            const wide = container.querySelector('.markdown-table-full-width');
            const wideTable = wide.querySelector(':scope > table');
            const natural = container.querySelector('[data-markdown-label="natural"] > table');
            const nested = container.querySelector('[data-markdown-label="nested"] > table');
            const ordinary = container.querySelector(':scope > table');
            const formula = container.querySelector('.markdown-block-heading .mathjax-pending');
            const svg = formula.querySelector('svg');
            const width = wideTable.getBoundingClientRect().width;
            results.push({
              shadow,
              width,
              blockWidth: contentWidth(wide),
              naturalWidth: natural.getBoundingClientRect().width,
              nestedWidth: nested.getBoundingClientRect().width,
              ordinaryWidth: ordinary.getBoundingClientRect().width,
              alignment: getComputedStyle(wideTable.querySelector('td')).textAlign,
              lastAlignment: getComputedStyle(wideTable.querySelector('td:last-child')).textAlign,
              layout: getComputedStyle(wideTable).tableLayout,
              formula: Boolean(svg?.querySelector('path, use')),
              mathml: Boolean(container.querySelector('.markdown-block-heading math mi')),
              reference: container.querySelector('.markdown-block-heading [data-markdown-reference] a')?.getAttribute('href') === '#' + wide.id,
              diagnostics,
            });
            await engine.typeset(container, { locale: 'pt-BR' });
            if (formula.querySelector('svg') !== svg) throw new Error('Repeated typesetting replaced the formula');
            container.style.width = '400px';
            if (Math.abs(wideTable.getBoundingClientRect().width - contentWidth(wide)) > 1) throw new Error('Table did not resize with container');
            await session.dispose();
            host.remove();
          }
        } finally {
          await engine.dispose();
        }
        return { results, calls };
      });
      for (const row of result.results) {
        assert.ok(Math.abs(row.width - row.blockWidth) <= 1, JSON.stringify(row));
        for (const key of ['naturalWidth', 'nestedWidth', 'ordinaryWidth']) assert.ok(row[key] < row.width / 2, JSON.stringify(row));
        assert.match(row.alignment, /(?:^|-)center$/);
        assert.match(row.lastAlignment, /(?:^|-)right$/);
        assert.equal(row.layout, 'auto');
        assert.ok(row.formula && row.mathml && row.reference, JSON.stringify(row));
        assert.deepEqual(row.diagnostics, []);
      }
      assert.deepEqual(result.calls, ['F=A*B+C', 'F=A*B+C']);
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ browser: name, version: browser.version(), ...result }));
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
