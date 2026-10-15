import type { MarkedExtension, Token, Tokens } from 'marked';

export const blockLabels = {
  en: {
    definition: 'Definition',
    theorem: 'Theorem',
    proof: 'Proof',
    example: 'Example',
    exercise: 'Exercise',
    hint: 'Hint',
    solution: 'Solution',
    figure: 'Figure',
    table: 'Table',
    equation: 'Equation',
  },
  pt: {
    definition: 'Definição',
    theorem: 'Teorema',
    proof: 'Demonstração',
    example: 'Exemplo',
    exercise: 'Exercício',
    hint: 'Dica',
    solution: 'Solução',
    figure: 'Figura',
    table: 'Tabela',
    equation: 'Equação',
  },
  es: {
    definition: 'Definición',
    theorem: 'Teorema',
    proof: 'Demostración',
    example: 'Ejemplo',
    exercise: 'Ejercicio',
    hint: 'Pista',
    solution: 'Solución',
    figure: 'Figura',
    table: 'Tabla',
    equation: 'Ecuación',
  },
} as const;
export type BlockKind = keyof typeof blockLabels.en;
type BlockToken = Tokens.Generic & { kind: BlockKind; title: string; label: string; tokens: Token[] };
const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Colon containers nest by using a longer delimiter for the outer block. */
export const blockSyntax = (name: string, kinds: readonly BlockKind[]): MarkedExtension => ({
  extensions: [
    {
      name,
      level: 'block',
      start(src) {
        return src.match(/^:{3,}\s+\w+/m)?.index;
      },
      tokenizer(src) {
        const opening = /^(:{3,})[ \t]+(\w+)(?:[ \t]+([^\n]*))?\n/.exec(src);
        if (!opening || !kinds.includes(opening[2] as BlockKind)) return;
        const delimiter = opening[1]!;
        const closing = new RegExp(`^${delimiter}[ \\t]*(?:\\n|$)`, 'm');
        const rest = src.slice(opening[0].length);
        // Ignore delimiter-looking lines inside fenced code examples.
        let offset = 0;
        let fence: string | undefined;
        let end: RegExpExecArray | null = null;
        for (const line of rest.match(/[^\n]*(?:\n|$)/g) ?? []) {
          const code = /^ {0,3}(`{3,}|~{3,})/.exec(line);
          if (fence) {
            if (code && code[1]![0] === fence[0] && code[1]!.length >= fence.length && /^ {0,3}(?:`+|~+)[ \t]*(?:\n|$)$/.test(line)) fence = undefined;
          } else if (code) fence = code[1];
          else if (closing.test(line)) {
            end = closing.exec(rest.slice(offset));
            break;
          }
          offset += line.length;
        }
        if (!end) return;
        const metadata = opening[3] ?? '';
        const label = /(?:^|\s)\{#([A-Za-z][\w:.-]*)\}[ \t]*$/.exec(metadata);
        const title = (label ? metadata.slice(0, label.index) : metadata).trim();
        return {
          type: name,
          raw: src.slice(0, opening[0].length + offset + end[0].length),
          kind: opening[2],
          title,
          label: label?.[1] ?? '',
          tokens: this.lexer.blockTokens(rest.slice(0, offset)),
        };
      },
      renderer(token) {
        const block = token as BlockToken;
        const collapsible = block.kind === 'hint' || block.kind === 'solution';
        const tag = collapsible ? 'details' : 'section';
        const heading = collapsible ? 'summary' : 'p';
        return `<${tag} class="markdown-didactic markdown-${block.kind}" data-markdown-block="${block.kind}"${block.label ? ` data-markdown-label="${escape(block.label)}"` : ''}><${heading} class="markdown-block-heading"><span data-markdown-block-label>${blockLabels.en[block.kind]}</span>${block.title ? `: ${escape(block.title)}` : ''}</${heading}>${this.parser.parse(block.tokens)}</${tag}>\n`;
      },
      childTokens: ['tokens'],
    },
  ],
});

export const localizeBlocks = (container: ParentNode, locale?: string): void => {
  const labels = blockLabels[(locale?.split(/[-_]/)[0] ?? 'en') as keyof typeof blockLabels] ?? blockLabels.en;
  container.querySelectorAll<HTMLElement>('[data-markdown-block]').forEach((block) => {
    const kind = block.dataset.markdownBlock as BlockKind;
    const label = block.querySelector('[data-markdown-block-label]');
    if (label && labels[kind]) label.textContent = labels[kind];
  });
};
