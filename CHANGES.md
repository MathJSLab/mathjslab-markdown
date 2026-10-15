# Release notes

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
