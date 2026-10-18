import type { MarkdownExtension, MarkdownExtensionManifest } from '../MarkdownEngine.js';
import { citationsExtension } from './extensions/citations/extension.js';
import { citationsManifest } from './extensions/citations/manifest.js';
import { tikzExtension } from './extensions/tikz/extension.js';
import { tikzManifest } from './extensions/tikz/manifest.js';
import { geometryExtension } from './extensions/geometry/extension.js';
import { geometryManifest } from './extensions/geometry/manifest.js';
import { didacticExtension } from './extensions/didactic/extension.js';
import { didacticManifest } from './extensions/didactic/manifest.js';
import { crossReferencesExtension } from './extensions/cross-references/extension.js';
import { crossReferencesManifest } from './extensions/cross-references/manifest.js';
import { abcExtension } from './extensions/abc/extension.js';
import { abcManifest } from './extensions/abc/manifest.js';
import { graphvizExtension } from './extensions/graphviz/extension.js';
import { graphvizManifest } from './extensions/graphviz/manifest.js';
import { netlistExtension } from './extensions/netlist/extension.js';
import { netlistManifest } from './extensions/netlist/manifest.js';
import { hdlManifest } from './extensions/hdl/manifest.js';
import { vcdExtension } from './extensions/vcd/extension.js';
import { vcdManifest } from './extensions/vcd/manifest.js';
import { hdlInteractiveManifest } from './extensions/hdl-interactive/manifest.js';
import { headingIdsExtension } from './extensions/heading-ids/extension.js';
import { headingIdsManifest } from './extensions/heading-ids/manifest.js';
import { mapsExtension } from './extensions/maps/extension.js';
import { mapsManifest } from './extensions/maps/manifest.js';
import { mathJaxExtension } from './extensions/mathjax/extension.js';
import { mathJaxManifest } from './extensions/mathjax/manifest.js';
import { mathJSLabManifest } from './extensions/mathjslab/manifest.js';
import { mermaidExtension } from './extensions/mermaid/extension.js';
import { mermaidManifest } from './extensions/mermaid/manifest.js';
import { model3DExtension } from './extensions/model-3d/extension.js';
import { model3DManifest } from './extensions/model-3d/manifest.js';
import { molecule3DExtension } from './extensions/molecule-3d/extension.js';
import { molecule3DManifest } from './extensions/molecule-3d/manifest.js';
import { relativeUrlsExtension } from './extensions/relative-urls/extension.js';
import { relativeUrlsManifest } from './extensions/relative-urls/manifest.js';
import { smilesExtension } from './extensions/smiles/extension.js';
import { smilesManifest } from './extensions/smiles/manifest.js';
import { syntaxHighlightExtension } from './extensions/syntax-highlight/extension.js';
import { syntaxHighlightManifest } from './extensions/syntax-highlight/manifest.js';
import { vegaLiteExtension } from './extensions/vega-lite/extension.js';
import { vegaLiteManifest } from './extensions/vega-lite/manifest.js';
import { verovioExtension } from './extensions/verovio/extension.js';
import { verovioManifest } from './extensions/verovio/manifest.js';
import { waveDromExtension } from './extensions/wavedrom/extension.js';
import { waveDromManifest } from './extensions/wavedrom/manifest.js';

export type EducationalMarkdownFeature =
  | 'abc'
  | 'citations'
  | 'cross-references'
  | 'didactic'
  | 'geometry'
  | 'graphviz'
  | 'maps'
  | 'mermaid'
  | 'model-3d'
  | 'molecule-3d'
  | 'netlist'
  | 'smiles'
  | 'tikz'
  | 'vega-lite'
  | 'verovio'
  | 'vcd'
  | 'wavedrom';

export type MarkdownExtensionCatalogEntry = {
  readonly manifest: MarkdownExtensionManifest;
  /** Available when the extension can be created without an injected runtime. */
  readonly create?: () => MarkdownExtension;
  readonly educational?: boolean;
};

/**
 * Single load-free inventory of the built-in extension manifests and factories.
 * Optional renderer libraries remain dynamically imported by their factories.
 */
export const markdownExtensionCatalog: Readonly<Record<string, MarkdownExtensionCatalogEntry>> = Object.freeze({
  citations: { manifest: citationsManifest, create: citationsExtension, educational: true },
  tikz: { manifest: tikzManifest, create: tikzExtension, educational: true },
  geometry: { manifest: geometryManifest, create: geometryExtension, educational: true },
  didactic: { manifest: didacticManifest, create: didacticExtension, educational: true },
  'cross-references': { manifest: crossReferencesManifest, create: crossReferencesExtension, educational: true },
  abc: { manifest: abcManifest, create: abcExtension, educational: true },
  graphviz: {
    manifest: graphvizManifest,
    create: graphvizExtension,
    educational: true,
  },
  'heading-ids': { manifest: headingIdsManifest, create: headingIdsExtension },
  maps: { manifest: mapsManifest, create: mapsExtension, educational: true },
  mathjax: { manifest: mathJaxManifest, create: mathJaxExtension },
  // MathJSLab requires an integrator-provided executor and is created from its adapter.
  mathjslab: { manifest: mathJSLabManifest },
  // HDL execution requires an explicitly authorized application-owned executor.
  hdl: { manifest: hdlManifest },
  'hdl-interactive': { manifest: hdlInteractiveManifest },
  vcd: { manifest: vcdManifest, create: vcdExtension, educational: true },
  mermaid: {
    manifest: mermaidManifest,
    create: mermaidExtension,
    educational: true,
  },
  'model-3d': {
    manifest: model3DManifest,
    create: model3DExtension,
    educational: true,
  },
  'molecule-3d': {
    manifest: molecule3DManifest,
    create: molecule3DExtension,
    educational: true,
  },
  'relative-urls': {
    manifest: relativeUrlsManifest,
    create: relativeUrlsExtension,
  },
  smiles: {
    manifest: smilesManifest,
    create: smilesExtension,
    educational: true,
  },
  'syntax-highlight': {
    manifest: syntaxHighlightManifest,
    create: syntaxHighlightExtension,
  },
  'vega-lite': {
    manifest: vegaLiteManifest,
    create: vegaLiteExtension,
    educational: true,
  },
  verovio: {
    manifest: verovioManifest,
    create: verovioExtension,
    educational: true,
  },
  wavedrom: { manifest: waveDromManifest, create: waveDromExtension, educational: true },
  netlist: { manifest: netlistManifest, create: netlistExtension, educational: true },
} satisfies Record<string, MarkdownExtensionCatalogEntry>);

export const educationalMarkdownFeatures = Object.freeze(
  Object.entries(markdownExtensionCatalog)
    .filter(([, entry]) => entry.educational)
    .map(([name]) => name as EducationalMarkdownFeature),
);

export const createEducationalMarkdownExtension = (feature: EducationalMarkdownFeature): MarkdownExtension => {
  const entry = markdownExtensionCatalog[feature];
  if (!entry) throw new Error(`Unknown educational Markdown feature: ${feature}`);
  if (!entry.create) throw new Error(`Markdown extension cannot be created without an adapter: ${feature}`);
  return entry.create();
};
