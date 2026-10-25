import type { MarkdownExtension } from '../../../MarkdownEngine.js';
import { blockSyntax, localizeBlocks, type StructuredBlockOptions } from './blocks.js';
import { didacticManifest } from './manifest.js';

export const didacticExtension = (options: StructuredBlockOptions = {}): MarkdownExtension => ({
  name: didacticManifest.name,
  manifest: didacticManifest,
  marked: blockSyntax('didactic-block', ['definition', 'theorem', 'proof', 'example', 'exercise', 'hint', 'solution', 'warning'], options),
  prepare(container, context) {
    localizeBlocks(container, context.locale);
  },
});
