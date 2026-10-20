import type { MarkdownDocumentContext } from '../../MarkdownEngine.js';
import type { HDLExecutor, HDLLanguage } from '../extensions/hdl/executor.js';

export const hdlSetupMessage = (context: MarkdownDocumentContext, missing: boolean): string => {
  const language = context.locale?.slice(0, 2);
  if (missing)
    return language === 'pt'
      ? 'Executor HDL ausente. O aplicativo deve configurar um backend e registrar hdlExtension(executor) e hdlInteractiveExtension(executor). Este bloco não é uma simulação executada. Consulte doc/extensions/hdl-troubleshooting.md.'
      : language === 'es'
        ? 'Falta el ejecutor HDL. La aplicación debe configurar un backend y registrar hdlExtension(executor) y hdlInteractiveExtension(executor). Este bloque no es una simulación ejecutada. Consulte doc/extensions/hdl-troubleshooting.md.'
        : 'HDL executor missing. The application must configure a backend and register hdlExtension(executor) and hdlInteractiveExtension(executor). This block is not an executed simulation. See doc/extensions/hdl-troubleshooting.md.';
  return 'HDL execution requires explicit host authorization: enable the matching hdl or hdl-interactive execution policy; restricted modes also require allowInRestrictedMode. Markdown cannot grant these permissions.';
};

/** Optional discovery is checked within the same bounded/cancellable session acquisition. */
export const assertHDLAvailable = async (
  executor: Pick<HDLExecutor, 'capabilities'>,
  language: HDLLanguage,
  operation: 'simulate' | 'synthesize' | 'interactive',
  context: MarkdownDocumentContext,
): Promise<void> => {
  if (!executor.capabilities) return;
  const capabilities = await executor.capabilities(context);
  const profile = capabilities?.languages?.[language];
  if (!profile || typeof profile.simulate !== 'boolean' || typeof profile.synthesize !== 'boolean' || ![false, 'replay'].includes(profile.interactive))
    throw new Error('Invalid HDL capabilities response. Verify the configured service endpoint and protocol.');
  if (operation === 'interactive' ? profile.interactive !== false : profile[operation]) return;
  const tools = operation === 'synthesize' ? (language === 'vhdl' ? ['ghdl', 'yosys'] : ['yosys']) : language === 'vhdl' ? ['ghdl'] : ['iverilog', 'vvp'];
  const unavailable = tools.filter((name) => capabilities.tools?.[name]?.available !== true);
  const browserError = capabilities.tools?.['browser-runtime']?.error;
  if (browserError) throw new Error(`HDL browser executor does not support ${language} ${operation}: ${browserError}`);
  throw new Error(
    `HDL backend does not support ${language} ${operation}. Install/configure ${tools.join(', ')} on the service host and check GET /capabilities${unavailable.length ? '; unavailable: ' + unavailable.join(', ') : ''}. Native tools are not bundled with the browser or npm package.`,
  );
};
