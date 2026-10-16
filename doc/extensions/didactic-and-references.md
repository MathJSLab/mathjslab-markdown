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
`example`, `exercise`, `hint` and `solution`. A title and a trailing `{#label}`
are optional. Use lowercase English kind names, a space after at least three
colons, and an opening line followed by a newline. Put the identifier after the
title on the same line. Titles are plain text; bodies support Markdown and
other enabled extensions. `exercise` renders a semantic `<section>`; `hint` and
`solution` render collapsible `<details>` with a `<summary>`.

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

Prettier may also split an inline `{@ref label}` token across lines. Keep that
token intact and use the same ignore comment before its containing paragraph
when automatic wrapping would split it. A line break inside the reference is
not accepted reference syntax.

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

Generated target IDs are scoped to the container; documents sharing an engine
can reuse labels. Update and repeated typesetting recompute numbering and
links. Generated IDs are implementation details: author links with
`{@ref label}` rather than hard-coding generated fragment IDs. Parsing alone
creates placeholders; `renderDocument` or `typeset` applies localization and
resolves references.
