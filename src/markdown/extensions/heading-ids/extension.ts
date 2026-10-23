import type { MarkdownExtension } from '../../../MarkdownEngine.js';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { headingIdsManifest } from './manifest.js';

export const headingIdsExtension = (): MarkdownExtension => ({
  name: headingIdsManifest.name,
  manifest: headingIdsManifest,
  marked: (() => {
    const extension = gfmHeadingId();
    const heading = extension.renderer!.heading!;
    return {
      ...extension,
      renderer: {
        ...extension.renderer,
        heading(token) {
          if ((token as typeof token & { markdownHeading?: string }).markdownHeading) return false;
          // Identify generated anchors so explicit reference targets can reserve
          // their IDs without changing the GitHub slugging algorithm.
          const html = heading.call(this, token);
          return html === false ? false : html.replace(/^(<h[1-6]) /, '$1 data-markdown-auto-heading="" ');
        },
      },
    };
  })(),
});
