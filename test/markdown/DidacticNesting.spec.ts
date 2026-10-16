import { TextEncoder, TextDecoder } from 'node:util';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';

Object.assign(globalThis, { TextEncoder, TextDecoder });

const exercise = `::: exercise Experiência com o monocórdio {#exercicio-monocordio}

Enunciado do exercício: $f_2/f_1=L_1/L_2$.

::: hint Uma pista {#pista}

Use **comprimentos** inversamente proporcionais.

:::

::: solution Resolução {#resolucao}

$$L_2=80\\frac{220}{330}$$

:::
`;

describe('balanced didactic containers', () => {
  test.each(['exercise', 'hint', 'solution'])('renders isolated %s with title, label and mathematical Markdown', async (kind) => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'] });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(`::: ${kind} Título {#isolado}\n\n**Texto** e $a^2$.\n\n:::\n\n{@ref isolado}`, container, { locale: 'pt-BR' });
      const block = container.querySelector(`[data-markdown-block="${kind}"]`)!;
      expect(block).not.toBeNull();
      expect(block.getAttribute('data-markdown-label')).toBe('isolado');
      expect(block.querySelector('.markdown-block-heading')?.textContent).toContain('Título');
      expect(block.querySelector('strong')?.textContent).toBe('Texto');
      expect(block.querySelector('mjx-container svg')).not.toBeNull();
      expect(block.querySelector('.mathjax-error, mjx-merror')).toBeNull();
      expect(container.querySelector('a')?.getAttribute('href')).toBe(`#${block.id}`);
      if (kind !== 'exercise') {
        expect(block.tagName).toBe('DETAILS');
        expect(block.hasAttribute('open')).toBe(false);
      }
    } finally {
      await engine.dispose();
    }
  });

  test.each([
    ['didactic', 'cross-references'],
    ['cross-references', 'didactic'],
  ] as const)('nests equal delimiters with registration order %j', async (...features) => {
    const engine = createEducationalMarkdownEngine({ features });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(exercise + '\n:::\n\nAfter. {@ref resolucao}', container, { locale: 'pt' });
      const outer = container.querySelector('[data-markdown-block="exercise"]')!;
      expect(outer?.getAttribute('data-markdown-label')).toBe('exercicio-monocordio');
      expect(outer.querySelector('.markdown-block-heading')?.textContent).toBe('Exercício 1: Experiência com o monocórdio');
      expect(outer.querySelectorAll('details')).toHaveLength(2);
      expect(outer.querySelector('[data-markdown-block="hint"] > summary')?.textContent).toBe('Dica 1: Uma pista');
      expect(outer.querySelector('[data-markdown-block="solution"] > summary')?.textContent).toBe('Solução 1: Resolução');
      expect(outer.querySelector('mjx-container svg')).not.toBeNull();
      expect(outer.querySelector('.markdown-solution mjx-container svg')).not.toBeNull();
      expect(outer.querySelector('.mathjax-error, mjx-merror')).toBeNull();
      expect(container.querySelector('a')?.textContent).toBe('Solução 1');
      expect(container.querySelector(':scope > p:last-of-type')?.textContent).toContain('After.');
      expect(outer.textContent).not.toContain('After.');
    } finally {
      await engine.dispose();
    }
  });

  test('requires the final exercise closer in the reported incomplete example', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic'] });
    try {
      const container = document.createElement('div');
      container.innerHTML = engine.parse(exercise);
      expect(container.querySelector('[data-markdown-block="exercise"]')).toBeNull();
      expect(container.textContent).toContain('::: exercise Experiência com o monocórdio');
    } finally {
      await engine.dispose();
    }
  });

  test.each([':::', '::::'])('nests caption containers and deeper didactic blocks with %s', async (outer) => {
    const engine = createEducationalMarkdownEngine({ features: ['cross-references', 'didactic'] });
    const container = document.createElement('div');
    try {
      await engine.renderDocument(`${outer} exercise Outer\n\n::: figure Caption {#caption}\n\n::: hint\nNested\n:::\n\n:::\n\n${outer}\n\n{@ref caption}`, container);
      expect(container.querySelector('.markdown-exercise > .markdown-figure > details')?.textContent).toContain('Nested');
      expect(container.querySelectorAll('[data-markdown-block]')).toHaveLength(3);
      expect(container.querySelector('a')?.textContent).toBe('Figure 1');
    } finally {
      await engine.dispose();
    }
  });

  test.each(['```', '~~~~'])('ignores openings and closers inside %s code fences', async (fence) => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic'] });
    try {
      const container = document.createElement('div');
      container.innerHTML = engine.parse(`::: exercise Code\n\n${fence}text\n::: hint Fake\n:::\n${fence}\n\n::: solution Real\nAnswer\n:::\n\n:::\n\nOutside`);
      expect(container.querySelectorAll('[data-markdown-block]')).toHaveLength(2);
      expect(container.querySelector('code')?.textContent).toContain('::: hint Fake\n:::');
      expect(container.querySelector('.markdown-exercise')?.textContent).not.toContain('Outside');
    } finally {
      await engine.dispose();
    }
  });

  test('leaves directives literal without didactic or inside Markdown code fences', async () => {
    const disabled = createEducationalMarkdownEngine();
    const enabled = createEducationalMarkdownEngine({ features: ['didactic'] });
    try {
      const container = document.createElement('div');
      container.innerHTML = disabled.parse(exercise + '\n:::');
      expect(container.querySelector('[data-markdown-block]')).toBeNull();
      container.innerHTML = enabled.parse('```makefile\n' + exercise + '\n:::\n```');
      expect(container.querySelector('[data-markdown-block]')).toBeNull();
      expect(container.querySelector('code')?.textContent).toContain('::: exercise');
    } finally {
      await disabled.dispose();
      await enabled.dispose();
    }
  });

  test('requires matching closers and preserves unknown directives', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic'] });
    try {
      const container = document.createElement('div');
      container.innerHTML = engine.parse(':::: exercise Wrong closer\nText\n:::\n\n::: unknown Custom\nText\n:::');
      expect(container.querySelector('[data-markdown-block]')).toBeNull();
      expect(container.textContent).toContain(':::: exercise Wrong closer');
      expect(container.textContent).toContain('::: unknown Custom');
    } finally {
      await engine.dispose();
    }
  });

  test.each(['core', 'gfm'] as const)('recognizes nested blocks in the %s profile after ordinary prose', async (profile) => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic'], profile });
    try {
      const container = document.createElement('div');
      container.innerHTML = engine.parse('Introduction.\n\n' + exercise + '\n:::');
      expect(container.querySelectorAll('[data-markdown-block]')).toHaveLength(3);
      expect(container.querySelector('.markdown-exercise > details.markdown-solution')).not.toBeNull();
    } finally {
      await engine.dispose();
    }
  });

  test('updates nested containers without retaining titles, labels or numbering', async () => {
    const engine = createEducationalMarkdownEngine({ features: ['didactic', 'cross-references'] });
    const container = document.createElement('div');
    try {
      const session = await engine.renderDocument(exercise + '\n:::', container);
      await session.update('::: exercise New\n::: solution\nNew answer\n:::\n:::', { locale: 'es' });
      expect(container.querySelectorAll('[data-markdown-block]')).toHaveLength(2);
      expect(container.querySelector('[data-markdown-label]')).toBeNull();
      expect(container.querySelector('summary')?.textContent).toBe('Solución 1');
      expect(container.textContent).not.toContain('monocórdio');
    } finally {
      await engine.dispose();
    }
  });
});
