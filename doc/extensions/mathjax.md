# Mathematical expressions and SVG output

The default `gfm` profile registers MathJax. The `core` profile requires
explicit registration of `mathJaxExtension()` from
`mathjslab-markdown/extensions`. The optional `mathjax` dependency must be
installed.

Inline mathematics uses `$...$`, without whitespace immediately inside the
delimiters or a line break. A closing dollar followed by a digit is not
accepted as an inline delimiter. Display mathematics uses a complete `$$...$$`
line or opening and closing `$$` lines. The extension also accepts `math` code
fences and the protected inline form ``$`...`$``. Ordinary code spans and other
code fences remain literal.

Boolean expressions use ordinary TeX syntax; no subject-specific rewriting is
performed. This minimal example includes complements, indices and logical
operators:

```markdown
Uma implementação possível é $Y=A\overline B$. Outra é $Y=A$.

$F_1=\overline{A}\land B\lor\neg C\oplus D$

$$
F_2=\overline{A+B}=\bar A\cdot\bar B
$$
```

`parse()` produces HTML containing inert mathematical source placeholders. Use
`await engine.renderDocument(source, container)` to insert the document and
finish typesetting, or `await engine.typeset(container)` after inserting parsed
HTML through the appropriate security path. Inspect the DOM after that promise
settles. Sanitization of initial HTML precedes MathJax typesetting.

MathJax produces `mjx-container` elements containing SVG glyphs. A formula may
contain several SVGs; do not assume one SVG per expression. Inspect the
complete formula wrapper, including glyph paths and the targets of SVG `use`
references. Errors can appear as `.mathjax-error` or MathJax `mjx-merror`
elements.

SVG output is graphical: `textContent` is not a transcription of the formula. A
copy, extraction or accessibility tool may expose SVG image elements as generic
image names. Text such as `svg svg` alone therefore does not establish a
mathematical rendering failure. Compare the final DOM and visible result in the
host application, and check whether that application subsequently sanitizes,
serializes or transforms the output. Accessibility and clipboard behavior must
also be checked in the actual host and assistive technology. Do not replace
mathematical expressions with prose to hide such a discrepancy.

MathJax currently declares the `interactive` capability. The default `trusted`
and `sanitized` policies allow it; `strict` does not. An integrator can
explicitly grant `allowedCapabilities: ['interactive']` when appropriate.
Without that grant, strict mode leaves the mathematical source pending. This is
a capability policy decision, not evidence of invalid TeX.

Mathematics inside teaching blocks requires `didactic` in addition to MathJax.
Block labels and `{@ref ...}` resolution additionally require
`cross-references`. See
[teaching blocks and references](didactic-and-references.md).
