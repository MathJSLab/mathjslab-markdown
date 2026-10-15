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
are optional. Titles are plain text; bodies support Markdown and other enabled
extensions.

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

Hints and solutions use native `<details>` and `<summary>`, initially closed,
with keyboard support supplied by the browser. Outer containers must use more
colons than their nested containers. Closing delimiters must match their
opening delimiter exactly and occupy their own line. Delimiters inside fenced
code are literal. Unknown kinds and unclosed containers remain ordinary
Markdown.

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
