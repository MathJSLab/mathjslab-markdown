import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, firefox, webkit } from 'playwright-core';
import { serveStatic } from '../hdl-browser/static-server.mjs';

const chapter = '/example/digital-electronics/pt/introduction-to-digital-electronics.md';
const server = await serveStatic();
const results = [];
const sources = [[chapter, 'pt-BR'], ...['pt', 'en', 'es'].map((lang) => [`/example/${lang}/blocos-didaticos.md`, lang])];
try {
  for (const name of (process.env.MARKDOWN_EXAMPLE_BROWSERS ?? 'chromium,firefox,webkit').split(',')) {
    const browser = await { chromium, firefox, webkit }[name].launch();
    try {
      for (const [source, locale] of sources) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
        const errors = [];
        const result = { browser: name, version: browser.version(), source, locale, navigations: [] };
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          // Vega's expression compiler needs eval, as in its normal host setup.
          // This fixture policy does not change the package or application's policy.
          await page.route('**/test/browser/example-references.html', async (route) => {
            const response = await route.fetch();
            await route.fulfill({
              response,
              headers: {
                ...response.headers(),
                'content-security-policy':
                  "default-src 'self'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:",
              },
            });
          });
          await page.goto(server.url + '/test/browser/example-references.html');
          await page.waitForFunction(() => window.loadExample);
          await page.evaluate(({ source, locale }) => window.loadExample(source, locale), { source, locale });
          const viewer = page.locator('markdown-document').first();
          await viewer.waitFor({ state: 'attached' });
          await page.waitForFunction(() => window.exampleViewer.state === 'ready', null, { timeout: 60_000 });
          assert.equal(await viewer.locator('[role="alert"]').count(), 0);
          assert.deepEqual(await page.evaluate(() => window.exampleDiagnostics), []);
          if (source === chapter) {
            assert.deepEqual(
              await viewer.locator('[data-markdown-block="figure"] [data-markdown-block-label]').allTextContents(),
              Array.from({ length: 10 }, (_, i) => `Figura ${i + 1}`),
            );
            assert.equal(await viewer.locator('[data-markdown-extension="mermaid"] svg').count(), 6);
            assert.equal(await viewer.locator('[data-markdown-extension="vega-lite"] svg').count(), 2);
            assert.ok((await viewer.locator('mjx-container').count()) > 0);
          }
          const links = await viewer.evaluate((host) =>
            Array.from(host.shadowRoot.querySelectorAll('[data-markdown-reference]'), (span) => {
              const a = span.querySelector('a');
              const target = a && host.shadowRoot.getElementById(a.hash.slice(1));
              return {
                label: span.dataset.markdownReference,
                text: a?.textContent,
                href: a?.getAttribute('href'),
                targetLabel: target?.dataset.markdownLabel ?? target?.dataset.markdownHeading,
                kind: target?.dataset.markdownBlock ?? 'heading',
                before: target ? Boolean(span.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) : null,
              };
            }),
          );
          assert.ok(links.length > 0);
          assert.ok(links.every((link) => link.href?.startsWith('#') && link.label === link.targetLabel && !link.text.includes('{@ref')));
          if (source !== chapter) {
            assert.ok(links.some((link) => link.before) && links.some((link) => link.before === false), 'Exercise both forward and backward references');
            assert.deepEqual([...new Set(links.map((link) => link.kind))].sort(), ['equation', 'exercise', 'figure', 'heading', 'table', 'theorem', 'warning']);
            const labels = {
              pt: ['Equação', 'Exercício', 'Figura', 'Seção', 'Tabela', 'Teorema', 'Advertência'],
              en: ['Equation', 'Exercise', 'Figure', 'Section', 'Table', 'Theorem', 'Warning'],
              es: ['Ecuación', 'Ejercicio', 'Figura', 'Sección', 'Tabla', 'Teorema', 'Advertencia'],
            };
            const kinds = ['equation', 'exercise', 'figure', 'heading', 'table', 'theorem', 'warning'];
            for (const link of links) assert.equal(link.text, `${labels[locale][kinds.indexOf(link.kind)]} ${link.label === 'sec-practice' ? 2 : 1}`);
          }
          result.references = links;
          const url = page.url();
          for (const link of [...new Map(links.map((link) => [link.label, link])).values()]) {
            await viewer.locator(`[data-markdown-reference="${link.label}"] a`).first().click();
            await page.waitForTimeout(2000);
            const samples = [];
            for (let i = 0; i < 3; i++) {
              samples.push(
                await viewer.evaluate((host, id) => {
                  const target = host.shadowRoot.getElementById(id);
                  const caption = target.querySelector('.markdown-block-heading') ?? target;
                  return {
                    top: target.getBoundingClientRect().top,
                    captionTop: caption.getBoundingClientRect().top,
                    captionBottom: caption.getBoundingClientRect().bottom,
                    height: innerHeight,
                  };
                }, link.href.slice(1)),
              );
              if (i < 2) await page.waitForTimeout(100);
            }
            for (const sample of samples) assert.ok(sample.top >= -1 && sample.captionTop >= -1 && sample.captionBottom <= sample.height + 1, JSON.stringify({ link, sample }));
            assert.ok(Math.abs(samples[0].top - samples[2].top) < 0.5, 'Final target position must be stable');
            assert.equal(page.url(), url);
            result.navigations.push({ label: link.label, samples });
          }
          if (source.endsWith('/pt/blocos-didaticos.md')) {
            // Same engine, different URL documents: a target in a sibling viewer
            // must never resolve a reference in the current document.
            const base = await fs.readFile(new URL('../../example/pt/blocos-didaticos.md', import.meta.url), 'utf8');
            const suffix = '\n\n{@ref fig-digitization-flow}\n\n`{@ref pitagoras}`\n\n```markdown\n::: figure Literal {#literal}\n{@ref pitagoras}\n:::\n```\n';
            await page.route('**/isolated-references.md', (route) => route.fulfill({ contentType: 'text/markdown', body: base + suffix }));
            await page.evaluate(({ chapter }) => window.loadExample(chapter), { chapter });
            await page.waitForFunction(() => window.exampleViewer.state === 'ready', null, { timeout: 60_000 });
            await page.evaluate(() => window.loadExample('/isolated-references.md'));
            await page.waitForFunction(() => window.exampleViewer.state === 'ready', null, { timeout: 60_000 });
            const isolated = page.locator('markdown-document').last();
            assert.equal(await isolated.locator('[data-markdown-reference="fig-digitization-flow"] a').count(), 0);
            assert.equal(await isolated.locator('[data-markdown-reference="fig-digitization-flow"]').textContent(), '{@ref fig-digitization-flow}');
            assert.equal(await isolated.locator('code a, [data-markdown-label="literal"]').count(), 0);
            assert.ok((await isolated.locator('pre code').textContent()).includes('{@ref pitagoras}'));
            assert.equal(
              await isolated
                .locator('code')
                .filter({ hasText: /^{@ref pitagoras}$/ })
                .count(),
              1,
            );
            assert.ok((await page.evaluate(() => window.exampleDiagnostics)).some((diagnostic) => diagnostic.code === 'cross-reference-missing'));
            const ids = await page
              .locator('markdown-document')
              .evaluateAll((hosts) => hosts.map((host) => host.shadowRoot.querySelector('[data-markdown-label="pitagoras"]')?.id).filter(Boolean));
            assert.equal(new Set(ids).size, ids.length, 'Block anchors must be document-scoped');
          }
          assert.deepEqual(errors, []);
        } catch (error) {
          result.error = String(error);
        } finally {
          result.errors = errors;
          results.push(result);
          console.log(JSON.stringify({ ...result, navigations: result.navigations.length }));
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
  await fs.mkdir('report', { recursive: true });
  await fs.writeFile('report/example-reference-browser.json', JSON.stringify(results, null, 2));
}
assert.equal(results.filter((result) => result.error).length, 0, 'Published-example browser regressions failed');
