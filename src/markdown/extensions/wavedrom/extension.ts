import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, renderExtensionError, sanitizeSVG } from '../../extensionUtils.js';
import { isMarkdownNodeWithin } from '../../lifecycle.js';
import { waveDromManifest } from './manifest.js';

type WaveSource = Record<string, unknown> & { signal: unknown[]; config?: Record<string, unknown> };
let sequence = 0;

const validate = (value: unknown): WaveSource => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('WaveJSON must be an object with a nonempty signal array');
  const source = value as WaveSource;
  if (!Array.isArray(source.signal) || !source.signal.length) throw new Error('WaveJSON requires a nonempty signal array');
  if (source.config !== undefined && (!source.config || typeof source.config !== 'object' || Array.isArray(source.config))) throw new Error('WaveJSON config must be an object');
  if (source.config?.skin !== undefined && !['default', 'dark'].includes(String(source.config.skin))) throw new Error('Supported WaveDrom skins: default, dark');
  let nodes = 0;
  const check = (item: unknown, depth: number): void => {
    if (++nodes > 20_000 || depth > 32) throw new Error('WaveJSON exceeds the structure limit');
    if (typeof item === 'number' && (!Number.isFinite(item) || Math.abs(item) > 4096)) throw new Error('WaveJSON numbers must be finite and between -4096 and 4096');
    if (item && typeof item === 'object') {
      for (const [key, child] of Object.entries(item)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error(`Unsupported WaveJSON key: ${key}`);
        check(child, depth + 1);
      }
    }
  };
  check(source, 0);
  let lanes = 0;
  let cells = 0;
  const scale = Math.min(100, Math.max(1, Math.round(Number(source.config?.hscale) || 1)));
  const signals = (items: unknown[], group = false): void => {
    items.forEach((item, index) => {
      if (group && index === 0 && (typeof item === 'string' || typeof item === 'number')) return;
      if (Array.isArray(item)) {
        signals(item, true);
        return;
      }
      if (!item || typeof item !== 'object') throw new Error('Each signal must be an object or a named group');
      const lane = item as Record<string, unknown>;
      if (++lanes > 256) throw new Error('WaveJSON exceeds the 256-signal limit');
      if (lane.wave !== undefined && typeof lane.wave !== 'string') throw new Error('Signal wave must be a string');
      if (lane.node !== undefined && typeof lane.node !== 'string') throw new Error('Signal node must be a string');
      if (lane.data !== undefined && typeof lane.data !== 'string' && !Array.isArray(lane.data)) throw new Error('Signal data must be a string or array');
      const period = lane.period === undefined ? 1 : lane.period;
      if (typeof period !== 'number' || period <= 0 || period > 100) throw new Error('Signal period must be greater than zero and at most 100');
      if (lane.phase !== undefined && typeof lane.phase !== 'number') throw new Error('Signal phase must be a number');
      cells += Math.max((lane.wave as string | undefined)?.length ?? 0, (lane.node as string | undefined)?.length ?? 0) * Math.max(1, period * scale);
      if (cells > 65_536) throw new Error('WaveJSON exceeds the 65536 waveform-cell limit');
    });
  };
  signals(source.signal);
  if (!lanes) throw new Error('WaveJSON requires at least one signal');
  return source;
};

