import type { Marked, MarkedExtension, Token, Tokens } from 'marked';

export const blockLabels = {
  en: {
    definition: 'Definition',
    theorem: 'Theorem',
    proof: 'Proof',
    example: 'Example',
    exercise: 'Exercise',
    hint: 'Hint',
    solution: 'Solution',
    warning: 'Warning',
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
    warning: 'Advertência',
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
    warning: 'Advertencia',
    figure: 'Figura',
    table: 'Tabla',
    equation: 'Ecuación',
  },
} as const;
export type BlockKind = keyof typeof blockLabels.en;
/** Shared title behavior for teaching blocks and caption containers. */
export type StructuredBlockOptions = {
  /** Inline Markdown by default; use plain text for legacy literal titles. */
  titleMode?: 'inline' | 'plain';
};

type BlockToken = Tokens.Generic & { kind: BlockKind; title: string; titleTokens: Token[]; label: string; fullWidth: boolean; tokens: Token[] };
const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Balance recognized colon containers, including equally sized delimiters. */
export const blockSyntax = (name: string, kinds: readonly BlockKind[], options: StructuredBlockOptions = {}): MarkedExtension => ({
  walkTokens(this: Marked, token) {
    if (token.type !== name) return;
    const block = token as BlockToken;
    const metadata = /(?:^|\s)\{(?:(?:#([A-Za-z][\w:.-]*))(?:[ \t]+(\.full-width))?|(\.full-width))\}[ \t]*$/.exec(block.title);
    const last = block.titleTokens.at(-1);
    // Metadata must be a literal suffix, outside code, escapes, links and emphasis.
    if (metadata && (!(metadata[2] || metadata[3]) || block.kind === 'table') && last?.type === 'text' && last.raw.endsWith(metadata[0])) {
      last.raw = last.raw.slice(0, -metadata[0].length);
      last.text = last.text.slice(0, -metadata[0].length);
      block.title = block.title.slice(0, metadata.index).trimEnd();
      block.label = metadata[1] ?? '';
      block.fullWidth = Boolean(metadata[2] || metadata[3]);
    }
    // Authored HTML in titles stays literal even in trusted mode. Generated
    // extension markup is rendered later and still follows the engine policy.
    this.walkTokens(block.titleTokens, (child) => {
      if (child.type !== 'html') return;
      Object.assign(child, { type: 'text', text: escape(child.text), escaped: true });
    });
  },
  extensions: [
    {
      name,
      level: 'block',
      start(src) {
        // Marked passes src.slice(1) to start hooks. An initial match could
        // reinterpret an unclosed :::: block as a valid ::: block. Only signal
        // subsequent full lines; tokenizer handles the current line itself.
        const match = /\n:{3,}[ \t]+\w+/.exec(src);
        return match ? match.index + 1 : undefined;
      },
      tokenizer(src) {
        const opening = /^(:{3,})[ \t]+(\w+)(?:[ \t]+([^\n]*))?\n/.exec(src);
        if (!opening || !kinds.includes(opening[2] as BlockKind)) return;
        const delimiter = opening[1]!;
        const rest = src.slice(opening[0].length);
        // Ignore delimiter-looking lines inside fenced code examples.
        let offset = 0;
        let fence: string | undefined;
        const stack = [delimiter];
        let end = 0;
        for (const line of rest.match(/[^\n]*(?:\n|$)/g) ?? []) {
          const code = /^ {0,3}(`{3,}|~{3,})/.exec(line);
          if (fence) {
            if (code && code[1]![0] === fence[0] && code[1]!.length >= fence.length && /^ {0,3}(?:`+|~+)[ \t]*(?:\n|$)$/.test(line)) fence = undefined;
          } else if (code) fence = code[1];
          else {
            // Both extensions share the container grammar. Recognize captions
            // here too so registration order cannot change the outer boundary.
            const nested = /^(:{3,})[ \t]+(\w+)(?:[ \t]+[^\n]*)?\n/.exec(line);
            if (nested && Object.hasOwn(blockLabels.en, nested[2]!)) stack.push(nested[1]!);
            else {
              const closing = /^(:{3,})[ \t]*(?:\n|$)/.exec(line);
              if (closing && closing[1] === stack[stack.length - 1]) {
                stack.pop();
                if (!stack.length) {
                  end = closing[0].length;
                  break;
                }
              }
            }
          }
          offset += line.length;
        }
        if (!end) return;
        const title = (opening[3] ?? '').trim();
        return {
          type: name,
          raw: src.slice(0, opening[0].length + offset + end),
          kind: opening[2],
          title,
          titleTokens: this.lexer.inline(title),
          label: '',
          fullWidth: false,
          tokens: this.lexer.blockTokens(rest.slice(0, offset)),
        };
      },
      renderer(token) {
        const block = token as BlockToken;
        const collapsible = block.kind === 'hint' || block.kind === 'solution';
        const tag = collapsible ? 'details' : 'section';
        const heading = collapsible ? 'summary' : 'p';
        return `<${tag} class="markdown-didactic markdown-${block.kind}${block.fullWidth ? ' markdown-table-full-width' : ''}" data-markdown-block="${block.kind}"${block.label ? ` data-markdown-label="${escape(block.label)}"` : ''}><${heading} class="markdown-block-heading"><span data-markdown-block-label>${blockLabels.en[block.kind]}</span>${block.title ? `: ${options.titleMode === 'plain' ? escape(block.title) : this.parser.parseInline(block.titleTokens)}` : ''}</${heading}>${this.parser.parse(block.tokens)}</${tag}>\n`;
      },
      childTokens: ['titleTokens', 'tokens'],
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
