> Historical native-tool audit. For current static-browser work, actual browser results and pending VHDL/release blockers, see [browser HDL results](hdl-browser-results.md). Native success is not browser compatibility.

# HDL example audit results

Audit date: 2026-10-18. Package under investigation: mathjslab-markdown 0.6.0.
Application inspected: mathjslab-app using an installed 0.6.0 package.

## Diagnosis

1. The app disables native-backed execution in production and has no enabled
   development executor until sessionStorage is configured and the page
   reloaded.
2. Published 0.6.0 does not recognize executable fences in full profiles
   without explicitly registered HDL extensions, so code could appear without
   an actionable execution diagnostic. This is corrected locally.
3. Tools were absent from PATH and the old portable cache in this session. The
   initial real test run failed with spawn ENOENT, not HDL compiler errors. The
   pinned portable tools were restored and both archive SHA-256 values
   verified.
4. The installed app copy is not linked to this repository. Local package fixes
   do not automatically change that app copy.
5. The replay documentation incorrectly said inputs did not cause
   recompilation. The native adapter recompiles and replays confirmed history
   on every Step.

6. The expanded real-tool audit reproduced a native replay defect: clipping
   Icarus's private drain tick removed the duration of stable traces. Verilog
   scripted checks had correct values but their first recording ended at tick
   zero. The corrected adapter appends the already verified checkpoint
   timestamp when needed; no value changes are manufactured. The three failing
   translated script cases and the complete inventory now pass.

## Toolchain and final real-tool result

Windows x64, GHDL 6.0.0, Icarus Verilog/VVP 14.0 development
(s20260301-585-gf190dbb26-dirty), Yosys 0.70+157. All four tools reported
available. The portable profile is pinned in `script/prepare-hdl-tools.mjs`; no
simulator models substitute for these compiler executions.

`node --test --test-timeout=120000 test/hdl/*.test.mjs`: **69 passed, zero
failed, zero skipped**. The final inventory assertion verified exactly 24
source-only fences, 24 batch requests and 30 interactive requests. The first
run before tool preparation failed with ENOENT. The next run exposed three
translated stable-VCD failures; all passed after the checkpoint correction.

## Executed inventory

| Lesson (same filenames in pt/en/es) | Requests across three languages | Validation                                                            |
| ----------------------------------- | ------------------------------: | --------------------------------------------------------------------- |
| codigo-hdl.md                       |           24 source-only fences | Separate real compilation/synthesis; the UI remains presentation only |
| hdl-porta-and.md                    |             6 batch simulations | VCD and expected AND output                                           |
| hdl-contador.md                     |             6 batch simulations | Testbench compiles and generates VCD                                  |
| hdl-multiplexador.md                |                     6 syntheses | Yosys netlist ports/cells                                             |
| hdl-somador.md                      |                     6 syntheses | Yosys netlist ports/cells                                             |
| hdl-live-and.md                     |          6 interactive requests | Input changes and replay checkpoints                                  |
| hdl-live-mux.md                     |          6 interactive requests | Selected output 1010 and retained history                             |
| hdl-live-counter.md                 |          6 interactive requests | Reset 0000, then 0001 and 0010, fresh session reset                   |
| hdl-live-register.md                |          6 interactive requests | Initial 0101 retained while enable is low                             |
| hdl-stimuli-checks.md               |          6 interactive requests | Scripted checks at 7 and 12 ns                                        |

The inventory totals 78 fences: 24 source-only, 24 batch and 30 interactive.
Every executable lesson has a VHDL-2008 (`08`) and Verilog/SystemVerilog
(`2012`) variant in each language. No source-body changes were needed during
inspection; example changes clarify prerequisites and presentation-only fences.

## Corrections and reproduction

- Full-profile fallback handlers report missing executors without granting
  execution or drawing usable simulation controls.
- Optional discovery runs after authorization within the acquisition deadline;
  unavailable tools prevent compiler session creation.
- Capability queries share host scheduling and cancellation on HTTP disconnect.
- HTTP errors explain service reachability, token, Origin/CORS and wrong base
  endpoints instead of showing only generic fetch/JSON errors.
- Preserve real replay time in stable recordings after removing the private
  drain tick, including the first interactive diagram. Assert exact VCD end
  timestamps and absence of invented signal transitions.
- Actual HTTP tests verified permitted OPTIONS/Origin headers, denied Origin
  without Access-Control-Allow-Origin, missing-token 401, capability discovery,
  compiler diagnostics with source locations, changed-source behavior, four
  states, clock-boundary history, observer failure rollback, timeouts and
  cleanup.
- Actual compiler-backed DOM controls exercised Run, Pause (including waiting
  for an in-flight Step), manual input changes, Step, Reset and fresh
  sequential state. Scripted checks passed at 7 and 12 ns in both languages and
  all locales.
- The engine regression run passed 585 tests and initially found one
  report-link failure while this document was being created. After completion,
  all 23 tests in ExampleCollections.spec.ts passed, covering the repaired link
  and all three translated indexes. Ten new availability/app-candidate cases
  are included in the 586-case engine inventory. The app's existing five
  configuration tests passed; the replacement module also passed strict
  standalone type checking.

Run `npm run test:hdl:real`. The final inventory assertion requires all 78
fences without silent tool skips. Run `npm run test:unit` and the production
distribution suite for policies, disabled UI, rendering and lifecycle checks.
See [setup and app integration](extensions/hdl-troubleshooting.md) and the
[drop-in app module](integration/MarkdownHDLConfiguration.ts).

## Application work and remaining limits

The app repository was inspected but not modified because it is outside the
writable workspace. Apply the provided replacement module, update its disabled
configuration tests to expect diagnostic-only extensions, and rebuild/reload
the app. Use the corrected package through an explicitly configured local
dependency or a later package update; no npm version was published by this
task.

Real tool/backend tests execute native compilers. JSDOM tests use actual HTTP
and compiler results but do not constitute a browser-private-network/CSP/HTTPS
test. The actual deployed app, its production reverse proxy and browser
permissions still need manual validation. No production service or WASM
compiler is supplied. The local shared-token service must not become a public
untrusted-code backend by removing the development guard. Existing four Webpack
warnings are unrelated.

## Final distribution checks

- All 21 production distribution tests passed, including unavailable
  full-profile fences, override registration, browser/native separation and
  HTTP incremental rendering with capability discovery.
- Lint, declaration generation, app type checking, standalone strict candidate
  type checking and the production build passed. The build retained the four
  existing dependency/bundle-size warnings.
- Package verification passed for the locally corrected 0.6.0 distribution: 786
  files, complete exports/declarations and relative imports, no compiler
  executables or development cache in the npm package.
- No tool remained unavailable in this Windows test profile after preparation.
  No commit, push, npm publication or production service deployment was
  performed.

Example edits are prerequisite/presentation explanations in `codigo-hdl.md` and
all nine `hdl-*.md` lesson families, in each of pt/en/es (30 files). Filenames
and collection counts remain unchanged; existing indexes remain valid. Remote
GitHub lessons need those updated texts synchronized separately by the
maintainer.
