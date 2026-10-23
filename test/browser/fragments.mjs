import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { serveStatic } from '../hdl-browser/static-server.mjs';

const playwright = await import(process.env.MARKDOWN_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.MARKDOWN_PLAYWRIGHT_MODULE).href : 'playwright-core');
const list = (name, fallback) => (process.env[name] ?? fallback).split(',');
const repeats = Number(process.env.MARKDOWN_FRAGMENT_REPEATS ?? 1);
assert.ok(Number.isInteger(repeats) && repeats > 0, 'Repeat count must be a positive integer');
const source = `# References\n\n{@ref gates}\n\n[Ordinary link](#gates)\n\n${'Paragraph.\n\n'.repeat(60)}## 2.3 Logic gates {#gates}\n\n{@ref notes}\n\n## Notes {#notes}`;
const server = await serveStatic();
const results = [];
const versions = {};
const failures = [];
try {
  // Intentionally sequential: never overlap browsers, cases, or a build.
  for (const name of list('MARKDOWN_FRAGMENT_BROWSERS', 'chromium,firefox,webkit')) {
    const browser = await playwright[name].launch();
    versions[name] = browser.version();
    console.log(name, versions[name]);
    try {
      for (let repeat = 1; repeat <= repeats; repeat++)
        for (const locale of list('MARKDOWN_FRAGMENT_LOCALES', 'pt,en,es'))
          for (const reducedMotion of list('MARKDOWN_FRAGMENT_MOTION', 'no-preference,reduce'))
            for (const scenario of list('MARKDOWN_FRAGMENT_SCENARIOS', 'document,large,nested,collection')) {
              const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion });
              const errors = [];
              page.on('pageerror', (error) => errors.push(error.message));
              const result = { browser: name, locale, reducedMotion, scenario, repeat, actions: [] };
              try {
                await page.route('**/chapter.md', (route) => route.fulfill({ contentType: 'text/markdown', body: source }));
                await page.goto(server.url + '/test/browser/fragments.html');
                await page.waitForFunction(() => window.createFragmentFixture);
                await page.evaluate((options) => window.createFragmentFixture(options), { locale, scenario });
                const viewer = page.locator('markdown-document');
                await page.waitForFunction(() => window.fragmentViewer.state === 'ready');
                await page.evaluate(() => new Promise(requestAnimationFrame));
                const url = page.url();
                const section = { pt: 'Seção', en: 'Section', es: 'Sección' }[locale];
                assert.equal(await viewer.locator('[data-markdown-reference] a[href="#gates"]').textContent(), `${section} 2.3`);
                assert.equal(await viewer.locator('[data-markdown-reference] a[href="#notes"]').textContent(), 'Notes');
                for (const action of ['reference', 'ordinary', 'outline', 'unnumbered']) {
                  await page.evaluate(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    for (const clip of window.fragmentClips) clip.scrollTo({ top: 0, behavior: 'instant' });
                    window.fragmentScrollCalls = [];
                  });
                  const id = action === 'unnumbered' ? 'notes' : 'gates';
                  const link =
                    action === 'outline'
                      ? viewer.locator('[data-fragment="gates"]')
                      : action === 'ordinary'
                        ? viewer.locator('article > p > a[href="#gates"]')
                        : viewer.locator(`[data-markdown-reference] a[href="#${id}"]`);
                  if (action === 'ordinary') {
                    await link.focus();
                    await link.press('Enter');
                  } else await link.click();
                  // A transient intersection during smooth scrolling is insufficient.
                  // Inspect the final position two seconds later and its stability.
                  await page.waitForTimeout(2000);
                  const samples = [];
                  for (let sample = 0; sample < 3; sample++) {
                    samples.push(
                      await viewer.locator(`#${id}`).evaluate((heading) => {
                        const rect = heading.getBoundingClientRect();
                        const clips = window.fragmentClips.map((clip) => {
                          const bounds = clip.getBoundingClientRect();
                          return {
                            top: bounds.top + clip.clientTop,
                            bottom: bounds.top + clip.clientTop + clip.clientHeight,
                            left: bounds.left + clip.clientLeft,
                            right: bounds.left + clip.clientLeft + clip.clientWidth,
                          };
                        });
                        return {
                          top: rect.top,
                          bottom: rect.bottom,
                          left: rect.left,
                          right: rect.right,
                          clips,
                          viewportHeight: innerHeight,
                          viewportWidth: innerWidth,
                          calls: window.fragmentScrollCalls,
                        };
                      }),
                    );
                    if (sample < 2) await page.waitForTimeout(100);
                  }
                  result.actions.push({ action, id, samples });
                  for (const geometry of samples) {
                    const top = Math.max(0, ...geometry.clips.map((clip) => clip.top));
                    const bottom = Math.min(geometry.viewportHeight, ...geometry.clips.map((clip) => clip.bottom));
                    const left = Math.max(0, ...geometry.clips.map((clip) => clip.left));
                    const right = Math.min(geometry.viewportWidth, ...geometry.clips.map((clip) => clip.right));
                    assert.ok(geometry.bottom > top && geometry.top < bottom, `Heading outside viewport: ${JSON.stringify(geometry)}`);
                    assert.ok(geometry.right > left && geometry.left < right, `Heading outside horizontal viewport: ${JSON.stringify(geometry)}`);
                    assert.ok(geometry.top >= top - 1 && geometry.bottom <= bottom + 1, `Heading must be fully visible inside all scrollports: ${JSON.stringify(geometry)}`);
                    assert.ok(geometry.left >= left - 1 && geometry.right <= right + 1, `Heading must be fully visible horizontally: ${JSON.stringify(geometry)}`);
                  }
                  assert.ok(Math.abs(samples[2].top - samples[0].top) < 0.5, 'Final scroll position must be stable');
                  assert.deepEqual(
                    samples[2].calls.map(({ id, state, options }) => ({ id, state, options })),
                    [{ id, state: 'ready', options: { block: 'start', behavior: reducedMotion === 'reduce' ? 'auto' : 'smooth' } }],
                  );
                  assert.equal(page.url(), url, 'Fragment navigation must remain inside the component');
                  assert.equal(await viewer.getAttribute('aria-busy'), 'false');
                  assert.equal(await viewer.locator(`[data-fragment="${id}"]`).getAttribute('aria-current'), 'location');
                  assert.ok((await viewer.locator('[part="announcer"]').textContent()).includes(id === 'notes' ? 'Notes' : '2.3 Logic gates'));
                }
                assert.deepEqual(errors, []);
                result.passed = true;
              } catch (error) {
                result.error = String(error);
                failures.push(result);
              } finally {
                results.push(result);
                console.log(JSON.stringify({ ...result, actions: result.actions.map(({ action, samples }) => ({ action, final: samples.at(-1) })) }));
                await page.close();
              }
            }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
  await mkdir('report', { recursive: true });
  await writeFile('report/fragment-navigation.json', JSON.stringify({ versions, results, failures }, null, 2));
}
assert.equal(failures.length, 0, `${failures.length} fragment navigation cases failed; see report/fragment-navigation.json`);
console.log(`Passed ${results.length} cases, ${results.reduce((count, result) => count + result.actions.length, 0)} navigations.`);
