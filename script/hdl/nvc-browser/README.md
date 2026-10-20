# NVC Wasm build inputs

The active recipe is `build.sh` + `release-wasm.patch` against the **official
NVC 1.22.0 release tarball**. All four complete source archives are included in
`sources/` and checked against `sources.lock.json`. Original copyright/license
headers are retained. `upstream-wasm.patch` and `single-thread.patch` preserve
the earlier port/development-revision investigation; do not apply them on top
of the active release patch.

Activate the pinned Emscripten **6.0.12** SDK, then provide bash, make, patch,
flex/bison, pkg-config, a Python with `tarfile` data filters (3.12+) and native
build utilities. Run `bash script/hdl/nvc-browser/build.sh <new-build-directory>`.
The script intentionally starts from fresh sources; use a new directory.
Emscripten's zlib port may download the SDK-pinned zlib source on first use;
its exact source is also archived here. Compiler tools are for developers,
never installed or run on visitors' machines.

SDK 6.0.12 ships `upstream/bin/llvm-nm` (`llvm-nm.exe` on Windows), not
`emnm.py`. If the activated shell has no `emnm` command, provide a developer
wrapper named `emnm` that executes that SDK binary. The initial Windows helper
used in the recorded two-root builds emitted failed nm-probe warnings; their
actual compiler/runtime results and artifact equality were checked independently.
This detail is part of the recorded host scope, not a universal setup claim.

The executed builds used portable Windows MSYS2, explicit wrappers calling the
Windows SDK Python's emcc.py/emar.py/emranlib.py, GNU Make 4.4.1, flex 2.6.4,
bison 3.8.2 and Python 3.13.3. The bootstrap driver used host Node 26.7.0;
the SDK's own tools use its pinned Node 24.19.0. No Docker/WSL, Windows optional
features or global tools were installed. Initialize the SDK shell/wrappers
explicitly; do not rely on the WindowsApps python3 alias.

The recipe fixes SOURCE_DATE_EPOCH, TZ/locale and maps compiler source paths.
The release patch also makes --relative portable for the Windows NODERAWFS
bootstrap, without changing visitor MEMFS paths. Build in two separate new
directories, then run:

```bash
python3 script/hdl/nvc-browser/compare-builds.py <first-root> <second-root>
```

`reproduction.json` records the executed comparison. Build A was fresh, then
rebuilt util.c after its final path correction and recompiled all libraries.
Build B ran the final recipe uninterrupted from fresh archived sources. All
3,298 original source files and the generated symbol table matched, and JS,
Wasm and library archives were byte-identical. Seven real browser probes passed
in Chrome and Edge against each final candidate. This verifies separate roots
on this Windows host, not arbitrary platforms or machines. The release tarball
avoids Autotools; historical development-revision Perl/M4 bootstrap attempts
are not part of this recipe. --disable-llvm selects the actual interpreter.

The Node/NODERAWFS executable exists **only to bootstrap real std/IEEE libraries**.
The final browser link explicitly uses `web,worker`, MEMFS, no pthread flags,
no dynamic JS execution and a 512 MiB maximum heap. Native NVC serial queues
execute all work; no replacement scheduler or circuit model exists. The port
retains its disabled-foreign-call libffi trap stubs, not a fake HDL evaluator.

The additional runtime correction passes closure context **pointers**, rather
than 8-byte scalar unions, through four resolution vararg calls. Their layouts
differ on Wasm32. A real browser test exposed incorrect `std_logic` resolution
before this fix. A second Wasm32 correction replaces hard-coded 64-bit offsets when reading
the packed resolution wrapper with offsets matching the generated native-pointer
layout. A hierarchical counter with an externally driven clock exposed this
independently of replay. The interpreter now selects pointer-sized load/store
operations and zero-extends pointer register writes on Wasm32, instead of
retaining the upstream 64-bit-host assumptions. The object-copy callback also returns void consistently
with the tree/type copy callbacks, avoiding a Wasm indirect-call type mismatch
during instance elaboration. Waveform changes affect export only: four-state digital VCD,
boolean 0/1, normal scopes, event watches and no FST equal-time glitch removal.
Signal-free testbenches export the real runtime endpoint directly as empty VCD
definitions, because FST has no readable value section without variables.
Assertions still execute against the full nine-state values inside NVC.

The 1.22 release patch also corrects the obsolete `_pollyfil_to_hstring_bit_vec`
entry in `src/symbols.txt` to match the actual `_polyfill_to_hstring_bit_vec`
implementation. The generated symbol object is compiled before linking the
archive/driver, avoiding a parallel-target ordering race with the release
Makefile. These two issues were exposed by the fresh-source recipe attempt.

Browser probes do not prove complete language coverage. The two-root NVC
reproduction evidence does not verify Icarus or GHDL. Their corresponding-source
and/or independent-build publication blockers remain in force. Normal publication
is guarded by `npm run verify:hdl:release`. No publication was performed.
