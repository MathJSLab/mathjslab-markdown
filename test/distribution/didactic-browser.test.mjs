import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

test('production didactic containers balance equal delimiters, references and real mathematics', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://examples.test/' });
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'location', 'localStorage', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'XMLHttpRequest', 'MathJax']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? dom.window : dom.window[name] });
  }
  Object.defineProperty(dom.window, 'MathJax', {
    configurable: true,
    get: () => globalThis.MathJax,
    set: (value) => {
      globalThis.MathJax = value;
    },
  });
  let engine;
  try {
    const { createEducationalMarkdownEngine } = await import('../../dist/browser/core.js');
    engine = createEducationalMarkdownEngine({ features: ['cross-references', 'didactic'] });
    const container = document.createElement('div');
    document.body.append(container);
    const diagnostics = [];
    await engine.renderDocument(
      '::: exercise Monochord {#exercise}\n\nUse $f_2/f_1=L_1/L_2$.\n\n::: hint Clue\n**Lengths** are inversely proportional.\n:::\n\n::: solution Worked answer {#answer}\n\n$$L_2=80\\frac{220}{330}$$\n\n:::\n\n:::\n\nOutside: {@ref answer}',
      container,
      { locale: 'en', onDiagnostic: (value) => diagnostics.push(value) },
    );
    assert.deepEqual(diagnostics, []);
    const exercise = container.querySelector('.markdown-exercise');
    assert.ok(exercise);
    assert.equal(exercise.querySelectorAll('details').length, 2);
    assert.equal(exercise.querySelector('.markdown-solution > summary').textContent, 'Solution 1: Worked answer');
    assert.equal(exercise.querySelector('details').hasAttribute('open'), false);
    assert.ok(exercise.querySelector('mjx-container svg'));
    assert.ok(exercise.querySelector('.markdown-solution mjx-container svg'));
    assert.equal(exercise.querySelector('.mathjax-error, mjx-merror'), null);
    assert.equal(container.querySelector('a').getAttribute('href'), '#' + exercise.querySelector('.markdown-solution').id);
    assert.equal(exercise.textContent.includes('Outside:'), false);
    await engine.renderDocument('See {@ref sec-energy}.\n\n## Energy\n\n## 1.4. Energy $E$ {#sec-energy}\n\n::: equation {#energy}\n$$E=mc^2$$\n:::\n\n{@ref energy}', container, {
      locale: 'pt-BR',
      onDiagnostic: (value) => diagnostics.push(value),
    });
    assert.deepEqual(diagnostics, []);
    assert.equal(container.querySelector('#sec-energy').textContent.includes('{#'), false);
    assert.equal(container.querySelector('[data-markdown-reference] a').textContent, 'Seção 1.4');
    assert.equal(container.querySelector('[data-markdown-reference] a').getAttribute('href'), '#sec-energy');
    assert.ok(container.querySelector('#sec-energy mjx-container'));
    await engine.typeset(container, { locale: 'es' });
    assert.equal(container.querySelector('[data-markdown-reference] a').textContent, 'Sección 1.4');
    container.innerHTML = engine.parse(':::: exercise Unclosed\nText\n:::');
    assert.equal(container.querySelector('.markdown-exercise'), null);
    assert.ok(container.textContent.includes(':::: exercise Unclosed'));
  } finally {
    await engine?.dispose();
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
