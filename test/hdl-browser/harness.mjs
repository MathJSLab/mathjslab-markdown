import { createBrowserHDLExecutor } from '../../dist/source/markdown-hdl.js';
import { parseVCD, vcdValueAt } from '../../dist/source/markdown/extensions/vcd/parser.js';
import { hdlInteractiveExtension } from '../../dist/source/markdown/extensions/hdl-interactive/extension.js';
import { hdlExtension } from '../../dist/browser/extensions.js';
const NativeWorker = window.Worker;
const workers = new Set();
window.Worker = class extends NativeWorker {
  constructor(...args) {
    super(...args);
    workers.add(this);
  }
  terminate() {
    workers.delete(this);
    return super.terminate();
  }
};
let mounted, controller;
window.hdl = {
  createBrowserHDLExecutor,
  parseVCD,
  vcdValueAt,
  workers: () => workers.size,
  async mount(request, locale, enabled = true) {
    await mounted?.dispose();
    controller?.abort();
    controller = new AbortController();
    mounted = hdlInteractiveExtension(createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) }));
    this.exports = [];
    this.diagnostics = [];
    const { language, ...data } = request;
    await mounted.fences
      .find((fence) => fence.language === language + '-live')
      .render(document.querySelector('#lesson'), JSON.stringify(data), {
        locale,
        securityMode: 'trusted',
        signal: controller.signal,
        executionPolicy: enabled ? { 'hdl-interactive': { enabled: true } } : {},
        onHDLExport: (artifact) => this.exports.push(artifact),
        onDiagnostic: (diagnostic) => this.diagnostics.push(diagnostic),
      });
  },
  async unmount() {
    controller?.abort();
    await mounted?.dispose();
  },
  async mountBatch(request, locale) {
    await mounted?.dispose();
    controller?.abort();
    controller = new AbortController();
    mounted = hdlExtension(createBrowserHDLExecutor({ allowBrowserExecution: true, assetsURL: new URL('/dist/browser/hdl/', location.href) }));
    this.exports = [];
    this.diagnostics = [];
    const { language, ...data } = request;
    await mounted.fences
      .find((fence) => fence.language === language + '-run')
      .render(document.querySelector('#lesson'), JSON.stringify(data), {
        locale,
        securityMode: 'trusted',
        signal: controller.signal,
        executionPolicy: { hdl: { enabled: true } },
        onHDLExport: (artifact) => this.exports.push(artifact),
        onDiagnostic: (diagnostic) => this.diagnostics.push(diagnostic),
      });
  },
};
document.querySelector('#status').textContent = 'Ready';
