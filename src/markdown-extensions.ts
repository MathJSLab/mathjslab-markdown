/** Built-in Markdown extension factories and their load-free manifests. */
export { tikzExtension } from './markdown/extensions/tikz/extension.js';
export { tikzManifest } from './markdown/extensions/tikz/manifest.js';
export type { TikZOptions, TikZWorker } from './markdown/extensions/tikz/runtime.js';
export { geometryExtension } from './markdown/extensions/geometry/extension.js';
export { geometryManifest } from './markdown/extensions/geometry/manifest.js';
export type { GeometrySpec, GeometryElementSpec, GeometryElementType, GeometryAttributes } from './markdown/extensions/geometry/spec.js';
export { didacticExtension } from './markdown/extensions/didactic/extension.js';
export type { StructuredBlockOptions } from './markdown/extensions/didactic/blocks.js';
export { didacticManifest } from './markdown/extensions/didactic/manifest.js';
export { crossReferencesExtension } from './markdown/extensions/cross-references/extension.js';
export { crossReferencesManifest } from './markdown/extensions/cross-references/manifest.js';
export { abcExtension } from './markdown/extensions/abc/extension.js';
export { abcManifest } from './markdown/extensions/abc/manifest.js';
export { graphvizExtension } from './markdown/extensions/graphviz/extension.js';
export { graphvizManifest } from './markdown/extensions/graphviz/manifest.js';
export { headingIdsExtension } from './markdown/extensions/heading-ids/extension.js';
export { headingIdsManifest } from './markdown/extensions/heading-ids/manifest.js';
export { mapsExtension } from './markdown/extensions/maps/extension.js';
export { markdownMapProviders } from './markdown/extensions/maps/extension.js';
export type { MarkdownMapOptions, MarkdownMapProvider } from './markdown/extensions/maps/extension.js';
export { mapsManifest } from './markdown/extensions/maps/manifest.js';
export { mathJaxExtension } from './markdown/extensions/mathjax/extension.js';
export { mathJaxManifest } from './markdown/extensions/mathjax/manifest.js';
export { mermaidExtension } from './markdown/extensions/mermaid/extension.js';
export { mermaidManifest } from './markdown/extensions/mermaid/manifest.js';
export { model3DExtension } from './markdown/extensions/model-3d/extension.js';
export { model3DManifest } from './markdown/extensions/model-3d/manifest.js';
export { molecule3DExtension } from './markdown/extensions/molecule-3d/extension.js';
export { molecule3DManifest } from './markdown/extensions/molecule-3d/manifest.js';
export { relativeUrlsExtension } from './markdown/extensions/relative-urls/extension.js';
export { relativeUrlsManifest } from './markdown/extensions/relative-urls/manifest.js';
export { smilesExtension } from './markdown/extensions/smiles/extension.js';
export { smilesManifest } from './markdown/extensions/smiles/manifest.js';
export { syntaxHighlightExtension } from './markdown/extensions/syntax-highlight/extension.js';
export { syntaxHighlightManifest } from './markdown/extensions/syntax-highlight/manifest.js';
export { vegaLiteExtension } from './markdown/extensions/vega-lite/extension.js';
export { vegaLiteManifest } from './markdown/extensions/vega-lite/manifest.js';
export { verovioExtension } from './markdown/extensions/verovio/extension.js';
export { verovioManifest } from './markdown/extensions/verovio/manifest.js';
export { waveDromExtension } from './markdown/extensions/wavedrom/extension.js';
export { waveDromManifest } from './markdown/extensions/wavedrom/manifest.js';
export { netlistExtension } from './markdown/extensions/netlist/extension.js';
export { netlistManifest } from './markdown/extensions/netlist/manifest.js';
export { hdlExtension } from './markdown/extensions/hdl/extension.js';
export { hdlManifest } from './markdown/extensions/hdl/manifest.js';
export { hdlInteractiveExtension } from './markdown/extensions/hdl-interactive/extension.js';
export { hdlInteractiveManifest } from './markdown/extensions/hdl-interactive/manifest.js';
export type {
  HDLStimulus,
  HDLCheck,
  HDLInteractiveSignal,
  HDLInteractiveInput,
  HDLInteractiveRequest,
  HDLInteractiveStep,
  HDLInteractiveResult,
  HDLInteractiveSession,
} from './markdown/extensions/hdl-interactive/executor.js';
export { vcdExtension } from './markdown/extensions/vcd/extension.js';
export { vcdManifest } from './markdown/extensions/vcd/manifest.js';
export { parseVCD, vcdValueAt } from './markdown/extensions/vcd/parser.js';
export type { VCDChange, VCDSignal, VCDDocument } from './markdown/extensions/vcd/parser.js';
export type { HDLExecutor, HDLExecutionSession, HDLExecutionRequest, HDLExecutionResult, HDLCompilerDiagnostic, HDLSourceFile, HDLLanguage } from './markdown/extensions/hdl/executor.js';
export type { MarkdownNetlistInput, YosysNetlist, NetlistModule, NetlistCell, NetlistPort, NetlistBit } from './markdown/extensions/netlist/spec.js';
export { citationsExtension, type CitationsOptions } from './markdown/extensions/citations/extension.js';
export { citationsManifest } from './markdown/extensions/citations/manifest.js';

export type { HDLExecutionUpdate } from './markdown/hdl/updates.js';

export { exportVCDCSV } from './markdown/extensions/vcd/export.js';
export type { VCDCSVOptions } from './markdown/extensions/vcd/export.js';
export type { HDLArtifact } from './markdown/hdl/artifacts.js';

export type { HDLCheckResult } from './markdown/extensions/hdl-interactive/executor.js';
