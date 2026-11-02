# MathJSLab integration validation — 0.10.0

The release contract targets the published mathjslab 2.10.0 distribution from
npm. The local file dependency used for initial development has been removed;
release validation must resolve the registry package and its built Workers. See
[integration](integration.md#numeric-sessions-in-the-browser-worker-adapter)
and the [dependency audit](dependency-audit.md).

## Available host contract

`BrowserMathJSLabWorkerExecutorOptions.numeric` uses the core's exported
`SessionOptions['numeric']` type. The executor snapshots this data on creation
and independently copies it for every document. Omission retains core defaults.
`MathJSLabExecutionSession.reset()` is optional for custom executors; the
browser adapter implements it and clears workspace/storage after successful
reset. Reset and Worker recovery restore the initial numeric snapshot.

MathJSLab 2.10.0 supports live `configure('real', backend)` with workspace and
alias retention; this supersedes the initial 2.9 development candidate's
backend-requires-new-session restriction. Native number conversion may lose
precision and switching back cannot recover lost digits. Configuration remains
isolated between documents. A stale Worker lacking numeric acknowledgement
still rejects with MATHJSLAB_NUMERIC_CONFIGURATION_UNSUPPORTED.

Runtime success/error/cancelled preserve Markdown's status union and good/bad
state; diagnostic codes remain on Error. Timeout rejects with TimeoutError and
MATHJSLAB_TIMEOUT. Paired value representations keep MathML; independent load
completion text stays in order. Plot nodes and their mount/resize/dispose hooks
remain host-owned. Reset does not dispose previously materialized outputs.

## Reproducible gates

Run `npm ci` then `npm run test:candidate`. The gate fingerprints source files,
runs release:check, a clean production build, distribution/package checks,
Markdown browser suites, MathJSLab real Chromium Workers and HDL browser
suites. It packs the verified distribution into test-results/candidate-*
without another build. Reports and detailed logs are ignored generated
artifacts.

`test/distribution/mathjslab-runtime.test.mjs` exercises native module Workers:
copied decimal precision 40 versus fixed number precision 15, live conversions,
workspace isolation, reset, cancellation, timeout, recovery and independent
disposal. Retained validation/class/protocol snapshots and function-local load
with waits and indexed multiple-output assignments protect the supported
subset. The Chromium gate repeats numeric/lifecycle and retained-cycle behavior
and asserts plot mount/resize/dispose. Jest checks stale Worker diagnostics and
public API compatibility. Fixture snapshots remain committed test inputs, not
imports of sibling core source or tests.

Set MATHJSLAB_BROWSER_EXECUTABLE and HDL_BROWSER if browsers are outside their
usual paths. Install Chromium, Firefox and WebKit for the Markdown browser
gate. Validate the generated archive with `npm run verify:consumer -- ARCHIVE`
in an isolated installation before publishing that exact archive.

## Application boundary

The adapter never imports mathjslab-app state. The app must provide matching
Worker assets, MathML formatting and plot rendering, and dispose document
sessions independently. Host preference changes to creation defaults require a
new executor; initialize replacements before removing previous documents. User
code can still configure a live session through the core contract. Remote
interruption may lose workspace; numeric kernels are not universally
preemptible. Full application preference UI validation belongs to the
application repository.

## Release validation results — 2026-11-02

Validation was composed from the successful stages of candidate-IlBpWZ and
release-final, with focused repeats after infrastructure and metadata fixes.
The candidate's release checks passed 692 unit tests in 46 suites and 7 HDL CI
helper tests; its clean production build passed. Final distribution validation
passed all 24 tests and inspected 1,250 package files. Source fingerprints
remained unchanged during each validation stage.

Browser results: 72 fragment cases and 288 settled navigations; 12 URL-loaded
example cases with 105 target navigations; titles/tables in both light and
Shadow DOM across Chromium, Firefox and WebKit; 12 real molecular rendering,
resize and disposal cases; canonical MathJSLab Workers with numeric isolation,
live conversion, retained cycles, cancellation/timeout recovery and plots.

HDL results: 72 general browser cases, 23 VHDL synthesis cases, 30 VHDL public
runtime/replay cases and 61 Verilog runtime probes passed. One initial VHDL run
failed while reading a locally served Wasm stream; the unchanged full 23-case
suite passed on repetition. Both attempts are retained in release-final logs.

Updated renderer smoke tests also passed OBJ/STL WebGL geometry (10,219 and
40,702 nontransparent pixels), resize and disposal, plus real MEI/MusicXML
notation and disposal. Reproduce with node
test/browser/dependency-renderers.mjs. Browser versions: Chromium 156.0.8078.4,
Firefox 157.0, WebKit 27.2 and Chrome 156.0.8078.79 for HDL; Node 26.12.1.

The first browser example run found two 30-second cold-start timeouts on the
large chapter. Its navigation/locator budget now matches the existing explicit
120-second readiness budget. All 12 cases then passed with unchanged rendering
and navigation assertions. The first isolated installation exposed a public
Leaflet type dependency; @types/leaflet 1.9.22 is now a regular dependency so
public declarations also work when optional renderers are omitted.

Final archive: mathjslab-markdown-0.10.0.tgz (47,311,223 bytes). SHA-256:
0cc9fa7baa3312c4d13c2036bf6c61cdae0a7d6d54068b77ca6b1666055e6525. Its 822
distribution files are byte-identical to the production build used throughout
validation; subsequent changes were dependency metadata and tests. Generated
logs, reports and the archive remain under test-results/release-final.

The build retains warnings about optional dynamic modules and bundle size.
Production npm audit reports zero vulnerabilities; 30 development-only findings
remain documented in dependency-audit.md. Complete application UI validation
remains the host application's responsibility.

The exact final archive was installed outside the checkout with optional
renderers omitted and registry mathjslab 2.10.0 explicitly installed. All three
native Worker regression tests passed again and strict NodeNext public type
checking produced zero diagnostics. Imports resolved inside the temporary
installation. This also confirms the public Leaflet declaration dependency fix.
