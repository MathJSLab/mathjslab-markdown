# Release notes

## 0.8.1 (unreleased)

- Scroll fragments after the document's ready state and navigation layout have
  settled. Prevent the disappearing loading status from shifting the final
  scroll destination above the viewport, notably in WebKit. Preserve smooth
  scrolling and reduced-motion preferences; cancel queued scrolls on disposal.
- Use current heading geometry for the active outline section, rather than
  stale intersection rectangles captured during scrolling. Announce fragment
  targets on repeated navigation within a collection.
- Add sequential Chromium/Firefox/WebKit fragment regressions in Portuguese,
  English and Spanish, including final geometry, large fonts/margins, nested
  scroll containers and Shadow DOM, collections, and reduced motion.
- Pin the browser test driver to Playwright 1.64.1 (WebKit 27.2, revision 2370).
- Validate 72 production browser cases / 288 settled navigations, 618 unit
  tests in 42 suites, and 21 distribution tests. Keep the application unchanged;
  the unrelated Firefox image cancellation remains unproven.

## 0.8.0 — 2026-10-23

- Support explicit `{#label}` anchors and `{@ref label}` references for
  Markdown headings. Reuse manual decimal numbering in localized section
  references; unnumbered headings use their title. No automatic section
  numbering is added.
- Explicit heading anchors take precedence over automatic slugs. When
  `cross-references` is enabled, previously literal trailing heading labels
  become metadata and replace the old text-derived anchors. Existing block
  numbering and generated block IDs remain unchanged.
- Preserve extension token walkers in strict security mode so explicit heading
  metadata is processed consistently without disabling HTML escaping.
- Add heading, anchor-conflict and navigation tests, distribution coverage with
  real MathJax, and integrated examples in Portuguese, English and Spanish.
  Validate 616 unit tests across 42 suites and 21 production distribution tests.

## 0.7.2 — 2026-10-22

- Prioritize HDL schematics/waveforms and show localized execution status.
  Place compiler logs and diagnostics in accessible collapsible details;
  successful results start collapsed and errors/cancelled results start open.
- Normalize terminal escape/control sequences for HDL log display and TXT/JSON
  UI exports, without changing raw executor results or update callbacks.
  Preserve incremental/final log replacement and interactive reset behavior.
- Verify the published 0.7.1 presentation against the correction in real static
  browsers: 173 checks across Chrome/Edge, including pt/en/es multiplexors,
  new HDL sources, compiler errors, responsive details and exports. Preserve
  compiler asset integrity and existing application authorization/configuration.

## 0.7.1 — 2026-10-20

- Reissue the validated 0.7.0 release following delayed registry availability.
  No runtime, compiler asset, dependency or public API changes.

## 0.7.0 — 2026-10-20

- Add a self-hosted Icarus/YoWASP Worker executor, pinned compiler assets and
  static application integration, with real browser tests and shared replay.
- Add self-hosted GHDL WebAssembly VHDL-2008 synthesis, original source diagnostics,
  IEEE.NUMERIC_STD coverage and archived upstream build inputs.
- Add real NVC VHDL-2008 simulation and interactive replay, Wasm32 runtime fixes,
  temporal/VCD regression fixtures, complete source archives and a pinned build recipe.
- Verify byte-identical NVC JS/Wasm/libraries across independent Windows build roots,
  and preserve real elapsed VCD/CSV time for testbenches without signals.
- Replace the downloaded VeriSim binaries with a source-built Icarus static-Wasm port;
  distribute complete corresponding sources, dated patches, bootstrap inputs,
  Emscripten pins and runtime licenses. Verify matching six-artifact builds in
  two Windows/MSYS2 roots and cap each module's Wasm heap at 512 MiB.
- Correct packaged GHDL build paths and complete its six-source smoke suite.
- Guard normal publication against unresolved HDL source/build gates.
- Reconstruct GHDL from pinned Linux inputs: immutable Ubuntu digest, all 236
  installed package versions and hashes of all 145 downloaded .deb files.
  Promote the matching Wasm/libraries and bind their reproduction evidence to
  the exact source recipe; reject stale proof before publication.
  The exact browser/language profile and app revalidation requirements are in
  doc/hdl-browser-results.md; complete-language compatibility is not claimed.

- Validate the promoted static distribution in Chrome and Edge: 402 package
  browser cases and 231 application integration cases, including all ten HDL
  lesson families in Portuguese, English and Spanish. Preserve explicit host
  authorization, local-only HDL processing and ordinary static hosting.


## 0.6.1

- Resolve public package imports to source entry points in Jest so application
  integration tests also run after cleaning the distribution, before building.

- Validate the complete 78-fence pt/en/es HDL inventory with actual GHDL 6.0.0,
  Icarus/VVP 14 development and Yosys 0.70+157: 69 backend tests without skips.
  Retain 21 passing production distribution tests, app compatibility checks and
  package verification. Provide an audit report and a tested drop-in app
  configuration without enabling native production execution.

- Preserve the verified native replay checkpoint timestamp after clipping the
  private drain tick. Stable Verilog outputs now retain their elapsed VCD
  interval instead of appearing as zero-duration recordings, without inventing
  signal changes. Add real-compiler regressions for held outputs and all
  locales.

- Recognize executable HDL fences in full educational profiles without an
  executor and show actionable setup diagnostics instead of plain code or
  apparently usable simulation controls. Preserve explicit host authorization.
- Probe optional backend capabilities within cancellable execution deadlines;
  report missing toolchains before acquiring compiler sessions. Improve HTTP
  connection, token, CORS and incorrect-endpoint diagnostics.
- Audit HDL lessons in all three languages and document their execution
  prerequisites, replay semantics, production limits and concrete application
  integration changes.

