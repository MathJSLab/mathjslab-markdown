export const markdownDiagnosticCodes = Object.freeze({
  resourceUrlBlocked: 'resource-url-blocked',
  resourceSizeLimit: 'resource-size-limit',
  resourceLoadError: 'resource-load-error',
  extensionCapabilityBlocked: 'extension-capability-blocked',
  extensionRenderError: 'extension-render-error',
  extensionDiagnostic: 'extension-diagnostic',
  crossReferenceMissing: 'cross-reference-missing',
  crossReferenceDuplicate: 'cross-reference-duplicate',
  citationMissing: 'citation-missing',
  citationDuplicate: 'citation-duplicate',
  audioPlaybackError: 'audio-playback-error',
  vegaResizeError: 'vega-resize-error',
  geometryResizeError: 'geometry-resize-error',
  mathJSLabExecutionDisabled: 'mathjslab-execution-disabled',
  mathJSLabBlockLimit: 'mathjslab-block-limit',
  mathJSLabSourceLimit: 'mathjslab-source-limit',
  mathJSLabStatementLimit: 'mathjslab-statement-limit',
  mathJSLabExecutionTimeout: 'mathjslab-execution-timeout',
  mathJSLabWorkerRestarted: 'mathjslab-worker-restarted',
  mathJSLabExecutionError: 'mathjslab-execution-error',
  documentLoadError: 'document-load-error',
  documentNavigationError: 'document-navigation-error',
} as const);

export type MarkdownDiagnosticCode = (typeof markdownDiagnosticCodes)[keyof typeof markdownDiagnosticCodes] | (string & {});
export type MarkdownDiagnosticCategory = 'policy' | 'network' | 'extension' | 'execution' | 'document' | 'navigation';
export type MarkdownDiagnostic = {
  extension: string;
  language?: string;
  /** Optional for source compatibility; built-in emitters always provide a stable code. */
  code?: MarkdownDiagnosticCode;
  category?: MarkdownDiagnosticCategory;
  severity?: 'info' | 'warning' | 'error';
  sourceUrl?: URL;
  line?: number;
  column?: number;
  message: string;
  cause?: unknown;
};
export type MarkdownDiagnosticEventDetail = MarkdownDiagnostic & {
  readonly code: MarkdownDiagnosticCode;
  readonly category: MarkdownDiagnosticCategory;
};

const diagnosticCategories: Readonly<Record<string, MarkdownDiagnosticCategory>> = Object.freeze({
  [markdownDiagnosticCodes.resourceUrlBlocked]: 'policy',
  [markdownDiagnosticCodes.resourceSizeLimit]: 'policy',
  [markdownDiagnosticCodes.resourceLoadError]: 'network',
  [markdownDiagnosticCodes.extensionCapabilityBlocked]: 'policy',
  [markdownDiagnosticCodes.extensionRenderError]: 'extension',
  [markdownDiagnosticCodes.extensionDiagnostic]: 'extension',
  [markdownDiagnosticCodes.crossReferenceMissing]: 'extension',
  [markdownDiagnosticCodes.crossReferenceDuplicate]: 'extension',
  [markdownDiagnosticCodes.citationMissing]: 'extension',
  [markdownDiagnosticCodes.citationDuplicate]: 'extension',
  [markdownDiagnosticCodes.audioPlaybackError]: 'extension',
  [markdownDiagnosticCodes.vegaResizeError]: 'extension',
  [markdownDiagnosticCodes.geometryResizeError]: 'extension',
  [markdownDiagnosticCodes.mathJSLabExecutionDisabled]: 'policy',
  [markdownDiagnosticCodes.mathJSLabBlockLimit]: 'policy',
  [markdownDiagnosticCodes.mathJSLabSourceLimit]: 'policy',
  [markdownDiagnosticCodes.mathJSLabStatementLimit]: 'policy',
  [markdownDiagnosticCodes.mathJSLabExecutionTimeout]: 'execution',
  [markdownDiagnosticCodes.mathJSLabWorkerRestarted]: 'execution',
  [markdownDiagnosticCodes.mathJSLabExecutionError]: 'execution',
  [markdownDiagnosticCodes.documentLoadError]: 'document',
  [markdownDiagnosticCodes.documentNavigationError]: 'navigation',
});

export const markdownDiagnosticCategory = (code?: string): MarkdownDiagnosticCategory => (code ? diagnosticCategories[code] : undefined) ?? 'extension';
