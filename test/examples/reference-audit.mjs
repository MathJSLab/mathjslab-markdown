import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';

export const exampleFiles = (root) =>
  fs
    .readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const name = path.join(root, entry.name);
      return entry.isDirectory() ? exampleFiles(name) : entry.name.endsWith('.md') ? [name] : [];
    })
    .sort();

const kinds = 'figure|table|equation|definition|theorem|proof|example|exercise|hint|solution';
const label = /\{#[^}]*\}/g;
const reference = /\{@ref\b[^}]*\}/g;
const marked = new Marked();

export const referenceSyntaxIssues = (source, declarations = []) => {
  const tokens = marked.lexer(source);
  const headings = new Set();
  marked.walkTokens(tokens, (token) => {
    if (token.type === 'heading' && /\{#[A-Za-z][\w:.-]*\}$/.test(token.text)) headings.add(token.tokens?.at(-1));
  });
  const issues = [];
  marked.walkTokens(tokens, (token) => {
    if (token.type !== 'text' || token.tokens) return;
    for (const match of token.raw.matchAll(reference)) {
      if (!/^\{@ref [A-Za-z][\w:.-]*\}$/.test(match[0])) issues.push(`Split or invalid reference: ${JSON.stringify(match[0])}`);
    }
    for (const match of token.raw.matchAll(label)) {
      if (!/^\{#[A-Za-z][\w:.-]*\}$/.test(match[0])) {
        issues.push(`Split or invalid label: ${JSON.stringify(match[0])}`);
        continue;
      }
      const line = token.raw.slice(0, match.index).split('\n').at(-1);
      const kind = /^:{3,}[ \t]+(\w+)(?:[ \t]|$)/.exec(line)?.[1];
      if (!headings.has(token) && !kinds.split('|').includes(kind)) issues.push(`Displaced label: ${match[0]}`);
      else declarations.push(match[0].slice(2, -1));
    }
  });
  return issues;
};

/** Use the production registry without initializing unrelated optional renderers. */
export const auditExampleReferences = (source, engine, references, document, locale = 'en') => {
  const container = document.createElement('div');
  container.innerHTML = engine.parse(source);
  const diagnostics = [];
  const context = { locale, onDiagnostic: (diagnostic) => diagnostics.push(diagnostic) };
  references.prepare?.(container, context);
  references.typeset(container, context);
  const metadata = {
    targets: Array.from(container.querySelectorAll('[data-markdown-label], [data-markdown-heading]'), (element) => ({
      kind: element.dataset.markdownBlock ?? 'heading',
      label: element.dataset.markdownLabel ?? element.dataset.markdownHeading,
      title: element.querySelector('.markdown-block-heading')?.textContent ?? element.textContent,
    })),
    references: Array.from(container.querySelectorAll('[data-markdown-reference]'), (element) => ({
      label: element.dataset.markdownReference,
      text: element.textContent,
      linked: Boolean(element.querySelector('a')),
    })),
  };
  const declarations = [];
  const syntax = referenceSyntaxIssues(source, declarations);
  for (const declared of declarations) if (!metadata.targets.some((target) => target.label === declared)) syntax.push(`Unregistered declaration: ${declared}`);
  return { issues: [...syntax, ...diagnostics.map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)], metadata };
};
