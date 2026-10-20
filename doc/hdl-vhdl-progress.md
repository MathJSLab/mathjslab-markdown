# VHDL browser simulation — 2026-10-20

The candidate browser executor now compiles, elaborates and simulates real
VHDL-2008 with NVC 1.22.0's bytecode interpreter and event runtime inside a
terminable Worker. GHDL synthesis and Icarus/YoWASP remain separate real tools.
No synthesis-to-simulation substitution, circuit recognizer, service or native
visitor dependency is used. Module Workers, MEMFS and ordinary static assets
work without SharedArrayBuffer or COOP/COEP.

## Prepublication hardening — 2026-10-19/20

The NVC candidate was rebuilt in two independent Windows/MSYS2 directories.
Their JS, Wasm and library archives are byte-identical; all 3,298 original
source files and the generated symbol table also match. Build B ran the final
recipe uninterrupted from fresh archived sources. Build A rebuilt its final
util.c correction and all libraries. `script/hdl/nvc-browser/reproduction.json`
records the method, tools and hashes. This is root independence on this host,
not a cross-platform or cross-machine claim. NVC's reproduction flag is now true;
Icarus has since been replaced by the source-built port below; GHDL's independent
source-build gate remains unresolved.

The recipe fixes compiler source paths, locale/time metadata and Windows
NODERAWFS relative locations. Signal-free testbenches now export their actual
runtime endpoint as empty VCD definitions, with no dummy variables. A new
self-checking variable/wait testbench stops at 133 ns; seven private real-browser
probes passed in Chrome and Edge against each final candidate. VCD parsing and
CSV export accept genuine signal-free recordings, with endpoint-only CSV rows.

The pre-Icarus-replacement distribution passed the complete static-browser matrix on
2026-10-20: 394 checks and 5,618 same-origin GET requests without bodies, with
zero page errors. The 588 unit tests, 21 distribution checks, lint/typecheck and
package verification (860 files) passed. `npm run verify:hdl:release` now guards normal
publication before registry access and keeps the unresolved source/build gates.
No package publication, commit, push or deploy was performed.

## Source-built Icarus candidate — 2026-10-20

An independent MathJSLab port now builds the official Icarus commit
`c7530dbcc186de2f21eacde14fd28061b885924c` with Emscripten 6.0.12. Its real
preprocessor, compiler/VVP target and simulator run in the existing Worker.
Standard VPI startup tables are linked statically; foreign modules are rejected.
Complete archived sources, the adaptation and generated Autoconf/gperf inputs
are staged under `script/hdl/icarus-browser/`. No producer's missing patch is
being guessed to justify the old downloaded binaries: the replacement is built
from the supplied source instead.

The isolated initial candidate passed 72 Verilog cases in Chrome 155.0.8059.85
and 72 in Edge 155.0.4283.62, plus four novel-source probes per browser.
These are separate from the earlier 394-case production baseline. The new
`test/hdl-browser/verilog-runtime.mjs` also checks actual VCD counter/state/math
values, the 19 ns endpoint, file/line diagnostics, Worker disposal and network.
It passed in both browsers against the path-normalized candidate.

The first independent reconstruction matched all 6,102 original source files
and JS, but Wasm contained absolute lexer/parser paths. A minimal preprocessor
test confirmed that MSYS was rewriting the POSIX prefix-map flags; excluding
those flags and the virtual VPI directory from argument conversion removes
the developer paths. All six final artifacts now match across two independent
Windows/MSYS2 source/build roots. The initial development root rebuilt affected
objects after normalization; the second root ran the full recipe from fresh
archives. Both then recompiled same-line dated source notices without changing
any artifact bytes. A third fresh extraction using the packaged prepare/patch
also reproduced all 6,102 source files. `script/hdl/icarus-browser/reproduction.json`
records the method, SDK/cache scope, source pins and artifact hashes. The candidate
distribution now uses these source-built modules and retains the old snapshot
privately for rollback. It contains 32 static HDL files, including runtime license
notices. The Icarus corresponding-source and reproduction flags are now true;
GHDL's independent build is the remaining publication gate. This does not claim
cross-platform, cross-machine or independent toolchain-cache reproduction.
Real mathematical functions execute, but real-valued VCD variables remain
outside the existing digital importer's supported subset.

