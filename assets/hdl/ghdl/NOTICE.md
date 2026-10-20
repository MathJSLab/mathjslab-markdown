# GHDL browser synthesis assets

Compiler: GHDL 5.0.1, commit 37ad91899ea3f311423eb91e34f42c0ae1948f79,
GPL-2.0-or-later (see COPYING). The packaged standard/IEEE libraries retain
their source notices within libraries.tar.gz.

Port and frontend host bindings adapted from cachanova/synth-explorer, commit
d4dab3def346cb9fdac5bc171d801bd091df72e1, Apache-2.0 (see APACHE-2.0):
https://github.com/cachanova/synth-explorer/tree/d4dab3def346cb9fdac5bc171d801bd091df72e1/tools/ghdl-wasm
https://github.com/cachanova/synth-explorer/blob/d4dab3def346cb9fdac5bc171d801bd091df72e1/web/src/workers/ghdl.worker.ts

Adaptations: application-owned Worker protocol, same-origin relative assets,
SHA-256 verification, bounded decompression/output and in-memory file loading.
No compiler algorithm, HDL parser or circuit model is implemented in JS.

Build inputs: AdaWebPack 24.0.0 archive SHA-256
8edaae8b9987a20aec430d750f30033f12f953ce2b6437afb87fbf8cc1063796; ghdl-browser
e98e5a6c6fd6c48a789705ae9900c6b34b3cb414; GCC runtime
ed10445fe222d3973ae13eda9bf211f315c5e3f9. The archived recipe in
script/hdl/ghdl-synth/ uses an Ubuntu 24.04 build container with GNAT and
LLVM/Clang/LLD 16. Its paths now target this package under
script/hdl/ghdl-synth/, with isolated candidate outputs and complete smoke fixtures.
This recipe is for package
developers, never a service required by visitors. The full upstream sources are
available at the pinned repositories above.

We obtained the published upstream assets and verified their SHA256SUMS. An
independent rebuild has not been performed here: Docker is absent and WSL
reports WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED on this Windows host. Do not
equate the asset hashes with verified source-to-binary reproducibility.

This frontend exposes synthesis only, VHDL-2008. It does not contain a GRT
simulation scheduler. The separate NVC module provides VHDL simulation/replay;
no service fallback or synthesized circuit model replaces VHDL semantics.
