import type { MarkdownExtension } from '../../../MarkdownEngine.js';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { headingIdsManifest } from './manifest.js';

export const headingIdsExtension = (): MarkdownExtension => ({
  name: headingIdsManifest.name,
  manifest: headingIdsManifest,
  marked: gfmHeadingId(),
});
