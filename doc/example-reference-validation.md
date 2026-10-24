# Example cross-reference validation

## Cause and correction

The 0.8.2 parser reads a colon container's title and label only from its
opening line. Prettier's Markdown prose wrapping had moved the end of six
figure openings, and the label of exercise 4, onto the next line in
`example/digital-electronics/pt/introduction-to-digital-electronics.md`. Those
labels became body text. The reference registry correctly left missing
references literal and reported `cross-reference-missing`.

The seven openings are now single lines protected by
`<!-- prettier-ignore -->`. No grammar, resolver, heading numbering or scroll
implementation was changed. The six figure labels are `fig-analog-digital`,
`fig-digitization-flow`, `fig-logic-interface`, `fig-sequential-system`,
`fig-abstraction-levels` and `fig-temperature-controller`; the exercise label
is `ex-combinational-or-sequential`.

All 322 Markdown files under `example/` were audited. No additional invalid
active labels/references were found. Running Prettier across the catalogue also
reflowed introductory prose in ten Portuguese and ten Spanish HDL notes; these
20 files have no semantic/code changes. The catalogue is formatter-stable.

## Persistent regressions

`test/markdown/ExampleReferences.spec.ts` reads the actual catalogue
recursively, including digital-electronics rather than just pt/en/es lesson
directories. It uses the production parser and reference registry to diagnose
missing and duplicate labels, checks displaced/invalid declarations and split
references outside code, and compares metadata before/after the real repository
formatter. Formatting runs in one native Node process, avoiding 322 process
launches. Mutations of the real chapter prove the guard rejects
missing/duplicate targets and formatter-style damage while preserving literal
code examples.

`test/browser/example-references.mjs` loads the complete introduction and the
three actual `blocos-didaticos.md` translations by URL in the distributed
`markdown-document` component. `features: 'all'` is enabled. The chapter checks
all six numbered captions, its four actual figure references, five Mermaid
SVGs, the Vega-Lite SVG and MathJax output. The translated lessons cover
titles, figures, tables, equations, theorem/exercise blocks, localized
numbering and references both before and after their targets.

Every unique reference is clicked. After two seconds, three geometry samples
must show its caption/title completely in the viewport and a stable final
position; the host URL must remain unchanged. The body uses 24px text and a
1,000px footer so a scroll limit cannot mask the defect. Supplemental documents
derived from the actual Portuguese lesson exercise shared-engine document
isolation and literal inline/fenced code. A label available in a sibling
document must remain missing in the current document.

The browser fixture explicitly authorizes the renderers' network/interactive/
Wasm capabilities and the chapter's bibliographic origins. Vega's expression
compiler is permitted by the fixture's CSP. This is test-host configuration; no
application policy or package security defaults are changed. Optional renderers
are real, not mocked, and no external bibliography links are followed.

The release CI runs the catalogue guard and URL-loaded example regression. No
CI run or publication is initiated in this correction task.

## Packaging and application follow-up

The 0.8.2 npm manifest excluded `example/`. The next package will include all
328 catalogue files (322 Markdown files and six local resources). Package
verification rejects any omitted file. A validation tarball is generated in
`report/example-reference-package/`, separately from the saved public 0.8.2
tarball; metadata remains 0.8.2 until a new release is authorized. It is not a
replacement publication of the immutable registry version.

The app's menu scripts currently load the book from
`https://raw.githubusercontent.com/MathJSLab/mathjslab-markdown/refs/heads/main/example/digital-electronics/pt/`.
Updating only the installed engine cannot repair an old Markdown response.
After the corrected sources are published to that branch, revalidate the
downloaded response, the shared Portuguese book menu in pt/en/es, captions,
references and settled fragment geometry. Browser/CDN cache state should be
distinguished from the actual response bytes. For local validation, route that
same URL to the corrected real file, not to a simplified replacement document.

The resolver still emits missing/duplicate diagnostics and keeps invalid
references literal. Do not suppress these warnings or broaden the grammar in
the app. A future npm patch release is needed to distribute the newly included
catalogue, but the content correction works with the already published 0.8.2
engine. The app working tree is untouched here.

## Executed results â€” Windows, 2026-10-24

- Four targeted Jest suites / 45 tests passed: real example catalogue, didactic
  references, heading references and didactic nesting. The catalogue contained
  322 Markdown documents, 358 registered targets and 145 active references;
  both original and Prettier-formatted versions had zero issues.
- Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2 (Playwright 1.64.1,
  WebKit revision 2370) ran sequentially. All 12 real-document scenarios passed
  with 75 unique-reference navigations and stable final geometry. Each engine
  also checked shared-engine isolation and literal code using a copy of the
  real Portuguese lesson. Localized text, all six reference categories and
  forward/backward positions were checked against the captured real DOM data.
- The existing scroll runner passed six nested scrollport/Shadow DOM cases
  across the three engines with normal/reduced motion: 24 navigations. Two
  additional WebKit cases with 36px fonts, large margins and trailing space
  passed: eight navigations. All visibility/stability assertions were retained.
- The complete catalogue was formatted; the resulting files are formatter
  stable. The seven corrected openings remained intact.
- Package verification passed for 1,217 files. The generated validation archive
  contained all 328 catalogue files, each byte-identical to the working tree,
  including the corrected full chapter. Exports, declarations, imports and
  pinned HDL assets passed the existing checks.

For economy, the existing production 0.8.2 distribution was reused: all 149
browser JavaScript files were byte-identical to the saved published tarball.
This demonstrates the content fix against the actual 0.8.2 runtime; no engine
change or production rebuild was necessary. General unit/application suites,
Linux CI and a deployed app/Netlify session were not rerun. The tests exercised
the Windows Playwright engines, not native macOS Safari. CI steps are prepared
for a future authorized push.

Ignored evidence files: `report/example-reference-catalog.json`,
`report/example-reference-unit.log`, `report/example-reference-browser.json`,
`report/example-reference-nested.json`, `report/example-reference-large.json`
and `report/example-reference-package-verification.json`.

At the end of the initial content-validation stage, no commit, push, registry
publication or deployment had been performed. Package version/lockfile remain
0.8.2; the archive under `report/` is an unpublished validation artifact. The
public raw GitHub responses will remain unchanged until these source
corrections are published to the branch used by the app.

## Release 0.8.3

The subsequent authorized release advances the package and lockfile to 0.8.3.
Run the complete `prepublishOnly` and `prepack` checks once, reuse the
successful Windows browser evidence above, and validate the package on Linux
through the release workflow without rebuilding the unchanged host application.
Publish the verified archive and confirm npm `latest` and downloaded tarball
integrity.

Release checks passed: 621 unit tests in 43 suites, 22 distribution tests,
production build, lint, TypeScript, HDL gates and package verification (1,217
files). All 328 example files in the final 0.8.3 archive match the source
bytes.
