import type { MarkdownDocumentContext, MarkdownExtension } from '../../../MarkdownEngine.js';
import { assertSourceSize, renderExtensionError, sanitizeSVG } from '../../extensionUtils.js';
import { isMarkdownNodeWithin } from '../../lifecycle.js';
import { waveDromManifest } from './manifest.js';

type WaveSource = Record<string, unknown> & { signal?: unknown[]; reg?: unknown[]; assign?: unknown[]; config?: Record<string, unknown> };
let sequence = 0;

const validate = (value: unknown): WaveSource => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('WaveJSON must be an object with one diagram family');
  const source = value as WaveSource;
  const families = ['signal', 'reg', 'assign'].filter((key) => Object.hasOwn(source, key));
  if (families.length !== 1) throw new Error('WaveJSON requires exactly one of signal, reg or assign');
  const family = families[0]!;
  if (!Array.isArray(source[family]) || !(source[family] as unknown[]).length) throw new Error(`WaveJSON requires a nonempty ${family} array`);
  if (source.config !== undefined && (!source.config || typeof source.config !== 'object' || Array.isArray(source.config))) throw new Error('WaveJSON config must be an object');
  if (source.config?.skin !== undefined && !['default', 'dark'].includes(String(source.config.skin))) throw new Error('Supported WaveDrom skins: default, dark');
  let nodes = 0;
  const check = (item: unknown, depth: number, numericLabel = false): void => {
    if (++nodes > 20_000 || depth > 32) throw new Error('WaveJSON exceeds the structure limit');
    if (typeof item === 'number' && (!Number.isFinite(item) || Math.abs(item) > (numericLabel ? 0xffff_ffff : 4096)))
      throw new Error('WaveJSON numbers exceed finite layout or register-label limits');
    if (item && typeof item === 'object') {
      for (const [key, child] of Object.entries(item)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error(`Unsupported WaveJSON key: ${key}`);
        check(child, depth + 1, numericLabel || (family === 'reg' && (key === 'name' || key === 'attr')));
      }
    }
  };
  check(source, 0);
  if (family === 'reg') {
    let bits = 0;
    for (const field of source.reg!) {
      if (!field || typeof field !== 'object' || Array.isArray(field)) throw new Error('Register fields must be objects');
      const entry = field as Record<string, unknown>;
      if (typeof entry.bits !== 'number' || !Number.isInteger(entry.bits) || entry.bits < 1) throw new Error('Register field bits must be positive integers');
      if (typeof entry.name === 'number' && entry.bits > 32) throw new Error('Numeric register names support at most 32 bits; use a text label for wider fields');
      bits += entry.bits;
      if (bits > 4096 || source.reg!.length > 256) throw new Error('Register exceeds field or bit limits');
      for (const key of ['name', 'attr']) {
        const label = entry[key];
        if (
          label !== undefined &&
          typeof label !== 'string' &&
          typeof label !== 'number' &&
          !(key === 'attr' && Array.isArray(label) && label.every((item) => typeof item === 'string' || typeof item === 'number'))
        )
          throw new Error('Register labels must be text or numbers');
      }
      if (Array.isArray(entry.attr) && entry.attr.length > 16) throw new Error('Register exceeds attribute limit');
    }
    const config = source.config ?? {};
    for (const key of ['bits', 'lanes', 'hspace', 'vspace', 'fontsize'])
      if (config[key] !== undefined && (typeof config[key] !== 'number' || !Number.isInteger(config[key]) || (config[key] as number) < 1))
        throw new Error(`Register ${key} must be a positive integer`);
    if (config.bits !== undefined && (config.bits as number) < bits) throw new Error('Register config.bits cannot be smaller than its fields');
    if (Number(config.lanes ?? 1) > Math.min(256, Number(config.bits ?? bits))) throw new Error('Register lanes exceed available bits or lane limit');
    if (Number(config.bits ?? bits) * Number(config.lanes ?? 1) > 65_536) throw new Error('Register exceeds expanded bit limit');
    if (Number(config.fontsize ?? 14) > 64 || Number(config.vspace ?? 60) > 512) throw new Error('Register font or vertical spacing exceeds layout limit');
    return source;
  }
  if (family === 'assign') {
    let gates = 0;
    const expression = (value: unknown, depth: number): void => {
      if (++gates > 512 || depth > 16) throw new Error('Logic expression exceeds gate or depth limits');
      if (typeof value === 'string' && value.length > 0 && value.length <= 256) return;
      if (!Array.isArray(value) || value.length < 2 || !['&', '~&', '|', '~|', '^', '~^', '~', '=', '+', '-', '*'].includes(String(value[0])))
        throw new Error('Unsupported logic expression; use operator arrays and signal names');
      if (value[0] === '~' && value.length !== 2) throw new Error('NOT requires one operand');
      value.slice(1).forEach((child) => expression(child, depth + 1));
    };
    if (source.assign!.length > 64) throw new Error('Logic diagram exceeds output limit');
    for (const output of source.assign!) {
      if (!Array.isArray(output) || output.length !== 2 || typeof output[0] !== 'string' || !output[0].length || output[0].length > 256)
        throw new Error('Assignments require [output name, expression]');
      expression(output[1], 0);
    }
    for (const key of ['fontWidth', 'treeSpacing'])
      if (source.config?.[key] !== undefined && (typeof source.config[key] !== 'number' || source.config[key] <= 0 || source.config[key] > 128))
        throw new Error(`Logic ${key} must be between 0 and 128`);
    return source;
  }
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
  signals(source.signal!);
  if (!lanes) throw new Error('WaveJSON requires at least one signal');
  return source;
};

