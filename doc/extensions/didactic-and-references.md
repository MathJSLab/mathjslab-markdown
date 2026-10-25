# Teaching blocks, captions and references

Enable `didactic` and `cross-references` through
`createEducationalMarkdownEngine`:

```ts
const engine = createEducationalMarkdownEngine({
    features: ["didactic", "cross-references"],
    securityMode: "sanitized",
});
await engine.renderDocument(source, container, { locale: "en-US" });
```

Factories and manifests are also exported from `mathjslab-markdown/extensions`.
Both extensions have no additional dependencies or capability requirements.
They are included in the `all` feature selection; explicit feature selections
remain unchanged. The core engine does not enable them automatically.

## Teaching blocks

The `didactic` extension recognizes `definition`, `theorem`, `proof`,
`example`, `exercise`, `hint`, `solution` and `warning`. A title and a trailing
`{#label}` are optional. Use lowercase English kind names, a space after at
least three colons, and an opening line followed by a newline. Put the
identifier after the title on the same line. Titles support inline Markdown,
including emphasis, code spans, links, enabled mathematics and
cross-references; bodies support block Markdown and other enabled extensions.
`exercise` renders a semantic `<section>`; `hint` and `solution` render
collapsible `<details>` with a `<summary>`.

`warning` renders a static
`<section class="markdown-didactic markdown-warning">` with a heading and a
Markdown body, using the existing teaching-block styles. It does not announce a
live alert. With `cross-references`, warnings have their own counter and
document-scoped targets, just like other teaching blocks. Labels are `Warning`,
`Advertência` and `Advertencia` for English, Portuguese and Spanish; other
locales fall back to English. The directive remains `warning` in every
language.

```markdown
See {@ref assumptions}.

::: warning Check assumptions {#assumptions}

Use **verified** assumptions before simplifying a model.

:::
```

Without `cross-references`, the identifier remains metadata and the heading is
unnumbered. Without `didactic`, the directive remains ordinary Markdown.
Compatibility: enabling `didactic` now interprets valid `::: warning`
containers that previously appeared literally. Put literal syntax examples in
code fences.

```markdown
:::: theorem Pythagorean theorem {#pythagoras}

In a right triangle, $a^2 + b^2 = c^2$.

::: proof Proof

The proof may include **text**, lists and equations.

:::

::::

::: exercise Application {#exercise}

Find the hypotenuse for legs of length 3 and 4 units.

:::

::: solution

The hypotenuse is 5 units long.

:::
```

Hints and solutions are initially closed, with keyboard support supplied by the
browser. Containers nest by balancing openings and closings. Equal colon counts
are supported; using more colons for outer blocks remains supported and can
make the structure easier to read. Every block needs its own closing line, with
exactly the same number of colons as its opening. A closer belongs to the
innermost open block with that delimiter; it does not close a parent while a
child remains open.

The following exercise contains a hint and a solution. The final `:::` closes
the exercise, separately from the two closers for its children:

```markdown
::: exercise Monochord experiment {#monochord-exercise}

A string of length $80\,\mathrm{cm}$ produces $220\,\mathrm{Hz}$. What length
produces $330\,\mathrm{Hz}$ at the same tension?

::: hint A clue {#monochord-hint}

Use $f_2/f_1=L_1/L_2$.

:::

::: solution Worked answer {#monochord-solution}

$$L_2=80\frac{220}{330}=\frac{160}{3}\,\mathrm{cm}.$$

:::

:::
```

Delimiters inside code fences are literal, including fences whose language is
`makefile` or `markdown`. To render a didactic component, place its directive
directly in the document, outside a backtick or tilde code fence. Unknown kinds
and unclosed containers remain ordinary Markdown; the parser does not invent
missing closers. If the final exercise closer above is omitted, its opening
line remains visible rather than becoming an exercise component.

## Recognition and troubleshooting

Formatting tools can treat a colon opening line as ordinary prose and wrap a
long title or its `{#label}` onto the next line. Keep each opening on one line.
When using Prettier with `proseWrap: "always"`, put `<!-- prettier-ignore -->`
immediately before the opening paragraph to preserve it:

```markdown
<!-- prettier-ignore -->
::: exercise A long title that must remain together with its identifier {#exercise}

Exercise content.

:::
```

The comment is an authoring instruction for the formatter and does not change
the didactic syntax. Apply it to nested openings and caption containers too
when their titles might be wrapped. A label on the following line is body text,
not the identifier of the container.

This also applies when only `{#label}` is pushed onto the next line: it does
not attach retroactively to the opening. Protect the complete opening,
including the identifier, rather than the label alone. For example:

```markdown
<!-- prettier-ignore -->
::: figure Etapas conceituais de aquisição e representação digital de uma grandeza analógica {#fig-digitization-flow}

Figure content.

:::
```

Prettier may also split an inline `{@ref label}` token across lines. Keep that
token intact and use the same ignore comment before its containing paragraph
when automatic wrapping would split it. A line break inside the reference is
not accepted reference syntax.

