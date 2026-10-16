type SmilesInlineToken = { type: 'markdown-smiles-inline'; raw: string; text: string; info: string };
const escape = (source: string): string => source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A text directive, separate from code spans and from the chemical grammar. */
export const smilesInline = {
  name: 'markdown-smiles-inline',
  level: 'inline' as const,
  start(source: string): number | undefined {
    const index = source.indexOf(':smiles[');
    return index < 0 ? undefined : index;
  },
  tokenizer(source: string): SmilesInlineToken | undefined {
    if (!source.startsWith(':smiles[')) return;
    let depth = 1;
    let end = 8;
    for (; end < source.length; end++) {
      const char = source[end];
      if (char === '\n' || char === '\r') return;
      if (char === '[') depth++;
      else if (char === ']' && --depth === 0) break;
    }
    if (depth || end === 8) return;
    const attributes = /^\{([^{}\r\n]*)\}/.exec(source.slice(end + 1));
    let info = attributes?.[1] ?? '';
    if (!/(?:^|\s)display\s*=/.test(info)) info = `display=inline ${info}`;
    return { type: 'markdown-smiles-inline', raw: source.slice(0, end + 1 + (attributes?.[0].length ?? 0)), text: source.slice(8, end), info: `{${info.trim()}}` };
  },
  renderer(token: SmilesInlineToken): string {
    return `<span class="smiles" data-markdown-inline="" data-markdown-extension="smiles" data-markdown-language="smiles" data-markdown-size-info="${escape(token.info)}"><span class="markdown-extension-source" hidden>${escape(token.text)}</span></span>`;
  },
};
