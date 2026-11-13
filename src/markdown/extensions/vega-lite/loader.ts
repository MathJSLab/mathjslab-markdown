import type { Loader } from 'vega';
import type { MarkdownDocumentContext, MarkdownResourceService } from '../../../MarkdownEngine.js';
import { markdownDiagnosticCodes } from '../../diagnostics.js';

export const createVegaLoader = (
  context: MarkdownDocumentContext & { resources: MarkdownResourceService },
  language: 'vega' | 'vega-lite',
  onLoadError: (cause: unknown) => void,
): Loader => {
  const load = async (reference: string): Promise<string> => {
    try {
      return await context.resources.readText(reference, context);
    } catch (cause) {
      onLoadError(cause);
      throw cause;
    }
  };
  return {
    load,
    http: load,
    file: load,
    async sanitize(reference, options) {
      context.signal?.throwIfAborted();
      const url = context.resources.resolve(reference, context);
      if (options.context === 'href' && (url.protocol === 'https:' || url.protocol === 'http:')) return { href: url.href };

      // Vega passes image URLs directly to the browser, outside bounded reads.
      const message = 'Vega image resources and non-HTTP links are blocked by the Markdown resource policy';
      context.onDiagnostic?.({
        extension: language,
        language,
        code: markdownDiagnosticCodes.resourceUrlBlocked,
        category: 'policy',
        severity: 'warning',
        message,
      });
      throw new Error(message);
    },
  };
};