The repository audits every Markdown file under `example/` with the real
registry before and after Prettier formatting. Run the catalogue regression
with
`npm run test:unit -- --runTestsByPath test/markdown/ExampleReferences.spec.ts`.
The browser check `npm run test:browser:example-references` loads the complete
digital-electronics introduction and the pt/en/es teaching lessons by URL into
the distributed `markdown-document` component. It checks numbered captions,
resolved links, settled navigation, document isolation and literal code. The
npm package includes the examples and local resources; package verification
rejects any omitted catalogue file.

- Enable `didactic` explicitly or select `features: "all"`. Creating the core
  `MarkdownEngine` or omitting `features` does not enable teaching blocks.
- `cross-references` is optional for teaching blocks. It adds document-scoped
  IDs, numbering and reference links to their `{#label}` metadata. Without it,
  labels remain metadata rather than generated HTML target IDs.
- Both registration orders of `didactic` and `cross-references` are supported,
  including nesting teaching blocks inside captions and vice versa. Both the
  `core` and `gfm` profiles recognize colon containers.
- Check all closing lines, their colon counts, and any surrounding code fence
  when a directive appears literally. A child closer never replaces the
  required parent closer. Titles may be localized text, but directive names
  remain English (`exercise`, `hint`, `solution`).
- Recognition happens in the Marked block tokenizer. `renderDocument` then
  localizes headings, resolves enabled references and typesets mathematical
  content. Literal opening lines indicate a disabled extension, a code example
  or unmatched syntax rather than a CSS or component styling issue.

## Captions and references

The `cross-references` extension adds `figure`, `table` and `equation`
containers. Wrap existing images, Markdown tables, mathematical expressions or
renderer fences to give them captions. Captions appear above the content.

```markdown
See {@ref pythagoras} and {@ref results} in a document containing both targets.

::: table Results {#results}

| Leg a | Leg b | Hypotenuse |
| ----- | ----- | ---------- |
| 3     | 4     | 5          |

:::

::: equation Fundamental identity {#identity}

$$a^2 + b^2 = c^2$$

:::
```

When enabled, references number all recognized containers independently by
category, in document order, including those without labels. Labels start with
an ASCII letter and then contain letters, digits, `_`, `:`, `.`, or `-`. Use
`{@ref label}` anywhere inline, including before the target. Code spans and
code fences remain literal. References resolve only within the current
document. English, Portuguese and Spanish labels follow the document locale;
other locales use English. Without `cross-references`, teaching block headings
are unnumbered.

Missing references remain visible as source text and emit
`cross-reference-missing` warnings. Duplicate labels emit
`cross-reference-duplicate` warnings and references to them remain unresolved.
Diagnostics use the existing document `onDiagnostic` callback.

Generated block target IDs are scoped to the container; documents sharing an
engine can reuse labels. Update and repeated typesetting recompute numbering
and links. Generated IDs are implementation details: author links with
`{@ref label}` rather than hard-coding generated fragment IDs. Parsing alone
creates placeholders; `renderDocument` or `typeset` applies localization and
resolves references.

## Headings and section references

With `cross-references` enabled, put a trailing `{#label}` after any Markdown
heading (`#` through `######`, or Setext headings). The declaration is removed
from the visible title and becomes its exact HTML `id`. Labels use the same
grammar as block labels. A closing ATX `#` sequence may follow the declaration.
Code spans, escaped braces and declarations inside emphasis or links remain
literal. Titles retain their inline Markdown formatting.

Português brasileiro (`locale: "pt-BR"`):

```markdown
Consulte a {@ref sec-logic-levels} e {@ref sec-summary}.

## 1.4. Níveis lógicos {#sec-logic-levels}

### Síntese {#sec-summary}
```

The links display `Seção 1.4` and `Síntese`.

English (`locale: "en-US"`):

```markdown
See {@ref sec-logic-levels} and {@ref sec-summary}.

## 1.4. Logic levels {#sec-logic-levels}

### Summary {#sec-summary}
```

The links display `Section 1.4` and `Summary`.

Español (`locale: "es"`):

```markdown
Consulte la {@ref sec-logic-levels} y {@ref sec-summary}.

## 1.4. Niveles lógicos {#sec-logic-levels}

### Síntesis {#sec-summary}
```

The links display `Sección 1.4` and `Síntesis`. All heading levels use the same
localized section label. Other locales fall back to `Section`.

No heading numbers are inserted or inferred from document structure. A leading
decimal number (`1`, `1.4`, `1.4.2`, optionally followed by a final dot)
followed by whitespace supplies the reference number. Otherwise the reference
uses the heading's plain text, with inline formatting converted to text. Roman
numerals and appendix letters are treated as title text. The visible title is
unchanged.