## Executed build and source corrections

The NVC investigation below is superseded by an executed local build from the
complete official 1.22.0 release sources. Emscripten 6.0.12 and the exact port,
SDK, dependency archives and hashes are pinned in
`script/hdl/nvc-browser/sources.lock.json`. That directory includes full sources,
the complete adapted release patch, build recipe and library packer. The
original port's pthreads and Node raw filesystem are absent from the final
browser link. Native NVC serial queues run its own interpreter/model; foreign
VHPI/VPI/native FFI and dynamic libraries are disabled. The Node Wasm bootstrap
is a developer build tool used to compile the standard libraries, never part of
visitor execution. See the recipe README for portable Windows setup details.

Real browser tests exposed and led to corrections of four resolution-call
vararg context pointers, resolution-wrapper pointer offsets, 64-bit-only
interpreter pointer loads/stores, stale upper pointer-register bits and an
object-copy callback signature mismatch during instance elaboration. The new
hierarchical counter with externally driven clock failed before these Wasm32
fixes and passes afterward. These are runtime/compiler fixes, not HDL models.

VCD export uses normal scopes and event watches, retains equal-time delta
transitions and disables FST glitch removal. NVC internally retains all nine
`std_logic` states. Digital VCD maps U/X/W/- to x, H to 1, L to 0 and Z to z;
boolean signals export as 0/1. Assertions execute before this export reduction.

## Supported profile and limits

Only standard `08` and the packaged std.08 (`STANDARD`, `TEXTIO`, `ENV`),
ieee.08 (`STD_LOGIC_1164`, `NUMERIC_STD`) and nvc.08 support profile are claimed.
The runtime preserves process variables, waits, signals, drivers, scheduling,
delta cycles, rising edges, resets, inertial/transport transactions and located
assertions in the tested cases. This is not a claim that every VHDL-2008 feature
or library works. Other standards and external libraries/foreign calls remain
unsupported. Signal-free testbenches retain their actual elapsed runtime in
VCD without adding artificial signals or transitions.

Interactive simulation recompiles actual sources and replays confirmed inputs
on each Step. The checkpoint must actually execute and the raw VCD must reach the requested
time; an earlier stop/finish rejects the Step without committing history, even
if the design prints checkpoint-like text. Run/Pause/Step/Reset use the
existing extension/session contracts. Ports must be named top-level std_logic
or std_logic_vector inputs/outputs (width 1 maps to scalar std_logic, larger
widths to vectors); no generics, inout or hierarchical forcing.
A private drain tick is clipped while retaining the verified final timestamp,
including stable recordings. Replay is bounded to 1,000 intervals and grows
more expensive with history; it is not a permanently suspended live kernel.

NVC starts with 64 MiB Wasm memory and permits growth to 512 MiB per job. This
bounds its Wasm heap, not total browser/JS/compiler memory. Runtime writes are
limited to 512 KiB/file and 4 MiB accounted work files. Existing source/result,
log, session and timeout limits apply. Abort/timeout/disposal terminate the
Worker; browser GC determines physical memory reclamation.
The source-built Icarus preprocessor/compiler/runtime each start with 64 MiB
and have a 512 MiB maximum Wasm heap; this is a per-module limit, not a total
job/process memory cap.

## Validation of this candidate

The completed production distribution was served by the GET-only static test
server, without an execution backend. Browser processes and builds ran
sequentially; no served asset changed during the accepted runs.

| Browser | NVC runtime/contract | VHDL lesson/UI round | Verilog regression | Verilog runtime | GHDL synthesis |
| --- | ---: | ---: | ---: | ---: | ---: |
| Chrome 155.0.8059.85 | 30 passed | 72 passed | 72 passed | 4 passed | 23 passed |
| Edge 155.0.4283.62 | 30 passed | 72 passed | 72 passed | 4 passed | 23 passed |

