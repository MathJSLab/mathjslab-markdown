# GHDL WebAssembly build

This directory contains the pinned GHDL build recipe used for browser-local
VHDL synthesis. It builds a small WebAssembly module around GHDL's analysis,
elaboration, and synthesis kernel; the module emits generic Verilog, which the
application passes to its separately pinned Yosys worker.

The production pipeline is:

```text
VHDL-2008
  -> ghdl-synth.wasm
  -> generic Verilog with VHDL location comments
  -> `line source-location rewrite
  -> yosys.wasm
  -> source and mapped JSON netlists
  -> analysis.wasm
```

Keeping GHDL and Yosys in separate workers avoids reconciling AdaWebPack's Ada
runtime with WASI libc and leaves the project-owned Yosys build unchanged.

## Pinned inputs

- GHDL 5.0.1 commit `37ad91899ea3f311423eb91e34f42c0ae1948f79`
- AdaWebPack 24.0.0 release archive, verified by SHA-256
- ghdl-browser commit `e98e5a6c6fd6c48a789705ae9900c6b34b3cb414`
- GCC 14.1.0 commit `ed10445fe222d3973ae13eda9bf211f315c5e3f9`
- Ubuntu 24.04 with LLVM/Clang/LLD 16 in the build container

ghdl-browser provides the wasm runtime stubs and frontend compatibility
patches. The build removes its simulation-only WAT backend and restores GHDL's
real synthesis implementation. A native build of the same GHDL commit produces
the analyzed `std` and `ieee` libraries shipped beside the module.

## Build

For a Windows development machine without Docker/WSL, use the Linux GitHub
Actions workflow and npm commands in [the CI guide](../../../doc/hdl-github-actions.md).
The first build can be triggered by pushing the dedicated build branch; it does
not require merging unvalidated changes into main or publishing the package.

Docker and network access to the pinned upstream repositories are required.
From the repository root:

```bash
bash script/hdl/ghdl-synth/build.sh
```

The first run builds native GHDL and populates `.cache/ghdl-wasm`; later runs
reuse that cache. Outputs are written to `.hdl-research/ghdl-build-output/`:

- `ghdl-synth.wasm`
- `libraries.tar.gz`
- `SHA256SUMS`

Override the cache or output directory with `GHDL_WASM_CACHE_DIR` and
`GHDL_WASM_OUTPUT_DIR`. Override build parallelism with `GHDL_WASM_JOBS`.

The linker exports only memory allocation, binder initialization, and the
three synthesis API functions. Undefined host functions are a reviewed set of
filesystem, stdio, and math imports implemented by
`assets/hdl/ghdl/frontend.mjs`.

## Smoke tests

The repository suite exercises the production module and packaged
standard-library tree without a browser:

```bash
bash script/hdl/ghdl-synth/test.sh
```

By default the suite tests the candidate build directory above. To test the
packaged artifacts, set `GHDL_WASM_OUTPUT_DIR="$PWD/assets/hdl/ghdl"`.
The suite extracts the selected `libraries.tar.gz` to a temporary directory,
then checks successful synthesis and provenance for simple combinational logic,
`ieee.numeric_std`, a generic counter, and an FSM. It also verifies stable
syntax and semantic failure diagnostics. These Node smoke tests do not replace `test/hdl-browser/vhdl-synthesis.mjs`,
which executes the packaged Worker in a real browser on static hosting.
The first two Linux CI executions reconstructed matching Wasm and passed all
smoke tests, but detected library timestamp differences (see below). Ubuntu
packages and the container base still need digest/snapshot pinning.

## Runtime contract

- Sources are analyzed as VHDL-2008.
- The top entity is required and is matched case-insensitively.
- Files are analyzed in workspace order, so packages must precede units that
  use them.
- A workspace is either VHDL or Verilog/SystemVerilog. Mixed-language
  elaboration is not supported by this two-module architecture.
- GHDL diagnostics are returned before Yosys runs.
- GHDL's `/* file:line:column */` comments are converted to Verilog `` `line ``
  directives. Yosys then emits native `src` attributes pointing to the
  original VHDL file and line. Generated-Verilog columns are not meaningful.

The custom binder step is required: without it, Ada package elaboration does
not run and synthesis tables remain zero-initialized. The `Grt.Stdio` patch
also gives `fputc`, `fflush`, and `fclose` one WebAssembly ABI each; native C
permits ignoring a return value, but WebAssembly rejects conflicting function
signatures.

The Verilog emitter patch writes declarations for GHDL black-box modules.
Upstream tracks those interfaces internally but otherwise omits their module
declarations, leaving the generated top with unresolved cells when Yosys runs.

After rebuilding, compare the candidate artifacts against an independent clean
build, then validate them with the real browser suites before replacing assets.
Update `assets/hdl/ghdl/frontend.mjs` integrity values and
`assets/hdl/toolchain.lock.json` only for the validated replacement.
The default output is isolated from published assets. No build script publishes
a package or changes the application's copy automatically.

## Remaining reproduction evidence

The first two Linux CI runs on 2026-10-20 each completed both clean builds and
all six smoke tests per candidate. The Wasm matched exactly
(`245664fcd1cbb1200627d9b566e90da3e54188447fabb38b2c9fe469a59eb57e`),
but byte comparison correctly failed for the libraries archive. Inspection of
run `39474875268` showed differences only in analysis timestamps in the six
std/ieee catalogs; all source files and other catalog fields were identical.

`pack-libraries.py` now canonicalizes timestamps by chronological rank **within
each independent language edition**, preserving strict order and equalities
across that edition's std/ieee catalogs. Parallel builds can interleave v87/v93
analysis differently, so their unrelated timestamps must not affect v08 ranks.
The canonical epoch is 2010-01-01, after the implicit `std.standard` timestamp
`20020601000000.000` in pinned GHDL's `src/vhdl/vhdl-std_package.adb`.
GHDL's `Vhdl.Sem_Lib.Check_Obsolete_Dependence` uses strict timestamp comparison:
replacing every timestamp with a constant or choosing an earlier epoch would
be incorrect. Checksums, source locations, unit dates and source bytes remain
unchanged. The original build tree is not modified; a metadata report records
the original and normalized catalog hashes beside each candidate archive.

Applying this packer locally to the two actual CI candidates produced identical
archives and passed the six Wasm smoke tests. The corrected Linux recipe then
passed run `39477964053`: both clean caches, all smoke tests and byte comparison
of both final artifacts. The Linux library archive SHA-256 is
`e67ca499db3ae429c382b1cc5c91775eb292918e2f7008daee29a995c6f2874a`.
Container/package input pinning, candidate review and real browser validation
are still required before any reproducibility flag or packaged asset changes.
