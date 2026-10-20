# Browser HDL implementation and remaining work

Date: 2026-10-20. Real VHDL-2008 simulation/replay now uses NVC Wasm,
while synthesis uses GHDL followed by YoWASP. Verilog retains Icarus/YoWASP.
See the [current VHDL report](hdl-vhdl-progress.md) for the exact tested profile,
source fixes, browser evidence, integration candidate and remaining limits.
No remote compiler, local execution service or native fallback is used.
Complete-language support and cross-platform reproduction are not claimed.
NVC now has byte-identical results from two independent Windows build roots;
the source-built Icarus port now has matching artifacts across two Windows build
roots and complete corresponding sources. The Linux GHDL reconstruction now
passes byte comparison with pinned inputs in Actions run 39482133976; its
validated assets are promoted and source/reproduction release gates pass. Historical
investigations and earlier results below do not validate later distributions.

## Promoted pinned GHDL distribution validation (2026-10-20)

The exact GHDL candidates from pinned Linux run `39482133976` are now promoted.
The source/reproduction release gate passes for GHDL, NVC and Icarus. The GHDL
Wasm remains `245664fcd1cbb1200627d9b566e90da3e54188447fabb38b2c9fe469a59eb57e`;
the canonical library archive is
`e67ca499db3ae429c382b1cc5c91775eb292918e2f7008daee29a995c6f2874a`.
The complete deployed HDL lock SHA-256 is
`5084bd775a957873e9177ec2ddc52cd54ce8c01bc0210629627b85776dd23b9e`.

After rebuilding production, the full real-browser matrix passed again:
**201 cases in Chrome 155.0.8059.85 and 201 in Edge 155.0.4283.62**. Each browser
passed 4 novel Verilog runtime probes, 72 Verilog lesson/UI cases, 30 VHDL
runtime contracts, 72 VHDL lesson/UI cases and 23 GHDL synthesis cases. Coverage
includes all ten requested lesson families in pt/en/es, sources outside those
examples, numeric_std, real sequential state and delta/wait behavior, 0/1/x/z,
clocks, controls/history/checks, inspection/exports and cancellation/disposal.

All **5,735 requests** were same-origin GET without bodies or query strings;
there were zero page errors. All **32 HDL files** were hash-frozen throughout
the ten sequential runs. No execution backend, CDN, COOP/COEP or cross-origin
isolation was used. The VHDL counter screenshot was visually inspected.
No browser/HDL run overlapped a package distribution rebuild. Generated evidence
is under `.hdl-research/pinned-ghdl-final/` and `test-results/hdl-browser/`.

Lint, typecheck, 588 unit tests, 21 distribution tests, 7 release/comparison
tests and 4 catalog-metadata tests passed. Package verification passed with
880 files, including the compiler source/build evidence and the app test patch.
Unit/recorded executor tests are complementary, not substitutes for the real
browser matrix above. No package publication or deploy occurred.

### Current app integration against the promoted distribution

The current mathjslab-app working tree was copied into an isolated workspace,
reusing its installed dependencies (registry mathjslab 2.9.0 and the local
Markdown dependency). Its runtime/configuration were preserved. Sequential
validation passed **77 cases in development Chrome, 77 in production Chrome
and 77 in production Edge: 231 cases**, with zero page errors. Browser versions
were the same as in the package matrix above. Both app builds copied all 32 HDL
files byte for byte. Production served static files only; no COOP/COEP or
cross-origin isolation was required.

All 4,282 recorded app requests were GET without request bodies. External
requests were limited to README images (84 per run); HDL assets and processing
remained local, and no HDL sources were uploaded. The signal-free testbench
retained its verified 1 ns endpoint and empty signal list.

One obsolete assertion in the copied integration test expected that valid
signal-free recording to fail. Only that copied test was corrected; the
original app checkout remains unchanged. The checked patch is distributed as
[mathjslab-app-empty-trace.patch](integration/mathjslab-app-empty-trace.patch)
for application in the app workspace with authorization. This test-only change
does not change the executor API or application configuration. Evidence is in
`.hdl-research/pinned-ghdl-final/app-summary.json` and the isolated app reports.

## Earlier frozen distribution validation (2026-10-20)