**402 checks passed**, zero page errors. Across the ten final reports, all 5,736
recorded requests were same-origin GETs without bodies or query strings; no HDL sources or
processing requests went to an external service. The server rejects non-GET
methods. Both browsers reported `crossOriginIsolated === false`. Firefox,
Safari/mobile and the updated app integration were not tested here.
A process check during validation found no native GHDL/Icarus/VVP/Yosys process
or identified Node HDL execution service.

The VHDL lesson round covers all 39 VHDL fences in the ten requested families
in pt/en/es: twelve plain teaching sources synthesized independently, twelve
batch requests and fifteen interactive requests. The 27 UI checks cover batch
results, real netlist rendering, Run/Pause/Step/Reset, manual x/z inputs,
inspection and JSON/TXT/VCD/CSV/SVG exports. Additional mixed guards include
novel Verilog sources and authorization/limits. Replacement, navigation and
busy-loop termination use VHDL in that round. Plain teaching fences remain
source presentations; tests compile them separately rather than adding implicit
execution to Markdown.

The 30-case NVC suite adds seven new self-checking testbenches, syntax/assertion
file/line diagnostics, replay of all fifteen interactive lessons, a new x/z
stable buffer, manual clock/reset counter, clock edges and delta propagation
exactly at step endpoints, replay across 10/20/30 us (64-bit time),
premature stop/rollback and real infinite-process
termination. It verifies NUMERIC_STD arithmetic, persistent process variables,
wait on/until/for, event ordering, two/three-driver resolution, all nine internal
std_logic values, boolean export, inertial/transport timing, same-time VCD
transitions, a stable 137 ns trace and a signal-free 133 ns testbench whose
variables survive seven waits. Its actual elapsed time, timeline and VCD/CSV/SVG
exports pass in pt/en/es; assertion errors no longer acquire FST cleanup errors. Repeated stable replay retains 7/12 ns
without invented transitions. Premature stop is rejected even if the design
prints checkpoint text. Main-thread timers remain responsive while a real
VHDL loop runs; abort/timeout leave zero tracked Workers and session quota is
reusable. A screenshot of the Portuguese counter was also inspected visually.

The synthesis round retains its new arithmetic, generic sequential counter,
multi-file package, real Yosys netlist evaluation, diagnostics, renderer and
export checks. This verifies synthesis separately from NVC source simulation.

The four-case Verilog runtime round adds a self-checking clocked counter,
0/1/x/z propagation, malformed-source file/line diagnostics and actual runtime
math: `$sqrt`/`$countones` run on operands changed at 5 and 8 ns. The tests check
those VCD transitions, final values and the genuine stable 19 ns endpoint,
then confirm zero Workers. Both browsers passed the strengthened dynamic-math
version after the full matrix; the final reports contain those latest four cases.

Generated evidence (not committed): `test-results/hdl-browser/vhdl-runtime-*.json`,
`vhdl-chrome.json`, `vhdl-msedge.json`, `chrome.json`, `msedge.json`,
`vhdl-synthesis-*.json`, `verilog-runtime-*.json` and the counter screenshots.
All 32 HDL distribution files were compared byte-for-byte with `assets/hdl/`
and their hashes remained frozen throughout the matrix. The 29 pinned files,
five complete NVC/dependency/Icarus source archive hashes and corresponding
recipe inputs were verified.

The production build passed with its four existing dependency/bundle warnings.
ESLint, TypeScript typecheck, **588 unit tests in 40 suites**, **21 distribution
tests** and package verification (**873 files**, exports/declarations/imports and
corresponding-source entries) also passed. Unit/JSDOM checks are supplementary;
the actual browser matrix above is the execution evidence.

To repeat, complete `npm run build:types` and `npm run build:browser` first,
then run `node test/hdl-browser/vhdl-runtime.mjs`, `node test/hdl-browser/run.mjs`
with `HDL_LANGUAGE=vhdl`, the default Verilog round, and
`node test/hdl-browser/vhdl-synthesis.mjs` and
`node test/hdl-browser/verilog-runtime.mjs` sequentially. Set `HDL_BROWSER` to the
installed browser executable for Edge/another Chromium. Do not rebuild/copy
assets while those tests run. The experimental `nvc-probe.mjs` additionally
requires the private developer build; the accepted public suites use packaged
assets and do not depend on `.hdl-research/`.

