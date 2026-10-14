import fs from 'node:fs';
import createModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('');
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
const { default: createDOMPurify } = await import('dompurify');
const { sanitizeSVG } = await import('../dist/source/markdown/extensionUtils.js');
const module = await createModule();
const purifier = createDOMPurify(new JSDOM('').window);
const document = fs.readFileSync(process.argv[2] ?? new URL('../test/markdown/extensions/verovio.md', import.meta.url), 'utf8');
for (const language of ['mei', 'musicxml']) {
  const source = document.match(new RegExp('```' + language + '\\r?\\n([\\s\\S]*?)```'))[1];
  const toolkit = new VerovioToolkit(module);
  toolkit.setOptions({ inputFrom: language, svgViewBox: true, adjustPageHeight: true, scale: 35 });
  const valid = toolkit.loadData(source);
  const svg = toolkit.renderToSVG(1, {});
  const safe = purifier.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['script', 'foreignObject'] });
  const fixed = await sanitizeSVG(svg);
  fs.mkdirSync('report/extension-audit', { recursive: true });
  fs.writeFileSync('report/extension-audit/' + language + '-raw.svg', svg);
  fs.writeFileSync('report/extension-audit/' + language + '-safe.svg', safe);
  fs.writeFileSync('report/extension-audit/' + language + '-fixed.svg', fixed);
  console.log({
    language,
    valid,
    raw: svg.length,
    safe: safe.length,
    rawUses: (svg.match(/<use /g) || []).length,
    safeUses: (safe.match(/<use /g) || []).length,
    fixedUses: (fixed.match(/<use /g) || []).length,
  });
  toolkit.destroy();
}
