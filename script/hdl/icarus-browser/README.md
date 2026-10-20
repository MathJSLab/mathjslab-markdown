# Icarus browser source-build candidate

This recipe builds the real Icarus preprocessor, compiler with its VVP target,
and VVP simulator into three Emscripten modules. It does not substitute circuit
models or execute a compiler on a visitor's server. Compilation and simulation
use MEMFS in the application's terminable browser Worker.

The first candidate passed four novel-source probes and the 72-case Verilog
suite in Chrome 155.0.8059.85 and Edge 155.0.4283.62 on 2026-10-20 (144 regression
cases plus eight initial probes). All six artifacts are now byte-identical
across two independent Windows/MSYS2 source/build roots, and have replaced
the downloaded VeriSim binaries in the candidate distribution. The final frozen
production-browser matrix passed 402 cases in Chrome and Edge, with 5,736
same-origin GETs, no request bodies/query strings and zero page errors.
GHDL's release gate remains active.

## Complete inputs and developer build

`sources/iverilog-c7530db.tar.gz` is the complete official upstream archive at
`c7530dbcc186de2f21eacde14fd28061b885924c`. It includes COPYING, individual-file
copyright notices and the original Autoconf/gperf sources. `browser.patch`
contains the browser adaptation. `sources.lock.json` pins every source/bootstrap
input and Emscripten 6.0.12's SDK, release and compiler commits.

Activate that SDK and provide make 4.4.1, flex 2.6.4, bison 3.8.2, patch, Python
3.13.3 and a host C compiler (`BUILD_CC`, default gcc). Then run from the repo:

```sh
bash script/hdl/icarus-browser/build.sh /absolute/path/to/new-empty-build
```

The recipe refuses to reuse a nonempty directory. It
produces `browser/icarus/{ivlpp,ivl,vvp}.{js,wasm}` without replacing assets.
Emscripten may populate its standard-library/port cache on first use. For an
offline developer build, prime that cache first. Its pinned zlib 1.3.2 archive
matches `../nvc-browser/sources/zlib-1.3.2.tar.gz` byte for byte (including the
SDK port's SHA-512); that complete archive is also included in this package.
Native developer tools are used only to prepare static files, never required
of visitors. A host `draw_tt` generator is compiled separately from the Wasm
targets to avoid upstream's leakage of target flags into host compilation.

`bootstrap/` contains generated configure and keyword files, like a normal
Autotools source distribution. Their original inputs remain in the archive;
the exact Autoconf 2.71/gperf 3.3 regeneration commands are recorded in the lock.
The checked-in generated inputs avoid requiring Autoconf/Perl/gperf merely to
rebuild Wasm. The initial Windows bootstrap used Git for Windows Perl and MSYS2
Autoconf; its local autom4te path wrapper is not needed by this recipe.

## Port scope and publication gate

The original VVP code generator and the original system, v2005_math, va_math,
and v2009 VPI startup tables are statically linked, replacing native dlopen.
The compiler retains upstream's compiler-only VPI metadata inspection API;
the simulator executes the genuine registered callbacks. Foreign VPI modules
are rejected explicitly. Web Workers run without pthreads or COOP/COEP, with
a 64 MiB initial heap and a 512 MiB maximum per module.

The existing digital VCD importer accepts 0/1/x/z and integer variables; it
currently rejects real-valued VCD variables. Real mathematical functions can
execute when the recording contains only supported digital variables. This
does not claim full SystemVerilog coverage or analog waveform support.

Do not clear release flags on the basis of compilation alone. Compare all six
artifact bytes across independent clean roots, validate the actual candidate
in Chrome and Edge against static files, then update notices, integrity locks
and regression results together. The GHDL independent-build gate is separate.

`reproduction.json` records the executed scope: A is the development build with
path normalization corrected; C ran the complete recipe from fresh archived
inputs, then both roots rebuilt the same-line dated source modification notices.
Those notices preserved line numbers and did not change any artifact bytes.
All 6,102 original source files and four generated bootstrap/version files match.
The proof uses the same pinned SDK/cache on one Windows host; it does not claim
independent compiler-cache, cross-platform or cross-machine reconstruction.

Icarus is GPL-2.0-or-later, with individual-file licenses and bundled third-party
notices preserved in the complete archive. The adaptation preserves those
licenses; it is not covered by the Markdown package's MIT license.
`RUNTIME-LICENSES.txt` retains Emscripten, musl, libc++, libc++abi, compiler-rt
and zlib notices for the generated runtime. Keep it with the static assets.
