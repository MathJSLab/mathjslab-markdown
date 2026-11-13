import { sanitizeSVG } from './extensionUtils.js';
import type { MarkdownSVGSource } from '../MarkdownEngine.js';

export const serializeStandaloneSVG = async (source: MarkdownSVGSource): Promise<string> => {
  const sanitized = await sanitizeSVG(typeof source === 'string' ? source : source.svg);
  const template = document.createElement('template');
  template.innerHTML = sanitized;
  const svg = template.content.firstElementChild;
  if (template.content.children.length !== 1 || svg?.localName !== 'svg' || svg.namespaceURI !== 'http://www.w3.org/2000/svg') {
    throw new Error('Visual export must contain one SVG root');
  }
  svg.querySelectorAll('style, image, feImage, animate, animateMotion, animateTransform, set, mpath').forEach((node) => node.remove());
  const elements = [svg, ...svg.querySelectorAll('*')];
  const ids = new Map<string, string>();
  for (const element of elements) {
    const id = element.getAttribute('id');
    if (id === null) continue;
    if (ids.has(id)) throw new Error('Visual export contains duplicate SVG IDs');
    const normalized = 'svg-' + (ids.size + 1);
    ids.set(id, normalized);
    element.id = normalized;
  }
  for (const element of elements) {
    for (const attribute of Array.from(element.attributes)) {
      const { localName, value } = attribute;
      const localReference = /^url\(\s*['"]?#([\w:.-]+)['"]?\s*\)$/i.exec(value);
      if (localName === 'href') {
        const id = value.startsWith('#') ? ids.get(value.slice(1)) : undefined;
        if (id) attribute.value = '#' + id;
        else element.removeAttributeNode(attribute);
      } else if (localName === 'aria-labelledby' || localName === 'aria-describedby') {
        const references = value
          .split(/\s+/)
          .map((id) => ids.get(id))
          .filter(Boolean);
        if (references.length) attribute.value = references.join(' ');
        else element.removeAttributeNode(attribute);
      } else if (localReference && ids.has(localReference[1]!)) {
        attribute.value = 'url(#' + ids.get(localReference[1]!) + ')';
      } else if (localName === 'style' || localName === 'src' || localName === 'base' || /url\s*\(|\\|\/\*/i.test(value)) {
        element.removeAttributeNode(attribute);
      }
    }
  }
  if (typeof source !== 'string') {
    const aliases = new Map<string, string>();
    const rules: string[] = [];
    for (const element of elements) {
      const family = element.getAttribute('font-family');
      if (!family || !source.fonts.has(family)) continue;
      let alias = aliases.get(family);
      if (!alias) {
        const bytes = source.fonts.get(family)!;
        if (bytes.length < 48 || new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0) !== 0x774f4632) throw new Error('Visual export received an invalid WOFF2 font');
        let binary = '';
        for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        alias = 'markdown-svg-font-' + (aliases.size + 1);
        aliases.set(family, alias);
        rules.push(`@font-face{font-family:${alias};src:url("data:font/woff2;base64,${btoa(binary)}") format("woff2");}`);
      }
      element.setAttribute('font-family', alias);
    }
    if (rules.length) {
      const style = svg.ownerDocument.createElementNS(svg.namespaceURI, 'style');
      style.textContent = rules.join('\n');
      svg.prepend(style);
    }
  }
  return new XMLSerializer().serializeToString(svg);
};