/** Namespace before sanitizing: native WaveDrom symbol IDs can start with digits. */
const isolateSVG = (markup: string, css: string, dark: boolean, monochrome = false): string => {
  const template = document.createElement('template');
  template.innerHTML = markup;
  const svg = template.content.querySelector('svg');
  if (!svg) throw new Error('WaveDrom did not produce an SVG diagram');
  if (dark) svg.querySelector('[id="waves_0"] > rect')?.setAttribute('style', 'stroke:none;fill:#1e1e1e');
  if (dark && monochrome) {
    // Register palette fills are bright; keep white labels readable on dark
    // pages while retaining the field's native color coding.
    svg.querySelectorAll('rect[style*="fill:"]').forEach((element) => element.setAttribute('style', `${element.getAttribute('style')};fill-opacity:.25`));
    svg.querySelectorAll('[stroke], [fill]').forEach((element) => {
      for (const name of ['stroke', 'fill']) {
        const color = element.getAttribute(name);
        if (color === 'black' || color === '#000') element.setAttribute(name, '#eee');
        if (color === 'white' || color === '#fff') element.setAttribute(name, '#1e1e1e');
      }
    });
    css = css
      .replace(/#eee\b/g, '#333')
      .replace(/#ecc\b/g, '#533')
      .replace(/#cce\b/g, '#335')
      .replace(/#aaa\b/g, '#444')
      .replace(/#777\b/g, '#555')
      .replace(/#ccc\b/g, '#777')
      .replace(/#000\b/g, '#eee')
      .replace(/#fff\b/g, '#1e1e1e');
  }
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
  // <use> instances have their own SVG shadow tree. Ancestor-scoped selectors
  // cannot reliably style those copies; materialize trusted skin rules on the
  // symbol definitions so fill/stroke survive instancing inside a Web Component.
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const element of svg.querySelectorAll(rule[1]!.trim())) {
      element.setAttribute('style', `${rule[2]};${element.getAttribute('style') ?? ''}`);
    }
  }
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
      const tree = api.renderAny(0, input, skins);
      // assign's direct style child is generated by the library, never by input:
      // its restricted grammar accepts only operator arrays and text leaves.
      const nativeCSS = input.assign
        ? tree
            .filter((child) => Array.isArray(child) && child[0] === 'style')
            .map((child) => (child as unknown[])[1])
            .join('')
        : '';
      const svg = await sanitizeSVG(isolateSVG(api.onml.stringify(tree), input.signal ? css : `${nativeCSS}\ntext{fill:#000}`, useDark, !input.signal));
      if (context.signal?.aborted) return;
      container.innerHTML = svg;
      container.querySelector('svg')?.setAttribute('role', 'img');
      container.querySelector('svg')?.setAttribute('aria-label', input.reg ? 'WaveDrom register diagram' : input.assign ? 'WaveDrom logic diagram' : 'WaveDrom timing diagram');
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