## 0.6.0

- Add VHDL, Verilog and SystemVerilog syntax highlighting and extend WaveDrom
  with register maps and declarative logic expressions, preserving timing
  diagrams, sizing, themes and lifecycle behavior.
- Add local netlist schematics from bounded Yosys JSON, with explicit top
  selection, buses, generic cells, sanitized/scoped SVG and lazy layout
  loading. Bundle the renderer and layout engine licenses.
- Add explicitly authorized application-owned HDL simulation and synthesis
  executors, multi-file requests, compiler diagnostics and VCD, WaveJSON and
  netlist outputs. Preserve batch-only adapters and disabled execution
  defaults.
- Add browser HTTP and Node-only backend entries, optional native GHDL,
  Icarus/VVP and Yosys integration, capability discovery, bounded isolated
  jobs, cancellation and asynchronous cleanup. Provide an authenticated
  loopback development service and reproducible optional Windows tool
  preparation.
- Add interactive Run/Pause/Step/Reset sessions with four-state inputs/outputs,
  step limits, stale-result protection and deterministic native replay that
  preserves clock-boundary input history. Keep replay distinct from a
  persistent simulator kernel; native compilers remain optional host
  installations.
- Consolidate HDL and MathJSLab session ownership, late-acquisition cleanup and
  idempotent disposal. Add configurable shared execution scheduling with fair
  dispatch, per-document concurrency, bounded queues and execution deadlines.
- Add ordered progress/log/VCD updates, bounded NDJSON streaming, UTF-8
  decoding, legacy JSON fallback and coalesced previews. Preserve viewer
  choices and external document cancellation after initial typesetting; commit
  interactive time and outputs only after final validation.
- Add bounded declarative input timelines and exact four-state output checks.
  Split advances at event boundaries, record expected/actual outcomes, continue
  after mismatches and reset history/results with the session.
- Add VCD signal search, transition navigation, dual cursors with exact time
  differences and unsigned/signed decimal inspection. Keep confirmed batch
  waveforms interactive after executor cleanup.
- Add user-triggered VCD, exact event CSV, standalone SVG, netlist JSON,
  result/session JSON and log TXT exports. Include confirmed input history and
  check outcomes, enforce file limits, clean download URLs on disposal and
  support the optional onHDLExport host callback.
- Document the public APIs, backend profiles, scheduling, incremental results,
  inspection and exports in English. Expand and index equivalent lessons in
  Portuguese, English and Spanish: 105 notes per language, 315 total, covering
  all 24 extensions with at least four notes per extension and language.
- Validate 576 engine tests in 39 suites, 51 backend/toolchain tests, 21
  production distribution tests and five application configuration tests.
  Verify lint, engine/application types, production build and the 785-file npm
  package. Preserve the existing four Webpack dependency/bundle-size warnings.

## 0.5.4

- Add digital communication bus and electrical circuit lessons in Portuguese,
  English and Spanish, covering serial interfaces, timing diagrams, circuit
  models, transient responses and alternating-current analysis.
- Update all language indexes and extension coverage tables to 85 notes per
  language (255 total), including the six new translated lesson files.
- Protect didactic and caption headers and inline reference paragraphs from
  Prettier wrapping. Extend formatter round-trip regressions to the two new
  lessons in all three languages.

- Scope WaveDrom corpus SVG assertions to timing diagrams so MathJax graphics
  in mixed lessons do not inflate the expected diagram count.
- Validate 374 unit tests in 31 suites, 13 distribution tests, type checking,
  lint, production compilation and package contents.

## 0.5.3

- Add the mathematics and physics of music lesson in Portuguese, English and
  Spanish, with nested exercises, hints and solutions, mathematical formulas,
  maps, charts and musical scores. Update language indexes and coverage tables
  to 83 corresponding notes per language (249 total).

- Balance nested didactic and caption containers with a delimiter stack,
  supporting equal colon counts while preserving longer outer delimiters. Keep
  fenced code literal and respect exact closing delimiter lengths.
- Prevent Marked start hints from reinterpreting incomplete longer delimiters
  as shorter valid containers. Preserve missing outer closers as literal text.
- Cover isolated and nested exercises, hints and solutions, titles, labels,
  real MathJax output, registration orders, parser profiles and updates. Add a
  production browser distribution regression for nesting and references.
- Document complete nested syntax, required parent closers, extension enabling
  and the distinction between directives and literal fenced code examples.

- Preserve complete colon opening lines, identifiers and inline references
  through Prettier formatting in all three music lessons. Add formatter
  round-trip regressions and document protection for long titles and labels.
- Validate all 31 unit test suites (368 tests), 13 production distribution
  tests, type checking, lint and package contents.

## 0.5.2

- Make inline presentation an explicit renderer capability; retain block layout
  for diagrams, charts, circuits, scores and interactive viewports, with a
  diagnostic and block fallback for unsupported inline requests.
- Preserve intrinsic SVG dimensions and ABC responsiveness for display-only
  changes. Retain readable chemical scales from 0.5.1 without changing other
  renderers' native defaults.
- Restore a consistent native scale for both timing diagrams in the translated
  lessons; keep proportional sizing available when explicitly requested.

## 0.5.1

- Increase the default SMILES presentation scale to 1.75 for fences and 1.5 for
  inline structures. Preserve the drawer's explicit intrinsic SVG size instead
  of replacing it with unscaled viewBox coordinates. Keep proportional fitting,
  narrow-screen limits and explicit author dimensions.
- Enlarge the default molecular 3D viewport from 24rem to 30rem, retaining its
  responsive 4:3 aspect ratio and native rotation and zoom.
- Document the readable chemistry defaults and add regressions for block and
  inline scales and explicit size overrides.

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
