# NVC browser simulation port

NVC 1.22.0, GPL-3.0-or-later (COPYING), official complete source:
https://github.com/nickg/nvc/releases/download/r1.22.0/nvc-1.22.0.tar.gz

Port derived from UnsignedChad/nvc-wasm f70812b537986ac2ff1e950b75ed41b5864a87c1:
https://github.com/UnsignedChad/nvc-wasm/tree/f70812b537986ac2ff1e950b75ed41b5864a87c1
This binary is built locally, not copied from a hosted simulator.

Complete NVC, zstd 1.5.6, libffi 3.4.6 and zlib 1.3.2 source archives,
adapted patches and build instructions are distributed in the package under
script/hdl/nvc-browser/. Source headers retain the IEEE/standard library and
third-party FST/LZ4/FastLZ/SHA notices. NVC uses zstd's BSD option and the
libffi headers/trap stubs for disabled foreign calls; no user VHPI/FFI support.
Emscripten libc/runtime licensing is retained in EMSCRIPTEN-LICENSE. Integration
host bindings in frontend.mjs are separate MIT code.

SDK: Emscripten 6.0.12, commit 5488e0871d46d19a3209988190fa6a653126256f;
emsdk 3b3963d86a5c97adaf6eaa845cdfe0b811c2f960; release
6e9f6885cb17a3d6c8fd488a5cff730f50aba61d. Full pins/hashes: sources.lock.json.

Changes: real bytecode interpreter and model runtime; static internal symbol
table, no dynamic libraries/JIT; serial native NVC work queues; MEMFS instead
of NODERAWFS; Wasm32 pointer-sized interpreter loads/stores, zero-extended pointer registers,
resolution-wrapper offsets and variadic context-pointer fixes; matching void
object-copy callbacks for instance elaboration.
VCD: ordinary digital scopes, boolean false/true as 0/1, std_logic H/L as 1/0,
U/W/- as x, X as x and Z as z. All nine values remain in the simulator.
Event watches and disabled FST glitch removal preserve same-time transitions.
Signal-free VCD records the real model endpoint without fabricated variables.
Developer builds normalize compiler paths and serialized standard-library paths.
Only the packaged std.08/IEEE std_logic_1164/numeric_std library profile is
claimed; not every VHDL-2008 package/feature. Simulation libraries contain code,
not recordings or fixture answers. No synthesis-to-simulation replacement.

The compiler module has a 64 MiB initial/512 MiB maximum Wasm heap, is
single-threaded inside a job Worker and does not need SharedArrayBuffer or
COOP/COEP. Cancellation/timeout terminates that Worker. Private files, logs,
source/result sizes and sessions are bounded by the integration.

Two independent build directories produced byte-identical JS, Wasm and compiled
library archives; one ran the final recipe uninterrupted, the other rebuilt its
final util.c correction and libraries. All 3,298 original source files matched.
See script/hdl/nvc-browser/reproduction.json for scope, tools and artifact hashes.
This is Windows/MSYS2 root independence, not a cross-platform claim. Icarus/GHDL
source/build publication blocks remain separate and unresolved.