The [current VHDL report](hdl-vhdl-progress.md#validation-of-this-candidate)
records the completed static-browser matrix after the source-built Icarus
replacement: **402 checks**, comprising 30 NVC runtime/contract, 72 VHDL lesson/UI,
72 Verilog regression, four new Verilog runtime and 23 GHDL synthesis
checks in each of Chrome 155.0.8059.85 and Edge 155.0.4283.62. Zero page errors;
all 5,736 recorded requests were same-origin GETs without bodies or query strings.
All 32 static HDL files match their source bytes and stayed frozen throughout
the matrix. The signal-free testbench and its exports
pass in pt/en/es; 588 unit and 21 distribution checks plus package inspection
(873 files) also passed. The older result sections below are
historical and are not additional current runs.

## Implementation

`mathjslab-markdown/hdl` exports `createBrowserHDLExecutor`. The trusted app
must set `allowBrowserExecution: true` and enable the existing `hdl` and
`hdl-interactive` document policies. Markdown cannot supply either permission.
The supplied app integration uses the same configuration in development and
production, without environment guards, tokens or sessionStorage.

Each batch run creates a module Worker, fresh compiler/runtime instances and
private MEMFS files. Interactive sessions use the same deterministic replay
implementation as native sessions: every confirmed step recompiles actual
source and replays confirmed input intervals. Failed steps do not commit
history. There are no circuit models, example recognizers or stored answers.
The verified final timestamp survives clipping the private drain tick even when
every signal remains stable. Run/Pause/Step/Reset, stimulus scheduling, checks,
viewer and exports retain the existing extension contracts.

Workers terminate after each job, on AbortSignal, timeout or disposal. Defaults
are 30 seconds and four logical sessions (configurable, maximum 300 seconds and
16 sessions). Interactive internal jobs count against their owning session.
Limits: 256 KiB serialized request, 64 KiB logs, 512 KiB compiled output or
VCD/netlist, 1 MiB worker message, 1,000 confirmed replay intervals. Icarus
and NVC MEMFS growth is checked during writes: 512 KiB per file and 4 MiB accounted
allocation per module. NVC additionally has a 512 MiB maximum Wasm heap; this is not a cap on total
process memory. The new source-built Icarus modules each have the same 512 MiB
maximum heap. YoWASP's virtual filesystem and compiler heap are governed
by its build and the browser; output size is checked after synthesis. Stronger
heap quotas require rebuilding these toolchains. Browser termination/GC
controls physical memory reclamation; it is not synchronous JavaScript
deallocation.

## Fixed toolchain and provenance

The complete asset inventory, byte counts and SHA-256 hashes are in
`assets/hdl/toolchain.lock.json`; `node script/verify-hdl-assets.mjs` verifies
them. The production build copies the directory to `dist/browser/hdl/` and the
npm `dist/` inclusion packages it. Tool JS and Wasm are separate assets, loaded
only when a job needs the corresponding tool. Yosys is about 78 MB unpacked in
this particular distribution, substantially larger than older YoWASP releases.

| Project                                                                                                    | Inspected revision / API                                                                                           | Status and license                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [YoWASP website](https://yowasp.org/)                                                                      | npm `@yowasp/yosys@0.70.62-dev.1236`; `runYosys(args, files, {stdout,stderr})` returns a virtual file tree         | Real browser synthesis, ISC; npm tarball integrity and individual file hashes fixed. The old [GitHub documentation repo](https://github.com/YoWASP/yowasp.github.io) is archived and the current site points to Codeberg. |
| [Icarus](https://github.com/steveicarus/iverilog/tree/c7530dbcc186de2f21eacde14fd28061b885924c) | Official commit `c7530dbcc186de2f21eacde14fd28061b885924c`, Emscripten 6.0.12; factories `ivlpp`, `ivl`, `vvp`, `FS` and `callMain` | Real source-built compiler/runtime with MathJSLab static target/VPI adaptation; GPL-2.0-or-later. Complete sources/recipe and two-root evidence under `script/hdl/icarus-browser/`; runtime notices retained. |
| [ghdl-browser](https://github.com/UnsignedChad/ghdl-browser/tree/e98e5a6c6fd6c48a789705ae9900c6b34b3cb414) | commit `e98e5a6c6fd6c48a789705ae9900c6b34b3cb414`; libghdl analyze/compile API                                     | Experimental browser-host compiler, GPL-2.0; not integrated.                                                                                                                                                              |
| [ghdl-wasm](https://github.com/UnsignedChad/ghdl-wasm/tree/aebafd2f848a94bd63f30e5adc7a30a00a1ea109)       | commit `aebafd2f848a94bd63f30e5adc7a30a00a1ea109`; ortho Wasm/WAT backend                                          | GPL-2.0; emitting Wasm from a native compiler is insufficient to make the compiler run in a browser.                                                                                                                      |

**Historical VeriSim blocker:** downloading and hashing binaries is reproducible asset
acquisition, not a verified reproducible source build. VeriSim's inspected tree
contains uploaded binaries but no build recipe or port patches, despite its
README describing loader/code-generator modifications. A pointer to the
unmodified upstream Icarus commit does not establish corresponding source for
those modifications. Those downloaded modules have been replaced by a port
actually built from the supplied official archive and MathJSLab patch. All six
artifacts match across two Windows/MSYS2 roots using the same pinned SDK/cache;
the exact scope is recorded, without cross-platform or cross-machine claims.
GHDL's independent reconstruction remains a publication blocker.
The package MIT license does not relicense the bundled GPL assets;
the separate license notices are retained. YoWASP publishes packaging recipes
and a versioned npm archive; its source-to-binary reproducibility was not
independently rebuilt here either.

## Earlier VHDL investigation (superseded for synthesis)

The inspected ghdl-browser README reports 20/26 compile/validation tests,
including four `IEEE.NUMERIC_STD` failures with out-of-bounds memory accesses.
Its known issues also describe process state lost across scheduler invocations
and signal values not decoded. Those are upstream reports, not failures
reproduced locally in this task. Validating emitted Wasm alone does not
validate sequential simulation or a correct VCD. The repository has build
scripts and runtime stubs, no tracked `ghdl.wasm`. Its documented build
requires Debian 13, GNAT 14.2, LLVM/Clang/LLD 21, AdaWebPack and GHDL 5.0.1
sources; this build was not performed on this Windows host.

Pending work includes fixing the browser-host numeric_std compiler path,
building and pinning the frontend and IEEE libraries, implementing a faithful
GRT signal/delta-cycle/process scheduler with persistent state and four-state
VCD output, and exposing a real synthesis path (GHDL Verilog output into
YoWASP). The latter is now implemented and browser-tested using the separate
frontend documented in the continuation report. Simulation still requires the
runtime work above. An
artificial JS circuit model or compiling user sources on a server would not
resolve these requirements. The earlier snapshot excluded all 39 VHDL
source/batch/interactive fences; that statement is historical, not the current
synthesis capability.

## Browser validation

The static test server serves GET files only and rejects other methods. It
contains no HDL endpoint and launches no native compiler. The Playwright test
launches an installed real browser and records request URLs, methods, bodies,
browser version and assertions in `test-results/hdl-browser/`. Only same-origin
GET requests without bodies are permitted. CSP restricts connections to self.

Run `npm run build:types`, `npm run build:browser`, then
`npm run test:hdl:browser`. Set `HDL_BROWSER` to another installed Chromium
executable to run Edge. Chromium here is a real installed browser, not JSDOM.
The harness imports package-compiled source modules and the packaged
`dist/browser/hdl/` compiler assets. It exercises extension DOM renderers and
real Workers; deployment inside the separate mathjslab-app remains a separate
integration check. Native tool tests establish replay regressions only and must
not be counted as browser VHDL support.

The mathjslab-app repository itself was not modified. The supplied drop-in
configuration and asset-copy instructions require this unpublished local
package, not the already published 0.6.1 dependency.

The detailed executed results and remaining untested behavior are recorded at
the end of this report after the final validation run.

The pinned Icarus port currently prints `Failed to open 'system.vpi'` /
`dynamic linking not enabled` while producing working recordings through its
statically linked system tasks. The tests exercise real `$dumpvars`, `$finish`
and VCD outputs; the original tool logs are retained. Resolving this confusing
loader notice in the port is additional source/build work, not a reason to
substitute simulation results.

## Review of all extension processing paths

Source review covered every directory under `src/markdown/extensions`:

| Extensions                                                               | Processing location; network role                                                                                                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| abc, verovio                                                             | Client JS/Wasm notation/layout/playback; optional library assets                                                                                                                        |
| citations                                                                | Client citation-js/citeproc, bibliography parsing; input bibliographies and style data are resources                                                                                    |
| cross-references, didactic, heading-ids, relative-urls, syntax-highlight | Client transforms, formatting and highlighting                                                                                                                                          |
| geometry, maps                                                           | JSXGraph/Leaflet locally; map tiles/GeoJSON are data downloads. Built-in OSM/Carto tile servers are not processing executors; hosts can supply local tile sources                       |
| graphviz, tikz                                                           | Browser Wasm compilation; TikZ owns a terminable Worker and local runtime/font assets                                                                                                   |
| mathjax, mermaid                                                         | Client parsing/layout; fonts and lazy chunks are assets                                                                                                                                 |
| mathjslab                                                                | Host-supplied executor; choose `createBrowserMathJSLabWorkerExecutor` for client-only execution. The generic transport interface does not itself guarantee where a custom host executes |
| model-3d, molecule-3d, smiles                                            | Client parsing/rendering; models, molecular files and textures are data                                                                                                                 |
| netlist, vcd, wavedrom                                                   | Client parsing/layout/inspection of provided circuit data; no HDL compiler implicitly invoked                                                                                           |
| vega-lite                                                                | Client compilation/rendering; external data URLs are fetched and inlined as datasets                                                                                                    |
| hdl, hdl-interactive                                                     | Host-authorized executor; this new browser executor is local. Preserved HTTP/native adapters are legacy API compatibility, not static-deployment solutions or fallbacks                 |

This was a source audit of extension-controlled paths, not a network trace of
all optional third-party library features. Host adapters and arbitrary remote
datasets must still obey the application's resource policy. No other required
remote processing service was found in the reviewed implementations.

## Executed results, 2026-10-18

Both installed browsers ran headlessly against the GET-only static server,
using the real packaged compiler assets and no HDL execution backend:

| Browser        | Version       | Result                            |
| -------------- | ------------- | --------------------------------- |
| Google Chrome  | 155.0.8059.82 | 72 cases passed, zero page errors |
| Microsoft Edge | 155.0.4283.62 | 72 cases passed, zero page errors |

The suite covers all **39 Verilog fences** in the ten required lesson families
across pt/en/es: 12 plain sources synthesized separately, 12 batch requests and
15 interactive requests. Plain fences remain presentation-only in the UI.
Additional assertions exercise a novel XOR circuit, a four-state buffer and a
new replacement circuit, located compiler errors, stable 7/12 ns recording
endpoints without invented transitions, sequential clocks and replay history.

Actual browser DOM controls cover Run/Pause/Step/Reset, manual inputs,
sequential reset, and JSON/TXT/VCD/CSV/SVG export contents via the public
onHDLExport callback. All 12 batch variants also render real waveform/netlist
SVGs and export their results. Tests verify session quotas, source size,
timeout of an infinite simulation, AbortSignal termination, responsive
main-thread timers, replacement of an active job, zero remaining tracked
Workers after disposal, and browser Worker release on navigation. Policy and
unavailable-VHDL cases run in all three locales; those negative checks do not
count as VHDL compilation support.

Request URLs, methods and bodies are retained in
`test-results/hdl-browser/chrome.json` and `msedge.json`. Every recorded
request was a same-origin GET without a body; all seven distinct Wasm asset
URLs were local. There were no source uploads or processing requests to
external services. The server has no processing routes and rejects non-GET
methods. No service was listening on the conventional HDL development port 8787
in the final inspection. Screenshots are alongside the JSON reports.

Other executed checks:

- 586 unit tests in 40 suites passed; lint passed.
- 69 native/compiler regression tests passed with the complete 78-fence native
  inventory. This validates the shared replay refactor, not browser VHDL.
- 21 distribution tests passed; the updated HDL export/asset-path check also
  passed independently.
- Clean type/declaration and production builds passed, retaining the four
  dependency/bundle-size warnings. The package check verified 808 files.
- All 14 third-party asset hashes match both source and completed distribution;
  Worker, notice and lockfile are byte-identical too. Assets total about 81 MB
  uncompressed. Webpack must preserve their original bytes (`minimized` asset
  metadata); otherwise it changes loaders and invalidates the pinned hashes.

Validation exposed and corrected generated capture-file diagnostic attribution
and an incorrect test assumption that Step stays enabled after a scripted
session completes. One further concurrent Chrome/build round failed reading a
Wasm response (`ReadableStream` network error); its exact cause was not proven.
The complete subsequent Chrome round with the build stopped passed all 72
cases. This occurrence does not establish a general network/memory reliability
guarantee for the large YoWASP assets.

Historical acceptance gaps at the previous snapshot were browser VHDL simulation/interactivity, complete
corresponding Icarus port sources/reproducible builds, and app validation of the
new synthesis increment. The app has separately reported successful Verilog
integration; see its current validation report. Firefox, Safari and mobile browsers
were not tested. Exports were inspected through the supported application
callback; OS download/save dialogs were not exercised. Arbitrary HDL standard
coverage, heap quotas and every optional renderer feature are not established
by this suite. **Full acceptance remains unmet.** No commit, push or
publication was performed.
