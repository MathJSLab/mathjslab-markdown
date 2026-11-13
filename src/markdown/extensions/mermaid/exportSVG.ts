// Capture the SVG presentation properties that Mermaid supplies through CSS.
const presentation = [
  'color',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
  'alignment-baseline',
  'letter-spacing',
  'opacity',
  'visibility',
  'marker-start',
  'marker-mid',
  'marker-end',
  'stop-color',
  'stop-opacity',
] as const;

export const exportMermaidSVG = (svg: SVGSVGElement): string => {
  if (svg.querySelector('foreignObject, image, feImage')) {
    throw new Error('Mermaid SVG export requires SVG labels and no embedded images. Set htmlLabels: false in the diagram configuration.');
  }
  const view = svg.ownerDocument.defaultView;
  if (!view || !svg.isConnected) throw new Error('Mount the Mermaid diagram before exporting its styles');

  const copy = svg.cloneNode(true) as SVGSVGElement;
  const ids = new Set(Array.from(svg.querySelectorAll('[id]'), (element) => element.id));
  const originals = [svg, ...svg.querySelectorAll('*')];
  const copies = [copy, ...copy.querySelectorAll('*')];
  for (const [index, original] of originals.entries()) {
    const target = copies[index]!;
    const computed = view.getComputedStyle(original);
    for (const property of presentation) {
      const value = computed.getPropertyValue(property);
      const url = /^url\(["']?([^"')]+)["']?\)$/i.exec(value);
      if (url) {
        const reference = new URL(url[1]!, svg.ownerDocument.baseURI);
        const id = reference.hash.slice(1);
        reference.hash = '';
        const documentUrl = new URL(svg.ownerDocument.URL);
        documentUrl.hash = '';
        if (reference.href === documentUrl.href && ids.has(id)) target.setAttribute(property, `url(#${id})`);
      } else if (value && !/url\s*\(|\\|\/\*/i.test(value)) {
        target.setAttribute(property, value);
      }
    }
  }
  const [, , width, height] = (copy.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
  if (width && height && width > 0 && height > 0) {
    copy.setAttribute('width', String(width));
    copy.setAttribute('height', String(height));
  }
  return copy.outerHTML;
};
