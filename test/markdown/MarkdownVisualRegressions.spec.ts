/// <reference types="jest" />
import { jest } from '@jest/globals';
import { TextEncoder } from 'node:util';
import { MarkdownEngine } from '../../src/MarkdownEngine';
import { sanitizeSVG, fetchResource, renderExtensionError } from '../../src/markdown/extensionUtils';
import { DefaultMarkdownResourceService } from '../../src/markdown/security';

Object.assign(globalThis, { TextEncoder });

it('preserves local SVG music glyphs but rejects external use references and active content', async () => {
  const svg = await sanitizeSVG(
    '<svg xmlns="http://www.w3.org/2000/svg"><defs><g id="note"><path d="M0 0L10 10"/></g></defs><g class="note"><use href="#note"/></g><use href="https://outside.test/note.svg#note"/><use href="#note" xlink:href="https://outside.test/evil.svg"/><script>bad()</script><foreignObject>bad</foreignObject></svg>',
  );
  const container = document.createElement('div');
  container.innerHTML = svg;
  expect(container.querySelectorAll('use')).toHaveLength(1);
  expect(container.querySelector('.note use')?.getAttribute('href')).toBe('#note');
  expect(container.querySelector('script, foreignObject')).toBeNull();
});

it('installs syntax styles inside Shadow DOM and dimensions before a fence renderer runs', async () => {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  root.append(container);
  const render = jest.fn(async () => {
    expect(root.querySelector('[data-markdown-extension-style="sized"]')?.textContent).toContain('height: 300px');
  });
  const engine = new MarkdownEngine({
    profile: 'core',
    extensions: [
      {
        name: 'sized',
        manifest: { name: 'sized', description: '', dependencies: [], fences: [], styles: '.sized { height: 300px; }' },
        fences: [{ language: 'sized', className: 'sized', render }],
      },
    ],
  });
  await engine.render('```javascript\nconst count = 42;\n```\n\n```sized\nx\n```', container);
  expect(render).toHaveBeenCalledTimes(1);
  expect(root.querySelector('code')?.className).toBe('hljs language-javascript');
  expect(root.querySelector('code .hljs-keyword')?.textContent).toBe('const');
  expect(root.querySelector('code .hljs-number')?.textContent).toBe('42');
  expect(root.querySelector('[data-markdown-extension-style="syntax-highlight"]')).not.toBeNull();
  await engine.dispose();
});

it('includes the resolved resource URL, extension and language in safe local diagnostics', async () => {
  const url = new URL('https://course.test/docs/lesson.md');
  const fetcher = async () => ({ ok: false, status: 404, statusText: 'Not Found', headers: new Headers() }) as Response;
  const context = { sourceUrl: url, fetchResource: fetcher };
  await expect(fetchResource('missing.json', context)).rejects.toThrow('https://course.test/docs/missing.json');
  const resources = new DefaultMarkdownResourceService();
  await expect(resources.fetch('missing.json', context)).rejects.toThrow('https://course.test/docs/missing.json');
  const container = document.createElement('div');
  renderExtensionError(container, 'Map', 'geojson', '{}', new Error('404 <script>bad()</script>'), context);
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('Map (geojson): 404');
  expect(container.querySelector('script')).toBeNull();
  resources.dispose();
});