Explicit labels remain stable when titles or translations change. Unlike block
IDs, heading IDs have no generated document prefix:
`[details](#sec-logic-levels)` and
`[another chapter](chapter.md#sec-logic-levels)` can use them directly.
Integrators placing several documents in the same DOM scope must avoid repeated
heading IDs, as with existing automatic heading anchors. `{@ref label}` still
resolves only within its current document; it does not load other chapters.

Heading and block labels share one registry. Duplicate labels, including a
heading and a figure with the same label, emit `cross-reference-duplicate` and
remain ambiguous. Missing references emit `cross-reference-missing`. Existing
HTML anchors are preserved; an explicit target conflicting with one is
diagnosed and left unresolved. Automatic heading anchors yield to reserved
explicit IDs and receive a free numeric suffix, regardless of source order.
Unconflicted automatic anchors keep the existing GitHub slugging behavior.

Parsing emits heading anchors and reference placeholders; `renderDocument` or
`typeset` finalizes collisions and resolves links. Repeated typesetting and
updates are supported, including locale changes. The feature works in both
`core` and `gfm` profiles and does not require `didactic`.

Compatibility: enabling `cross-references` now interprets valid trailing
heading labels that previously appeared literally. Their previous automatic
slugs (which included the label text) are replaced by the explicit IDs. Without
`cross-references`, this syntax keeps its previous literal behavior. Existing
block counters and block target IDs are unchanged.

See the complete examples in
[Portuguese](../../example/pt/blocos-didaticos.md),
[English](../../example/en/blocos-didaticos.md) and
[Spanish](../../example/es/blocos-didaticos.md), combining sections, a figure,
a table, an equation and teaching blocks.

## Inline titles and compatibility

All recognized teaching blocks and caption containers share the same inline
processing. MathJax titles accept `$...$` and the protected form ``$`...`$``;
MathJSLab titles accept `%...%` and ``%`...`%`` when its executor-backed
extension is registered. These are separate languages: TeX is passed to
MathJax, and MathJSLab source is passed unchanged to `toMathML()`. Inline
expressions do not execute MathJSLab command sessions. There is no special
recognition of `\(...\)`; use the supported dollar delimiters or a `math` fence
for TeX, including TeX commands for parentheses when needed.

```markdown
::: figure A **model** of $F=AB+C$, related to {@ref values} {#model}

Figure content.

:::

::: example Expression %`F=A*B+C`% {#expression}

Example content.

:::
```

Raw HTML authored inside titles is always displayed as text, including inside
emphasis or link text and even in `trusted` mode. Markdown links and markup
produced by registered extensions still follow the engine's existing security
and resource policies. `renderHTML()` and `renderDocument()` apply those
policies; `parse()` alone does not sanitize generated HTML. Strict-mode MathJax
still requires the existing `interactive` capability grant.

To retain literal legacy titles, configure both extensions consistently:

```ts
const engine = createEducationalMarkdownEngine({
    features: ["didactic", "cross-references"],
    structuredBlockOptions: { titleMode: "plain" },
});
```

Standalone factories accept the same exported `StructuredBlockOptions` type:
`didacticExtension({ titleMode: "plain" })` and
`crossReferencesExtension({ titleMode: "plain" })`. The default is `"inline"`.
Literal titles retain numbering, labels and table presentation metadata. Escape
Markdown punctuation or use code spans for individual literal pieces in inline
mode. Trailing metadata inside code, emphasis, links, mathematics or escaped
braces remains title content rather than becoming a block identifier.

## Opt-in full-width tables

`table` is a caption container supplied by `cross-references`, not a separate
extension. Pipe tables require the `gfm` profile. Ordinary Markdown tables and
captioned tables keep their natural width unless explicitly marked:

```markdown
::: table **Values** of $F$ {#values .full-width}

|  A  |  B  |   F |
| :-: | :-: | --: |
|  0  |  0  |   0 |
|  0  |  1  |   1 |

:::
```

The supported suffixes are `{#id}`, `{#id .full-width}` and `{.full-width}`.
Presentation classes are currently restricted to `.full-width` on `table`
containers; arbitrary classes, `width="100%"`, `style` and other attributes are
not supported. Unsupported metadata remains visible and does not declare an
identifier. Identifiers retain their existing grammar and document scope.

The extension emits `markdown-table-full-width` and supplies a minimal rule for
its direct child tables: `width: 100%; table-layout: auto`. It installs styles
in the document's rendering scope, including Shadow DOM. Consumers using only
parsed HTML must install equivalent CSS themselves. Applications can override
the class in the same rendering scope.

Column alignment continues to use standard GFM `:---`, `:---:` and `---:`.
Automatic layout accommodates unequal content; full width does not force equal
column widths. Nested caption blocks and tables outside the marked container do
not inherit the rule. No inline style or arbitrary HTML attribute is copied
from the Markdown suffix. `note` remains an unsupported container.

Regression checks: `test/markdown/StructuredBlockInline.spec.ts`,
`test/markdown/MathJax.spec.ts`, and (after building the browser bundle)
`node test/browser/structured-blocks.mjs`.
