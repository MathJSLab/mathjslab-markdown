#!/bin/bash
# Developer tooling only; visitors use the resulting static Wasm in Workers.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
WORK=$(realpath -m "${1:-$PWD/.hdl-research/icarus-clean}")
PYTHON=${EMSDK_PYTHON:-python3}
export TZ=UTC LC_ALL=C SOURCE_DATE_EPOCH=1780272000
# MSYS must not rewrite the POSIX prefix-map rule or the virtual VPI directory.
export MSYS2_ARG_CONV_EXCL="${MSYS2_ARG_CONV_EXCL:+$MSYS2_ARG_CONV_EXCL;}-ffile-prefix-map=;-DMODULE_DIR"
[[ "$(emcc --version)" == *6.0.12* ]] || { echo 'Activate Emscripten 6.0.12' >&2; exit 1; }
"$PYTHON" "$HERE/prepare.py" "$WORK"
SRC="$WORK/iverilog-c7530dbcc186de2f21eacde14fd28061b885924c"
BUILD="$WORK/build"
patch --batch -d "$SRC" -p1 -i "$HERE/browser.patch"
for file in configure lexor_keyword.cc vhdlpp/lexor_keyword.cc; do
  cp "$HERE/bootstrap/$file" "$SRC/$file"
done
PREFIX_FLAGS="-ffile-prefix-map=$SRC=/iverilog-src -ffile-prefix-map=$BUILD=/iverilog-build"
if command -v cygpath >/dev/null 2>&1; then
  PREFIX_FLAGS="$PREFIX_FLAGS -ffile-prefix-map=$(cygpath -m "$SRC")=/iverilog-src -ffile-prefix-map=$(cygpath -m "$BUILD")=/iverilog-build"
fi
mkdir -p "$BUILD"
cd "$BUILD"
printf '{"type":"commonjs"}\n' > package.json
# SDK 6 ships llvm-nm rather than the obsolete emnm.py wrapper.
NM_TOOL=${LLVM_NM:-llvm-nm}
if [ -n "${EMSDK:-}" ] && [ -f "$EMSDK/upstream/bin/llvm-nm.exe" ]; then
  NM_TOOL="$EMSDK/upstream/bin/llvm-nm.exe"
fi
EMMAKEN_JUST_CONFIGURE=1 CC=emcc CXX=em++ AR=emar RANLIB=emranlib NM="$NM_TOOL" \
  bash "$SRC/configure" --host=wasm32-unknown-emscripten --prefix=/iverilog --exec-prefix=/iverilog --libdir=/iverilog/lib \
  CFLAGS="-O2 -sUSE_ZLIB=1 $PREFIX_FLAGS" CXXFLAGS="-O2 -sUSE_ZLIB=1 $PREFIX_FLAGS" LDFLAGS='-sUSE_ZLIB=1'
printf '#define VERSION_TAG "c7530dbcc186de2f21eacde14fd28061b885924c-browser"\n' > "$SRC/release_tag.h"
make dep config.h _pli_types.h version_tag.h version_base.h
printf 'browser-objects: $(O)\n' > backend-objects.mk
make -C tgt-vvp -j4 -f Makefile -f "$BUILD/backend-objects.mk" browser-objects
printf 'browser-objects: $(O) $(OPP) $(V2005) $(VA_MATH) $(V2009)\n' > vpi-objects.mk
make -C vpi -j4 -f Makefile -f "$BUILD/vpi-objects.mk" browser-objects
FLAGS='-O2 -sUSE_ZLIB=1 -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=64MB -sMAXIMUM_MEMORY=512MB -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=web,worker -sINVOKE_RUN=0 -sEXIT_RUNTIME=1 -sFORCE_FILESYSTEM=1 -sDYNAMIC_EXECUTION=0 -sEXPORTED_RUNTIME_METHODS=FS,callMain -sASSERTIONS=1'
make -j4 ivl WASM_BACKEND_OBJECTS="$BUILD/tgt-vvp/*.o" WASM_VPI_OBJECTS="$BUILD/vpi/*.o" LDFLAGS="$FLAGS"
make -C ivlpp -j4 ivlpp LDFLAGS="$FLAGS"
# draw_tt executes on the developer host, so never pass it Emscripten flags.
(cd vvp; "${BUILD_CC:-gcc}" -I. -I.. "$SRC/vvp/draw_tt.c" -o draw_tt.exe; ./draw_tt.exe > tables.cc)
make -C vvp -j4 vvp WASM_VPI_OBJECTS="$BUILD/vpi/*.o" LDFLAGS="$FLAGS"
mkdir -p "$WORK/browser/icarus"
for tool in ivl ivlpp vvp; do
  directory=.
  if [ "$tool" != ivl ]; then directory="$tool"; fi
  cp "$directory/$tool" "$WORK/browser/icarus/$tool.js"
  cp "$directory/$tool.wasm" "$WORK/browser/icarus/$tool.wasm"
done
echo "Candidate artifacts: $WORK/browser/icarus (published assets unchanged)"
