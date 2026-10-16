# Release notes

## 0.5.0

- Add validated renderer presentation attributes (`width`, `height`, `display`)
  on fence opening lines, global and per-extension host defaults, and per-block
  render contexts. Fit SVGs proportionally and resize interactive viewports
  without changing native language data or scaling controls.
- Render SMILES at natural size and use compact responsive 4:3 molecular
  viewports. Support true inline structures with `:smiles[CCO]{height=2rem}`,
  including bracketed atoms, while preserving literal code.
- Demonstrate natural, percentage and explicit dimensions plus inline chemistry
  in corresponding Portuguese, English and Spanish lessons. Document the API
  and extension integration in English.

- Register TikZ fonts with the document FontFaceSet so TeX labels render inside
  Shadow DOM, and release the faces when the diagram is disposed.
- Materialize trusted WaveDrom skin styles on SVG symbols to preserve strokes,
  fills and bus labels across SVG use instances in Web Components.
- Bundle MathJax New Computer Modern dynamic glyph components locally,
  including script letters used by the three translated pendulum lessons.
- Bound production minification to two workers to avoid exhausting memory when
  compiling the additional font chunks alongside a development server.
- Correct the UART and SPI timing examples in English, Portuguese and Spanish:
  extend the UART high level without artificial notches, and show four SPI
  clock pulses followed by a clean return to idle.

- Work around JSXGraph 1.14 operand discovery failing on browsers with newer
  Math functions. Detect the affected runtime, preserve operand metadata and
  test functions that sort beyond JessieCode's built-in names.

- Keep sized ABC scores in normal document flow so notation and audio controls
  retain their space. Correct the mmCIF fixture used to validate all seven
  molecular formats.
- Validate sizing, inline chemistry, diagnostics, lifecycle cleanup and
  translated examples with 346 unit tests and 12 production distribution tests;
  verify application types and 15 application integration tests.

## 0.4.0

- Retain the latest dependency releases, including Citation.js 0.9.0, webpack
  5.112.0 and ts-jest 29.4.15. Adapt citations to the renamed CSL `styles`
  registry and use the upstream types instead of stale ambient declarations.
  Configure strict, bounded BibTeX conversion without redundant provenance
  graphs.
- Align the supported Node.js versions with Citation.js 0.9 requirements:
  `^22.13.0 || >=24`, removing Node.js 20 support.
- Exercise all twelve translated bibliography examples against the production
  browser bundle, checking APA disambiguation, Vancouver numbering, uncited
  Harvard entries and the absence of metadata requests.

- Expand the three teaching collections to 82 corresponding notes each, with at
  least four diverse documents for every extension per language. Translate
  recent renderer lessons, add contrasting examples for established renderers,
  and publish complete indexes and coverage tables.
- Keep documentation in English, translate teaching-block code examples and
  repair colon delimiters. Validate collection parity, local links, reference
  resolution, input formats and real-renderer output.

- Add optional document-scoped CSL citations and bibliographies, embedded
  BibTeX/CSL JSON, APA/Vancouver/Harvard styles, page locators, Portuguese
  terms, contextual numbering/disambiguation and safe typography output.
- Add citation diagnostics and host style/locale options. Load formatting
  libraries on demand and include dependency license notices in the browser
  distribution.

- Add optional TikZ/CircuiTikZ rendering in isolated TeX/WASM Workers, with
  guarded runtime reads, serialized compilation, deadlines, local font assets,
  SVG sanitization and document cleanup. Ship runtime assets and notices in the
  browser distribution and expose trusted host configuration through
  tikzOptions.
- Add technical drawing and circuit examples, real compiler tests, malicious
  resource/SVG checks, and distribution asset checks.

- Add optional declarative dynamic geometry with JSXGraph: draggable and
  constrained points, dependent constructions, lines, circles, polygons, angles
  and conics. Validate local references and supported data attributes; require
  interactive authorization and release boards on update and disposal.
- Export geometry types, factories and manifests. Add authoring documentation,
  corpus fixtures, real-renderer dependency/constraint tests and lazy chunk
  checks.

- Add the optional WaveDrom renderer for JSON/JSON5 digital timing diagrams,
  with lazy loading, independent SVG symbols and scoped styles, light/dark
  skins, sanitized local rendering, bounded inputs and lifecycle cleanup.
- Add WaveDrom authoring documentation, corpus coverage, real-renderer
  regressions and distribution export/chunk checks.

- Add optional `didactic` and `cross-references` extensions: semantic teaching
  containers, native collapsible hints and solutions, captioned figures, tables
  and equations, category numbering, and document-local forward references.
- Localize block labels in English, Portuguese and Spanish; report missing and
  duplicate labels, recompute references on updates, and isolate IDs across
  documents. Export factories and manifests without additional dependencies.
- Document the authoring syntax and add regression coverage for nesting,
  sanitization, updates and diagnostics.
- Validate corresponding examples and local resources across all three
  languages, coverage for every extension, index entries, local links, heading
  fragments, teaching references and geometry/XML input. Render bibliography,
  waveform, geometry, TikZ and music examples with the real libraries.
