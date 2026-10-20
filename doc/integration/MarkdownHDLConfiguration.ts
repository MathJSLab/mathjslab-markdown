import { hdlExtension, hdlInteractiveExtension } from 'mathjslab-markdown/extensions';
import { createBrowserHDLExecutor } from 'mathjslab-markdown/hdl';
import type { MarkdownExtension, MarkdownExecutionPolicies } from 'mathjslab-markdown';

/** Candidate for trusted app code, identical in development and static production.
 * Copy the COMPLETE dist/browser/hdl/ directory, including nvc/, before building.
 * VHDL-2008 simulation/replay uses NVC; synthesis uses GHDL and YoWASP.
 * Preserve the app's scheduling/restricted-mode policies where applicable.
 * Package browser checks do not replace validation in the integrated app.
 */
export const markdownHDLConfiguration = (
  assetsURL: string | URL = new URL('hdl/', typeof document === 'undefined' ? 'http://localhost/' : document.baseURI),
): { extensions: MarkdownExtension[]; executionPolicy: MarkdownExecutionPolicies } => {
  const executor = createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL, timeoutMs: 30_000, maxSessions: 4 });
  return {
    extensions: [hdlExtension(executor), hdlInteractiveExtension(executor)],
    executionPolicy: { hdl: { enabled: true }, 'hdl-interactive': { enabled: true } },
  };
};
