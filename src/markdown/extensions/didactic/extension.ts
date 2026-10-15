import type { MarkdownExtension } from '../../../MarkdownEngine.js';
import { blockSyntax, localizeBlocks } from './blocks.js';
import { didacticManifest } from './manifest.js';

export const didacticExtension = (): MarkdownExtension => ({
  name: didacticManifest.name,
  manifest: didacticManifest,
  marked: blockSyntax('didactic-block', ['definition', 'theorem', 'proof', 'example', 'exercise', 'hint', 'solution']),
  prepare(container, context) {
    localizeBlocks(container, context.locale);
  },
});
