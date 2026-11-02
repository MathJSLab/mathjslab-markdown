import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
const { serveStatic } = await import(pathToFileURL(path.resolve('test/hdl-browser/static-server.mjs')).href);
const server = await serveStatic();
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(server.url + '/test/browser/structured-blocks.html');
  const results = await page.evaluate(async () => {
    const { createEducationalMarkdownEngine } = await import('/dist/browser/core.js');
    let draws = 0,
      colored = 0;
    for (const name of ['drawArrays', 'drawElements']) {
      const original = WebGL2RenderingContext.prototype[name];
      WebGL2RenderingContext.prototype[name] = function (...args) {
        const value = original.apply(this, args);
        draws++;
        if (!this.getParameter(this.FRAMEBUFFER_BINDING)) {
          const pixels = new Uint8Array(this.drawingBufferWidth * this.drawingBufferHeight * 4);
          this.readPixels(0, 0, this.drawingBufferWidth, this.drawingBufferHeight, this.RGBA, this.UNSIGNED_BYTE, pixels);
          let count = 0;
          for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) count++;
          colored = Math.max(colored, count);
        }
        return value;
      };
    }
    const engine = createEducationalMarkdownEngine({ features: ['model-3d', 'verovio'] });
    const results = [];
    const check = (condition, message) => {
      if (!condition) throw new Error(message);
    };
    try {
      for (const [language, file] of [
        ['obj', '/example/en/octaedro-em-obj.md'],
        ['stl', '/example/en/cubo-em-stl.md'],
        ['mei', '/test/markdown/extensions/verovio.md'],
        ['musicxml', '/test/markdown/extensions/verovio.md'],
      ]) {
        const source = await (await fetch(file)).text();
        const fence = source.match(new RegExp('```' + language + '\\r?\\n[\\s\\S]*?```'))?.[0];
        check(fence, `Missing ${language} fixture`);
        const container = document.createElement('article');
        container.style.width = '640px';
        document.body.append(container);
        const diagnostics = [];
        colored = 0;
        const session = await engine.renderDocument(fence, container, { sourceUrl: new URL(file, location.href), onDiagnostic: (d) => diagnostics.push(d.code) });
        check(diagnostics.length === 0, `${language}: ${diagnostics.join(',')}`);
        if (language === 'obj' || language === 'stl') {
          const canvas = container.querySelector('canvas');
          check(canvas, `${language}: missing canvas`);
          check(colored > 100, `${language}: no visible WebGL geometry`);
          const width = canvas.width;
          container.style.width = '320px';
          await new Promise((resolve) => setTimeout(resolve, 150));
          check(canvas.width < width, `${language}: resize failed`);
          await session.dispose();
          check(!container.querySelector('canvas'), `${language}: canvas retained`);
          const completed = draws;
          await new Promise((resolve) => setTimeout(resolve, 100));
          check(draws === completed, `${language}: draws after disposal`);
          results.push({ language, draws, colored, disposed: true });
        } else {
          check(container.querySelector('svg path, svg use'), `${language}: no notation geometry`);
          await session.dispose();
          check(!container.querySelector('svg'), `${language}: score retained`);
          results.push({ language, disposed: true });
        }
        container.remove();
      }
    } finally {
      await engine.dispose();
    }
    return results;
  });
  assert.deepEqual(errors, []);
  await mkdir('report', { recursive: true });
  await writeFile('report/dependency-renderers.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally {
  await browser?.close();
  await server.close();
}
