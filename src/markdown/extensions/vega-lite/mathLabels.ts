import type { MarkdownDocumentContext } from '../../../MarkdownEngine.js';
import { serializeStandaloneSVG } from '../../visualExport.js';

const ns = 'http://www.w3.org/2000/svg';
const anchorSelector = 'g.mark-text.markdown_math > text, g.mark-text.markdown_math_marks > text';
let nextNamespace = 0;

export const prepareMathLabels = async (container: Element, context: MarkdownDocumentContext): Promise<((root: ParentNode) => void) | undefined> => {
  const { vegaMathLabels: labels, signal } = context;
  if (!labels || !container.querySelector(anchorSelector)) return;
  const keys = new Set(Array.from(container.querySelectorAll(anchorSelector), (anchor) => anchor.textContent ?? ''));
  const selected = Object.entries(labels).filter(([key]) => keys.has(key));
  if (!selected.length) return;

  const { loadMathJax } = await import('../mathjax/extension.js');
  const mathJax = await loadMathJax();
  if (!mathJax.tex2svgPromise) throw new Error('MathJax SVG conversion is unavailable');
  const fragments = new Map<string, { svg: SVGSVGElement; name: string }>();
  const namespace = 'markdown-math-' + ++nextNamespace;
  for (const [key, { tex, accessibleName }] of selected) {
    signal?.throwIfAborted();
    if (!tex.trim() || !accessibleName.trim()) continue;
    const output = await mathJax.tex2svgPromise(tex, { display: false });
    signal?.throwIfAborted();
    const raw = output.querySelector('svg');
    if (!raw || raw.querySelector('[data-mjx-error]')) continue;
    const template = container.ownerDocument.createElement('template');
    template.innerHTML = await serializeStandaloneSVG(raw.outerHTML);
    const svg = template.content.querySelector('svg');
    if (!svg?.querySelector('path, rect, use')) continue;
    if (raw.querySelectorAll('use').length !== svg.querySelectorAll('use').length) continue;
    const bounds = svg.getAttribute('viewBox')?.split(/\s+/).map(Number);
    if (!bounds || bounds.length !== 4 || bounds.some((number) => !Number.isFinite(number))) continue;
    const [, top, width, height] = bounds as [number, number, number, number];
    if (width <= 0 || height <= 0) continue;
    svg.setAttribute('x', String(-width * 0.007));
    svg.setAttribute('y', String(top * 0.014));
    svg.setAttribute('width', String(width * 0.014));
    svg.setAttribute('height', String(height * 0.014));
    svg.removeAttribute('style');
    svg.setAttribute('aria-hidden', 'true');
    svg.querySelectorAll('style, image, a, animate, animateMotion, animateTransform, set').forEach((node) => node.remove());
    const localIds = new Set(Array.from(svg.querySelectorAll('[id]'), (node) => node.id));
    if (Array.from(svg.querySelectorAll('use')).some((use) => !localIds.has((use.getAttribute('href') ?? use.getAttribute('xlink:href') ?? '').slice(1)))) continue;
    fragments.set(key, { svg, name: accessibleName });
  }

  return (root) => {
    root.querySelectorAll('[data-markdown-math-label]').forEach((node) => node.remove());
    let sequence = 0;
    for (const anchor of root.querySelectorAll(anchorSelector)) {
      const fragment = fragments.get(anchor.textContent ?? '');
      if (!fragment) continue;
      const annotation = anchor.ownerDocument.createElementNS(ns, 'g');
      annotation.setAttribute('data-markdown-math-label', '');
      const chart = anchor.closest('svg')!;
      const transforms = [];
      for (let node: Element | null = anchor; node && node !== chart; node = node.parentElement) {
        const transform = node.getAttribute('transform');
        if (transform) transforms.unshift(transform);
      }
      annotation.setAttribute('transform', transforms.join(' '));
      annotation.setAttribute('color', context.theme === 'dark' ? '#f4f4f4' : '#202020');
      annotation.setAttribute('role', 'img');
      annotation.setAttribute('aria-label', fragment.name);
      const svg = fragment.svg.cloneNode(true) as SVGSVGElement;
      const prefix = namespace + '-' + sequence++;
      const ids = new Map<string, string>();
      for (const node of svg.querySelectorAll('[id]')) {
        const id = prefix + '-' + ids.size;
        ids.set(node.id, id);
        node.id = id;
      }
      for (const use of svg.querySelectorAll('use')) {
        const key = use.getAttribute('href') ?? use.getAttribute('xlink:href') ?? '';
        use.removeAttribute('xlink:href');
        use.setAttribute('href', '#' + ids.get(key.slice(1)));
      }
      annotation.append(svg);
      chart.append(annotation);
      anchor.setAttribute('opacity', '0');
      anchor.setAttribute('aria-hidden', 'true');
    }
  };
};