/** Namespace before sanitizing: native WaveDrom symbol IDs can start with digits. */
const isolateSVG = (markup: string, css: string, dark: boolean): string => {
  const template = document.createElement('template');
  template.innerHTML = markup;
  const svg = template.content.querySelector('svg');
  if (!svg) throw new Error('WaveDrom did not produce an SVG diagram');
  if (dark) svg.querySelector('[id="waves_0"] > rect')?.setAttribute('style', 'stroke:none;fill:#1e1e1e');
  const prefix = `markdown-wavedrom-${++sequence}-`;
  const ids = new Map<string, string>();
  template.content.querySelectorAll('[id]').forEach((element) => {
    const original = element.id;
    const replacement = `${prefix}${ids.size}`;
    ids.set(original, replacement);
    element.id = replacement;
  });
  if (!svg.id) svg.id = `${prefix}root`;
  template.content.querySelectorAll('style').forEach((style) => style.remove());
  template.content.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      // CSS escapes/comments must not disguise external URL functions.
      if (/\\|\/\*/.test(attribute.value)) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (['href', 'xlink:href', 'src'].includes(attribute.name)) {
        const id = attribute.value.startsWith('#') ? ids.get(attribute.value.slice(1)) : undefined;
        if (id) element.setAttribute(attribute.name, `#${id}`);
        else element.removeAttribute(attribute.name);
      } else if (/url\s*\(/i.test(attribute.value)) {
        let external = false;
        const rewritten = attribute.value.replace(/url\s*\(\s*['"]?([^)'"\s]+)['"]?\s*\)/gi, (_match, reference: string) => {
          const id = reference.startsWith('#') ? ids.get(reference.slice(1)) : undefined;
          if (!id) {
            external = true;
            return '';
          }
          return `url(#${id})`;
        });
        if (external || /url\s*\(/i.test(rewritten.replace(/url\(#[\w-]+\)/g, ''))) element.removeAttribute(attribute.name);
        else element.setAttribute(attribute.name, rewritten);
      }
    }
  });
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  // Only CSS from the bundled skin is retained, with every selector scoped to this SVG.
  style.textContent = css.replace(
    /([^{}]+)\{/g,
    (_match, selectors: string) =>
      `${selectors
        .split(',')
        .map((selector) => `#${svg.id} ${selector.trim()}`)
        .join(',')}{`,
  );
  svg.prepend(style);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'WaveDrom timing diagram');
  return template.innerHTML;
};

export const waveDromExtension = (): MarkdownExtension => {
  let loading: Promise<{ api: typeof import('wavedrom').default; parse: (source: string) => unknown; dark: Record<string, unknown[]> }> | undefined;
  const rendered = new Set<Element>();
  const load = () =>
    (loading ??= Promise.all([
      import(/* webpackChunkName: "markdown-wavedrom" */ 'wavedrom'),
      import(/* webpackChunkName: "markdown-wavedrom" */ 'json5'),
      import(/* webpackChunkName: "markdown-wavedrom" */ 'wavedrom/skins/dark.js'),
    ])
      .then(([{ default: api }, { default: json5 }, { default: dark }]) => ({ api, parse: json5.parse, dark }))
      .catch((error: unknown) => {
        loading = undefined;
        throw error;
      }));
  const clear = (container: Element): void => {
    rendered.delete(container);
    container.replaceChildren();
  };
  const render = async (container: Element, source: string, context: MarkdownDocumentContext): Promise<void> => {
    try {
      assertSourceSize(source, context);
      if (context.signal?.aborted) return;
      const { api, parse, dark } = await load();
      if (context.signal?.aborted) return;
      const input = validate(parse(source));
      const useDark = (input.config?.skin ?? (context.theme === 'dark' ? 'dark' : 'default')) === 'dark';
      input.config = { ...input.config, skin: 'default' };
      const skins = { default: JSON.parse(JSON.stringify(useDark ? dark.dark : api.waveSkin.default)) as unknown[] };
      const css = (skins.default[2] as unknown[])[2] as string;
      // Index zero initializes lane geometry and includes all symbol definitions.
      const svg = await sanitizeSVG(isolateSVG(api.onml.stringify(api.renderAny(0, input, skins)), css, useDark));
      if (context.signal?.aborted) return;
      container.innerHTML = svg;
      container.querySelector('svg')?.setAttribute('role', 'img');
      container.querySelector('svg')?.setAttribute('aria-label', 'WaveDrom timing diagram');
      rendered.add(container);
    } catch (error) {
      if (!context.signal?.aborted) renderExtensionError(container, 'WaveDrom', 'wavedrom', source, error, context);
    }
  };
  return {
    name: waveDromManifest.name,
    manifest: waveDromManifest,
    fences: [{ ...waveDromManifest.fences[0], render, dispose: clear }],
    disposeContainer(container) {
      for (const element of rendered) if (isMarkdownNodeWithin(container, element)) clear(element);
    },
    dispose() {
      for (const element of rendered) element.replaceChildren();
      rendered.clear();
      loading = undefined;
    },
  };
};
