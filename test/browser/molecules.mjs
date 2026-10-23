import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, firefox, webkit } from 'playwright-core';
import { serveStatic } from '../hdl-browser/static-server.mjs';

const server = await serveStatic();
const results = [];
try {
  // Build first; engines and cases run sequentially.
  for (const name of (process.env.MARKDOWN_MOLECULE_BROWSERS ?? 'chromium,firefox,webkit').split(',')) {
    const browser = await { chromium, firefox, webkit }[name].launch();
    try {
      for (const mode of (process.env.MARKDOWN_MOLECULE_MODES ?? 'native,absent').split(','))
        for (const language of ['pdb', 'xyz']) {
          const page = await browser.newPage();
          const errors = [];
          const result = { browser: name, version: browser.version(), mode, language };
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
          });
          try {
            if (mode === 'absent')
              await page.addInitScript(() => {
                if (!Reflect.deleteProperty(globalThis, 'OffscreenCanvas')) throw Error('Cannot remove OffscreenCanvas for absence regression');
              });
            await page.goto(server.url + '/test/browser/molecules.html');
            await page.waitForFunction(() => window.moleculeProbe);
            const sourceApi = await page.evaluate(async () => {
              const before = typeof OffscreenCanvas;
              const runtime = await import('/dist/source/markdown/extensions/molecule-3d/vendor/3dmol.js');
              return { api: typeof runtime.default.createViewer, before, after: typeof OffscreenCanvas };
            });
            assert.equal(sourceApi.api, 'function', 'Published ES-module runtime must load without a consumer plugin');
            assert.equal(sourceApi.after, sourceApi.before);
            result.render = await page.evaluate(({ language }) => window.moleculeProbe.render(language, 'en'), { language });
            assert.deepEqual(result.render.alerts, []);
            assert.equal(result.render.after, result.render.before, 'Runtime must not define or replace OffscreenCanvas');
            assert.equal(result.render.bindingAfter, result.render.bindingBefore);
            if (mode === 'absent') {
              assert.equal(result.render.before, 'undefined');
              assert.equal(result.render.bindingAfter, false, 'Absent means no binding, not an artificial undefined value');
            }
            const offscreenUsable =
              result.render.contexts.some((context) => context.available && context.canvas === 'OffscreenCanvas' && context.type === 'webgl2') &&
              result.render.contexts.some((context) => context.available && context.type === 'bitmaprenderer');
            assert.ok(result.render.drawCanvases.includes(offscreenUsable ? 'OffscreenCanvas' : 'HTMLCanvasElement'), 'Render with the usable native canvas path');
            await page.waitForFunction(() => window.moleculeProbe.snapshot()?.colored > 100);
            result.initial = await page.evaluate(() => window.moleculeProbe.snapshot());
            assert.ok(result.initial.draws > 0, 'Must render real WebGL molecular geometry');
            assert.match(result.initial.label, /molecular structure/);
            await page.evaluate(() => window.moleculeProbe.resize());
            await page.waitForFunction((width) => window.moleculeProbe.snapshot().width < width, result.initial.width);
            await page.waitForFunction(() => window.moleculeProbe.snapshot().colored > 100);
            result.resized = await page.evaluate(() => window.moleculeProbe.snapshot());
            assert.ok(result.resized.draws > result.initial.draws);
            result.disposed = await page.evaluate(() => window.moleculeProbe.dispose());
            assert.equal(result.disposed.canvases, 0);
            assert.equal(result.disposed.disconnected, 1);
            await page.waitForTimeout(150);
            assert.equal(await page.evaluate(() => window.moleculeProbe.draws()), result.disposed.draws, 'No rendering after disposal');
            assert.deepEqual(errors, []);
          } catch (error) {
            result.error = String(error);
          } finally {
            result.errors = errors;
            results.push(result);
            console.log(JSON.stringify(result));
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
  await writeFile(process.env.MARKDOWN_MOLECULE_REPORT ?? 'report/molecule-rendering.json', JSON.stringify(results, null, 2));
}
assert.equal(results.filter((result) => result.error).length, 0, 'Molecular regression failed; see report');
