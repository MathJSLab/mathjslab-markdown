/** Plain-text presentation, not terminal emulation. Raw executor callbacks stay unchanged. */
export const normalizeHDLText = (text: string): string =>
  text
    .replace(/\r\n?/g, '\n')
    .replace(/(?:\x1b\]|\x9d)[\s\S]*?(?:\x07|\x1b\\|\x9c|$)/g, '')
    .replace(/(?:\x1b[P^_X]|[\x90\x98\x9e\x9f])[\s\S]*?(?:\x1b\\|\x9c|$)/g, '')
    .replace(/(?:\x1b\[|\x9b)[0-?]*[ -/]*[@-~]?/g, '')
    .replace(/\x1b(?:[ -/]*[0-~])?/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, '');

export const hdlPresentationLabel = (key: 'running' | 'success' | 'error' | 'cancelled' | 'logs', locale?: string): string => {
  const labels = {
    running: ['Running HDL', 'Executando HDL', 'Ejecutando HDL'],
    success: ['HDL execution completed', 'Execução HDL concluída', 'Ejecución HDL completada'],
    error: ['HDL execution failed', 'Falha na execução HDL', 'Error de ejecución HDL'],
    cancelled: ['HDL execution cancelled', 'Execução HDL cancelada', 'Ejecución HDL cancelada'],
    logs: ['Logs and diagnostics', 'Logs e diagnósticos', 'Registros y diagnósticos'],
  };
  return labels[key][locale?.startsWith('pt') ? 1 : locale?.startsWith('es') ? 2 : 0]!;
};

export const createHDLLogDetails = (locale?: string) => {
  const details = document.createElement('details');
  details.className = 'hdl-log-details';
  details.style.maxWidth = '100%';
  details.style.minWidth = '0';
  const summary = document.createElement('summary');
  summary.textContent = hdlPresentationLabel('logs', locale);
  const logs = document.createElement('pre');
  logs.className = 'hdl-logs';
  Object.assign(logs.style, { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: '18rem', overflow: 'auto' });
  details.append(summary, logs);
  return { details, logs };
};
