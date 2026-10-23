import { createEducationalMarkdownEngine } from '../../dist/browser/core.js';

const xyz = '3\nwater\nO 0 0 0\nH 0.759 0 0.504\nH -0.759 0 0.504';
const pdb =
  'ATOM      1  O   HOH A   1       0.000   0.000   0.000  1.00  0.00           O\nATOM      2  H1  HOH A   1       0.759   0.000   0.504  1.00  0.00           H\nATOM      3  H2  HOH A   1      -0.759   0.000   0.504  1.00  0.00           H\nEND';
const root = document.querySelector('#document');
const engine = createEducationalMarkdownEngine({ features: ['molecule-3d'] });
let session;
let disconnected = 0;
let draws = 0;
const contexts = [];
const drawCanvases = new Set();
const tracked = new WeakSet();
const track = (prototype) => {
  if (!prototype) return;
  const getContext = prototype.getContext;
  prototype.getContext = function (...args) {
    const context = getContext.apply(this, args);
    const canvasType = this.constructor.name;
    contexts.push({ canvas: this.constructor.name, type: args[0], available: Boolean(context) });
    if (context?.drawElements && !tracked.has(context)) {
      tracked.add(context);
      const drawElements = context.drawElements;
      context.drawElements = function (...parameters) {
        draws++;
        drawCanvases.add(canvasType);
        return drawElements.apply(this, parameters);
      };
    }
    return context;
  };
};
track(HTMLCanvasElement.prototype);
if (typeof OffscreenCanvas !== 'undefined') track(OffscreenCanvas.prototype);

window.moleculeProbe = {
  async render(language, locale) {
    const before = typeof OffscreenCanvas;
    const bindingBefore = Reflect.has(globalThis, 'OffscreenCanvas');
    session = await engine.renderDocument('```' + language + ' {width=100% height=300px}\n' + (language === 'pdb' ? pdb : xyz) + '\n```', root, {
      locale,
      theme: 'light',
      observeResize(element, callback) {
        const observer = new ResizeObserver(() => {
          const rect = element.getBoundingClientRect();
          callback(rect.width, rect.height);
        });
        observer.observe(element);
        return () => {
          disconnected++;
          observer.disconnect();
        };
      },
    });
    return {
      before,
      after: typeof OffscreenCanvas,
      bindingBefore,
      bindingAfter: Reflect.has(globalThis, 'OffscreenCanvas'),
      alerts: [...root.querySelectorAll('[role="alert"]')].map((e) => e.textContent),
      draws,
      contexts,
      drawCanvases: [...drawCanvases],
    };
  },
  snapshot() {
    const canvas = root.querySelector('canvas');
    if (!canvas) return null;
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    const context = copy.getContext('2d');
    context.drawImage(canvas, 0, 0);
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
    let colored = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] > 0 && Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 220) colored++;
    return { width: canvas.width, height: canvas.height, colored, draws, label: root.querySelector('[role="application"]')?.getAttribute('aria-label') };
  },
  resize() {
    root.style.width = '420px';
  },
  async dispose() {
    await session.dispose();
    await engine.dispose();
    root.style.width = '580px';
    return { disconnected, canvases: root.querySelectorAll('canvas').length, draws };
  },
  draws: () => draws,
};