The app report now records 77 Chrome development, 77 Chrome static production
and 77 Edge static production checks (231 total) for its previous NVC snapshot.
This continuation does not modify or rerun the app's UI. Its current read-only
preflight (`node ../mathjslab-app/script/verify-hdl-assets.mjs`) passed after the
new package build, confirming the sibling link and new pinned asset hashes.
The new NVC/Icarus files must be recopied and the app revalidated; those 231 checks
do not cover this replacement. The candidate `doc/integration/MarkdownHDLConfiguration.ts` removes the old
simulation guard and uses the authorized extensions directly. Preserve the
app's scheduling/restricted-mode policies and renderer-relative netlistsvg/ELK
helper. Copy the complete rebuilt `dist/browser/hdl/`, including `nvc/`, without
transformation in both development and production, then validate the app again.
The app's existing recursive helper also copies `icarus/RUNTIME-LICENSES.txt`;
no new executor option, policy or API is required for the source-built Icarus.

## Remaining publication gate and app handoff

`npm run verify:hdl:release` now fails only for GHDL's independent source-build
reconstruction. GHDL already synthesizes the tested sources in the browser;
this gate concerns the origin/reconstruction of its Wasm and library assets.
The host has no Docker, and `wsl --status` returns
`WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED`. No Windows feature was installed or
machine restarted. The exact developer prerequisite is a Linux/Docker build
environment for the supplied GNAT 13 / LLVM 16 / AdaWebPack 24.0.0 recipe.
This is developer tooling, not a visitor or runtime service requirement.

That reconstruction must pin the container/apt inputs, normalize the embedded
library `.cf` analysis timestamps as well as archive metadata, compare Wasm
and library bytes from independent clean builds, and rerun browser synthesis
and relevant regressions before changing the GHDL flag. The existing six-source
smoke checks do not prove that reconstruction.

For the app, preserve `file:../mathjslab-markdown`, mathjslab 2.9.0, explicit
authorization and the existing browser executor configuration. After the
completed package build, use its existing raw recursive asset helper and
`script/verify-hdl-assets.mjs` to copy/compare all 32 files in development and
static production, then repeat the app's UI/export/network cases in Chrome
and Edge. Its earlier 231 cases and the current read-only asset preflight
do not replace that new UI round. No commit, push, publication or deploy occurred.
Its `file:../mathjslab-markdown` link and registry mathjslab 2.9.0 need no change.

## Historical first reproduction attempt (superseded by the hardening above)

A separate directory was unpacked from the four packaged source archives.
The first build reached link and exposed an omitted `src/symbols.txt` correction
(`_pollyfil_to_hstring_bit_vec` versus the actual `_polyfill...` implementation).
An audit of every original text source found exactly eighteen modifications;
the complete release patch now captures all eighteen. A new extraction plus
that patch reproduced all 3,286 original text files and the generated symbol
table used by the validated build. The generated symbol
object is built before the driver/archive to avoid the release Makefile's
parallel-target ordering issue. The fresh build was resumed at link after those
corrections, then compiled its actual std/IEEE libraries and MEMFS browser module.
Six self-checking browser probes passed in Chrome and six in Edge against this
separate artifact, with same-origin GET-only traffic and no isolation headers.
Those twelve private build checks are additional to the production matrix.

The generated JS is byte-identical (139,641 bytes, SHA-256
`1312f1ff5780550fc1433f2d6ae0d5e7e9b0cbc72fd8b0214102acb7197b7fb5`).
The new Wasm is 2,668,285 bytes versus 2,668,247; the library archive is 204,056
versus 203,732. The Wasm embeds the different absolute `thirdparty/fstapi.c`
build paths. This is concrete non-reproducibility evidence, not proof that
paths are the only difference. Generated comparison/log evidence is in
`.hdl-research/simulation/clean-recipe-comparison.json`, `clean-recipe-final.log`
and `clean-recipe-resume.log`; browser probe reports record their candidate path.
The already validated distributed artifacts were preserved.