- Pass all 28 unit test suites (292 tests), ten distribution tests, lint, type
  checking, formatting and package-content verification.

## 0.3.2

- Add 28 new teaching notes in each language, bringing the collection to 50
  lessons in Brazilian Portuguese, English and Spanish (150 notes total). Cover
  mathematics, statistics, physics, chemistry, biology, geography, history,
  music, geometry and computing using all 14 Markdown extensions.
- Extend the examples with molecular SDF, musical MEI and solid STL formats, as
  well as executable MathJSLab calculations, embedded chart and map data, a
  shared observation CSV dataset, cross-language links and heading navigation.
- Translate all 22 Brazilian Portuguese teaching notes into English and Spanish
  under `example/en/` and `example/es/`, including exercises, explained
  answers, diagram labels, chart titles, map descriptions and score metadata.
- Add translated collection indexes and local CSV resources, preserve
  corresponding filenames across languages, and update local links and heading
  anchors for each translation.
- Update example navigation and README guidance for the three language
  collections. Clarify that documentation and examples are available in the
  repository and are excluded from the npm distribution by the package file
  list.

## 0.3.1

- Add 22 Brazilian Portuguese teaching notes covering all 14 Markdown
  extensions, with explanations, exercises and commented answers. Include
  mathematics, six chemistry lessons, music notation, diagrams, charts, maps,
  molecular structures and a 3D solid.
- Organize examples by language under `example/pt/`, with descriptive filenames
  without numeric prefixes, collection indexes and a local CSV resource. Update
  relative links and include `example/` in the npm package.
- Consolidate documentation in English under `doc/`, with a documentation
  index, authoring and integration guides, public API, rendering, lifecycle,
  security and resource contracts, and an educational extension catalogue.
  Refresh architecture documentation and README navigation.
- Make the Verovio SVG audit use the package's own score fixture by default
  instead of depending on a sibling `mathjslab-app` checkout.

## 0.3.0

- Add configurable map baselayers with OpenStreetMap and CARTO presets, custom
  XYZ providers, per-map selectors and an offline option. Export provider types
  and presets, support engine and document configuration, and preserve the
  vector-only default and existing host baselayer hook.
- Validate map provider configuration and resource policy, sanitize labels and
  attribution, and report blocked providers and tile failures locally while
  preserving vector overlays. Document provider setup and cleanup.
- Install extension styles before viewport measurement, including inside Shadow
  DOM, and add scoped syntax highlighting styles. Wait for visible, connected
  map and 3D viewports before allocating renderer resources.
- Preserve safe local SVG symbol references used by music notation while
  rejecting external references and active content. Add a Verovio SVG audit
  helper and visual regression coverage.
- Fix map point markers, responsive bounds and cleanup; retain molecular atoms
  and hydrogens alongside protein cartoons, and restore molecular and Vega view
  updates on resize.
- Improve bare OBJ visibility and replace the Three.js animation clock with a
  disposable Timer that excludes hidden and offscreen time.
- Avoid Mermaid render ID collisions across extension instances and unify
  fallback diagnostics with extension, language and resolved resource URLs.
- Add map provider, viewer, layout, SVG, styling, animation timing and public
  API regression tests.

## 0.2.0

- Require mathjslab ^2.9.0 for the optional integration and pin development
  checks to the published 2.9.0 package instead of a sibling checkout.
- Preserve semicolon suppression when splitting commands on the same line, and
  avoid executing empty or comment-only blocks.
- Retain independent runtime text outputs while displaying MathML instead of
  duplicate text/data representations of evaluated values.
- Preserve runtime diagnostic error codes and keep document resources and
  storage available until remote session cleanup completes.
- Add integration regressions for the canonical 2.9.0 runtime, statement
  parsing, output conversion, resource loading, cancellation and disposal.

## 0.1.1

- Refresh the README with the MathJSLab logo, project links and package badges.
- Point package download, CDN, size and SourceRank badges to
  mathjslab-markdown.
- Update the MIT license attribution to 2016-2026 and include mathjslab.com.

## 0.1.0

- Align common build helpers and their TypeScript compilation with mathjslab,
  reuse organization repository synchronization, and provide the complete timed
  release pipeline.

- Introduce the reusable Markdown engine, document model, navigation,
  controller and optional Web Component extracted from mathjslab-app.
- Provide explicit component registration, presets, educational extensions and
  optional MathJSLab integration through injected executors, Workers and
  renderers.
- Keep security policy, cancellation, resource ownership and cleanup scoped to
  document sessions. Support idempotent disposal of an unused engine without a
  DOM.
- Export ESM modules and TypeScript declarations through npm subpaths, with
  fully specified relative imports for native ESM consumption.
- Provide browser bundles with a shared runtime to preserve engine and
  component identity, and load optional educational renderers on demand.
- Add repository metadata, common organization resources, development and
  release scripts, package-content verification and contributor documentation.

- Validate lazy browser chunks from the current distribution instead of
  retaining a generated historical size baseline in the compatibility corpus.
