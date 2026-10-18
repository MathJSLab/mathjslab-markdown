import { hdlExtension, hdlInteractiveExtension, hdlManifest, hdlInteractiveManifest } from 'mathjslab-markdown/extensions';
import { createHTTPHDLExecutor } from 'mathjslab-markdown/hdl';
import type { MarkdownExtension, MarkdownExecutionPolicies } from 'mathjslab-markdown';

/** Drop-in app integration, compatible with published 0.6.0 and later fixes. */
export const markdownHDLConfiguration = (): { extensions: MarkdownExtension[]; executionPolicy: MarkdownExecutionPolicies } => {
  const blocked = (message: string) => ({
    executionPolicy: {},
    extensions: [hdlManifest, hdlInteractiveManifest].map((manifest): MarkdownExtension => ({
      name: manifest.name,
      manifest,
      fences: manifest.fences.map((fence) => ({
        ...fence,
        render: async (container, source, context) => {
          const alert = container.ownerDocument.createElement('p');
          alert.setAttribute('role', 'alert');
          alert.textContent = message;
          const code = container.ownerDocument.createElement('pre');
          code.textContent = source;
          container.replaceChildren(alert, code);
          context.onDiagnostic?.({ extension: manifest.name, code: 'hdl-executor-missing', category: 'policy', severity: 'error', message });
        },
        dispose: (container) => {
          container.replaceChildren();
        },
      })),
    })),
  });
  if (typeof window === 'undefined') return blocked('HDL execution requires an application-configured backend.');
  if (process.env.NODE_ENV !== 'development')
    return blocked(
      'HDL execution is unavailable in this deployment. VHDL/Verilog code and local VCD/netlist/WaveDrom diagrams still work. Production simulation requires an explicitly authorized, isolated application service; a local development server is not a public backend.',
    );
  try {
    const text = window.sessionStorage.getItem('mathjslab.hdl.backend');
    if (!text)
      return blocked(
        'HDL backend is not configured. Start the trusted local HDL service, set sessionStorage["mathjslab.hdl.backend"] with enabled/endpoint/token, then reload the application.',
      );
    const configuration = JSON.parse(text);
    if (configuration.enabled !== true) return blocked('HDL execution is disabled in the application settings. Enable it explicitly after configuring a trusted service.');
    const endpoint = new URL(configuration.endpoint);
    if (!['http:', 'https:'].includes(endpoint.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))
      throw new Error('Development HDL requires an HTTP(S) loopback endpoint');
    if (typeof configuration.token !== 'string' || configuration.token.length < 32) throw new Error('The HDL service token must contain at least 32 characters');
    const executor = createHTTPHDLExecutor({ endpoint, token: configuration.token });
    return { extensions: [hdlExtension(executor), hdlInteractiveExtension(executor)], executionPolicy: { hdl: { enabled: true }, 'hdl-interactive': { enabled: true } } };
  } catch (error) {
    return blocked('HDL configuration rejected: ' + (error instanceof Error ? error.message : String(error)) + '. Correct the application settings and reload.');
  }
};