At that stage publication remained blocked: normalize embedded build/source paths and other
variable metadata, run the corrected recipe uninterrupted from fresh inputs,
and independently compare/retest the resulting artifacts. Until that succeeds,
`reproducibleBuildVerified` remained false. A clean source build plus successful
simulation is not a byte-reproducibility claim.
The VeriSim/Icarus complete corresponding port sources, patches, recipe and SDK
version were still missing at that stage; a binary hash is not reproducibility evidence.
No commit, push, package publication or deploy was performed.

---

## Historical synthesis increment (2026-10-18)

The remainder records the previous snapshot. Statements that simulation is
unavailable or that the app still blocks synthesis describe that snapshot only.

# VHDL browser continuation — 2026-10-18

The app integration reported in `../mathjslab-app/doc/application/hdl-validation.md`
is established, including its sibling `file:` dependency and renderer-relative
netlistsvg/ELK resolution. That snapshot is not evidence for subsequent changes.
This continuation changes the Markdown package and supplies an updated integration
candidate; it does not modify the app checkout or its installed mathjslab 2.9.0.

## Historical synthesis implementation

The browser executor now exposes **VHDL-2008 synthesis**, using real GHDL Wasm
analysis/elaboration/synthesis, followed by the existing real YoWASP netlist
pipeline. Compiler sources and intermediate Verilog stay inside the job Worker.
All resources are same-origin static files. No service, credentials, storage
settings, native compiler on the visitor's machine, or COOP/COEP is introduced.

`simulate` and interactive VHDL remain explicitly unavailable. Synthesizing a
circuit and evaluating its combinational netlist is not a VHDL source simulation,
and is not offered as a replacement for testbenches, delays, clocks or delta cycles.
The existing Verilog pipeline is preserved.

