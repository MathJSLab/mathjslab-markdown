# Mathematical labels in SVG charts

The prototype lives in
[the browser fixture](../test/browser/visual/math-labels-spike.mjs). Run
`npm run build` followed by `node test/browser/visual/math-labels-spike.mjs`.
The fixture uses the bundled MathJax and Vega-Lite under the existing test
server's CSP. Its explicit annotation list supplies TeX and accessible names.
The data contain a dollar-delimited string that stays literal.

## Approaches

| Approach                       | Finding                                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Post-process the live SVG      | Vega's layout supplies usable anchor coordinates. A DOM observer can reapply decorations after resize. SVG structure and mutation timing are runtime details, which makes this suitable for a prototype.            |
| Overlay labels in HTML         | An overlay can place labels on screen. It needs a second coordinate system and an independent composition step for standalone SVG export.                                                                           |
| Position MathJax SVG fragments | The prototype centers the fragment over the anchor and computes its vertical offset from the MathJax viewBox. The same composition works in the live chart and on a fresh export.                                   |
| Renderer hooks                 | A stable adapter should obtain named anchors and notification of completed renders from the Vega runtime. Investigate scenegraph positions and post-run hooks before adopting DOM selectors or a mutation observer. |
| Explicit annotations           | Start with an opt-in list of annotation identifiers, TeX and accessible names. Axis ticks, legend entries and arbitrary dataset strings should keep their renderer-defined behavior.                                |

## Results and limits

- Nine labels rendered, including all four subscripted current/voltage labels,
  alpha, beta, omega and two fractions. A responsive chart moved the labels
  after resize without repeating TeX conversion.
- Light and dark charts in separate Shadow Roots used different foreground
  colors and distinct glyph IDs. The prototype depends on locally defined
  glyphs. A host MathJax configuration with a global font cache needs separate
  support before it can produce standalone fragments.
- An update during annotation conversion cancelled publication. Both chart
  disposal and replacement disconnected the fixture's observers. This test
  gates work immediately before conversion. Cancellation inside MathJax itself
  was outside the experiment.
- The exported SVG was deterministic for the tested state, parsed as XML, and
  preserved all nine fragments, their accessible names and local glyph
  references. The live groups have `role="img"`. The export sanitizer drops
  that role, so standalone accessibility still needs a fix and
  assistive-technology validation.
- The fixture typesets trusted constants. The export goes through the existing
  standalone sanitizer. A public implementation must define its TeX input
  policy and sanitize the live fragments before insertion.

Use explicit annotations and a shared SVG composition path for the next
increment. Replace fixture-specific DOM observation with a renderer adapter,
retain readable fallback labels, and verify contrast, clipping, layout
collisions, sanitization and accessibility before exposing a public API.
