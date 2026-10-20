# Third-party HDL assets

These tool assets are separate from the package's MIT TypeScript integration.
Icarus modules are GPL-2.0-or-later; retain icarus/COPYING and
icarus/RUNTIME-LICENSES.txt. Yosys and
YoWASP package metadata identify ISC; retain yosys/COPYING. The checked-in
lockfile records exact versions, byte counts and SHA-256 hashes.

Icarus is now built from official commit
c7530dbcc186de2f21eacde14fd28061b885924c with Emscripten 6.0.12 and the MathJSLab
static target/VPI adaptation. Complete sources, dated patches, generated
bootstrap inputs, runtime notices and recipe are distributed under
script/hdl/icarus-browser/. All six JS/Wasm artifacts match across two independent
Windows/MSYS2 build roots; reproduction.json records the exact method and scope,
including the same pinned SDK/cache and final comment-only rebuilds. This is
not a cross-platform or cross-machine claim. These files replace the VeriSim
download whose complete port sources were unavailable. No publication occurred.

GHDL VHDL-2008 synthesis is additionally shipped under ghdl/: the compiler is
GPL-2.0-or-later, host bindings adapted from synth-explorer are Apache-2.0, and
standard/IEEE sources retain the notices inside libraries.tar.gz. See
ghdl/NOTICE.md, ghdl/COPYING and ghdl/APACHE-2.0 for sources, build inputs and
limits. This frontend provides synthesis, not VHDL simulation. Its compiler and
libraries now match across two clean Linux/amd64 caches with a pinned Ubuntu
digest, complete package-version closure and downloaded .deb hashes. See the
executed scope and source pins in script/hdl/ghdl-synth/reproduction.json.

NVC 1.22.0 simulation is shipped under nvc/ (GPL-3.0-or-later). It was built
locally with Emscripten 6.0.12 using the real interpreter and runtime. Complete
NVC/dependency source archives, adapted patches and build recipe are included
under script/hdl/nvc-browser/. See nvc/NOTICE.md and nvc/COPYING for license,
runtime/export changes and limits. No shared-memory hosting headers are needed.
NVC JS/Wasm/libraries were byte-identical across two independent Windows build
roots; the executed scope and method are in its reproduction.json. The separate
GHDL build is now reconstructed in the pinned Linux CI environment described
above. No toolchain-from-source or cross-platform reproduction is claimed.
