/** Framework-agnostic Markdown engine, document model and navigation API. */
/** Incremented when a stable public contract changes incompatibly. */
export const markdownPublicApiVersion = 2 as const;

export * from './MarkdownEngine.js';
export * from './markdown/MarkdownDocumentController.js';
export * from './markdown/MarkdownDocumentModel.js';
export * from './markdown/MarkdownNavigator.js';
export * from './markdown/createEducationalMarkdownEngine.js';
export { markdownExtensionCatalog } from './markdown/extensionCatalog.js';
export type { MarkdownExtensionCatalogEntry } from './markdown/extensionCatalog.js';
export * from './markdown/createMarkdownEnginePreset.js';