The new compiler is [synth-explorer's GHDL frontend](https://github.com/cachanova/synth-explorer/tree/d4dab3def346cb9fdac5bc171d801bd091df72e1/tools/ghdl-wasm),
not the experimental `ortho_wasm` simulation backend. It restores GHDL's actual
`Synthesis.Synth_Design` and Verilog emitter instead of the null synthesis stubs
in ghdl-browser. It includes an Ada binder initialization entry point and
consistent stdio Wasm signatures. This gives a separate working path for
`numeric_std` synthesis; it does **not** establish a fix to that package's
experimental simulation-codegen failures.

Implementation details:

- Fresh GHDL instance and in-memory source/library tree per job, inside the
  existing owned/terminable Worker; Yosys loads only after successful GHDL output.
- Explicit VHDL `08` standard (default); other standards fail before compiling.
- Sources analyzed in request order, with the existing request limits.
- The compiler resolves VHDL names case-insensitively. The pipeline discovers
  the actual module spelling in generated Verilog for case-sensitive Yosys lookup.
- GHDL file/line/column diagnostics survive the public result contract. Source
  location comments become Verilog line directives for Yosys `src` attributes.
- Compiler/library asset SHA-256 checked at runtime, bounded gzip/tar decoding
  (16 MiB decompressed), 512 KiB compiler output budget, existing overall timeout,
  cancellation and session quotas. Compiler heap is not independently capped.

## GHDL synthesis provenance and build path

`assets/hdl/ghdl/` contains the 1,931,378-byte compiler and 451,833-byte library
archive, host bindings, local resource loader and license notices. Compiler and
library hashes match the pinned upstream `SHA256SUMS`:

```text
245664fcd1cbb1200627d9b566e90da3e54188447fabb38b2c9fe469a59eb57e  ghdl-synth.wasm
2cdbaa338e47ad5577549c4eb343891b9de4be1677341eda26ef34802db01da2  libraries.tar.gz
```

The lockfile records all seven new files, extending the prior 14-file inventory.
GHDL is GPL-2.0-or-later; adapted host bindings are Apache-2.0; the IEEE/standard
sources retain their notices in the archive. The GHDL source revision is
`37ad91899ea3f311423eb91e34f42c0ae1948f79` (5.0.1). The port revision is
`d4dab3def346cb9fdac5bc171d801bd091df72e1`. Build scripts, API Ada sources and
patches are archived under `script/hdl/ghdl-synth/` with their upstream layout
and license information in the adjacent README/asset NOTICE.

The available recipe uses an Ubuntu 24.04 Docker build environment with GNAT 13,
Clang/LLVM/LLD 16, AdaWebPack 24.0.0 (archive SHA-256 pinned), the pinned GHDL,
ghdl-browser compatibility stubs and GCC runtime sources. To rebuild, use an
exact checkout of the port revision above and run `tools/ghdl-wasm/build.sh`;
do not run the archived scripts from a different directory layout. This is a
developer build step that produces distributable static files, not a runtime
dependency or an execution backend for visitors.

This Windows host has no Docker or native GNAT/gprbuild environment. Portable
MSYS2/Emscripten was provisioned inside the workspace for NVC and Icarus;
that does not supply the Linux AdaWebPack/GNAT build environment used here.
WSL exists as a launcher but both `wsl --status` and `wsl --list --quiet` return
`WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED`. An independent rebuild therefore needs
a developer Linux/Docker environment with those tools, or a provisioned WSL
environment. No Windows optional feature was installed or machine restarted.
The container base tag/apt packages are not pinned by digest/version, so the
recipe itself is not proof of bit-identical source-to-binary reproducibility.
The lock records `reproducibleBuildVerified: false`.

## Historical simulation investigation (superseded by NVC above)

The current ghdl-browser and ghdl-wasm revisions are unchanged from the earlier
audit. The browser repository has no releases or Actions artifacts containing
a compiler. Its example runtime does not implement faithful simulation:

- `__ghdl_create_signal_e8` stores a zero value without decoding its initial data.
- Driver/port read functions return zero; sensitivity registration does nothing.
- Wait timeout advances a global time variable rather than queueing a suspended
  process; the harness repeatedly calls every process. This cannot validate
  process suspension/resumption, ordering, signal events or delta cycles.
- The translator source documents frame-persisted suspend states, but the host
  example does not provide a complete scheduler/driver ABI to execute them.
- Synthesis stubs return `null`/`No_Module`; the new synthesis frontend replaces
  those stubs, not the unfinished simulation runtime.

These findings come from the pinned `scripts/ghdl_runsim.mjs`,
`stubs/synthesis.adb`, `stubs/ghdlsynth.adb` and `trans-chap8.adb`. They are not
simulation failures reproduced with a browser compiler in this continuation.
There is no claim of working VHDL process/signal simulation.

The advertised live VHDLive page currently embeds a Railway app. Its inspected
JavaScript issues POST `/compile`, `/simulate` and `/rtl-schematic` with source
files and includes a server fallback. No HDL sources were sent there; only
public HTML/JS were downloaded for inspection. That implementation is not a
solution for the required static architecture.

[NVC's Wasm port](https://github.com/UnsignedChad/nvc-wasm/tree/f70812b537986ac2ff1e950b75ed41b5864a87c1)
offers a different promising bytecode-interpreter route. Its current recipe
uses Emscripten pthreads/SharedArrayBuffer and Node raw filesystem access, and
the inspected tree has no distributable compiler/library assets. A browser
MEMFS build plus worker transport and library packaging is needed; existing
pthreads require cross-origin isolation. Removing that hosting requirement
would need a separately validated single-thread port, not just a loader flag.
The public libfpga repository inspected here did not provide a usable NVC
source/build artifact tree. No unlicensed/opaque website binary was integrated.

## Historical VeriSim release blocker (replaced by source-built Icarus above)

The previous downloaded VeriSim snapshot was `b4a67720b11f1f80aa68c1d79dc66980a060017f`.
A fresh 2026-10-19 API audit of commit
`5f2edda03fcf31f5c5e4298dc2cb852feaea8206` returned a complete, non-truncated
21-file tree, still without compiler C/C++ sources, port patches or build recipes. Its three Wasm
modules have no `producers` custom section identifying the Emscripten release.
The upstream source pointer alone does not supply the described static loader,
VPI and code-generator modifications. Obtain the exact corresponding source,
patches, flags and Emscripten SDK version from the producer, then rebuild and
compare/test before publishing. No message was sent to a maintainer and no
source-to-binary verification is claimed for those downloaded binaries. The
full upstream reference resolves to `c7530dbcc186de2f21eacde14fd28061b885924c`;
its source archive SHA-256 is
`323acb25d721492c9be6b945d863dfd925bfc29c0f2ba218ac09b09bd629925b`.
Those downloaded binaries have now been replaced by the independently built
static-loader port documented above. Their missing source is not used as
evidence for the new artifacts.

## Historical app integration consequence (synthesis-only snapshot)

At this historical stage, the installed app module replaced **all** `vhdl-*` renderers with
unavailability messages. It will therefore keep blocking synthesis until that
guard is updated, even after rebuilding the linked package. The updated
`doc/integration/MarkdownHDLConfiguration.ts` delegates VHDL synthesis to the
authorized real extension while keeping simulation/live fences visibly blocked.
It retains the renderer's disposal handler. It can be applied without changing
the app's netlistsvg/ELK helper or its mathjslab dependency.

Stop browser/dev-server validation before rebuilding the package; wait for a
stable build, recopy the entire assets directory via the existing app build,
then run app tests. The prior app snapshot is historical evidence only.

## Historical validation of the synthesis increment

The dedicated `test/hdl-browser/vhdl-synthesis.mjs` uses the real packaged
browser executor and production renderer against the GET-only static server.
Results are recorded separately from Verilog regressions and from historical
app validation. Executed against the completed production distribution:

| Browser | New VHDL synthesis checks | Result |
| --- | ---: | --- |
| Chrome 155.0.8059.82 | 23 | passed |
| Edge 155.0.4283.62 | 23 | passed |

These checks include the mux/adder synthesis fences and actual SVG renderer
and SVG exports in pt/en/es, the twelve plain VHDL teaching sources synthesized
independently, and new sources: mixed-case arithmetic using `resize`,
`to_unsigned` and addition; a two-file package; and a generic five-bit clocked
counter with actual storage cells. Arithmetic output was additionally checked
by executing real Yosys `eval` on the generated netlist. This is combinational
netlist verification, not a claim of VHDL simulation. Syntax and semantic errors
retain the original filename/line. Other VHDL standards and simulation requests
are rejected explicitly. Every completed job left zero tracked Workers.

Both runs recorded only same-origin GET requests without bodies against the
GET-only static server, with no page errors. There was no execution backend,
CDN, COOP/COEP or cross-origin isolation. Evidence is in
`test-results/hdl-browser/vhdl-synthesis-chrome.json` and
`test-results/hdl-browser/vhdl-synthesis-msedge.json` (generated, untracked).

An initial run passed 18 sources but exposed a case mismatch between VHDL top
lookup and the generated Verilog module spelling. The implementation was fixed,
the production distribution rebuilt, and both complete 23-check runs above
passed afterward. Builds and browser runs were sequential; no distribution
files were changed during browser validation. Firefox/Safari/mobile and the
updated app integration have not been tested in this continuation.

The unchanged Verilog/browser regression suite was rerun afterward against
that same distribution: **72 passed in Chrome and 72 in Edge**, including the
ten lesson families in pt/en/es, UI controls, exports, new Verilog sources,
stable recording duration, replay, timeout/cancellation/replacement/navigation
and four-state values. Both network traces again contained only same-origin
GET requests without bodies. These are package-level runs, not a rerun of the
mathjslab-app dev/production integration.

Additional checks passed: 586 unit tests (40 suites), 21 distribution tests,
typecheck, ESLint and verification of all 21 pinned assets. The production
build passed with the existing dependency and bundle-size warnings. Package
verification passed (831 files); the package includes the archived GHDL build inputs and
integration candidate as well as the complete static HDL asset tree. No native
VHDL run is counted as browser evidence. No commit, push, publication or deploy
was performed. At that historical stage, full VHDL simulation/interactivity
acceptance remained unmet; the current NVC evidence is recorded above.
