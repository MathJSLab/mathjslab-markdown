#!/bin/bash
# Developer build only. Visitors execute the resulting files in MEMFS Workers.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
WORK=$(realpath -m "${1:-$PWD/.hdl-research/nvc-build}")
PYTHON=${EMSDK_PYTHON:-python3}
export TZ=UTC LC_ALL=C SOURCE_DATE_EPOCH=1780272000
# Normalize compiler-generated source locations across independent build roots.
PREFIX_FLAGS="-ffile-prefix-map=$WORK=/nvc-build"
if command -v cygpath >/dev/null 2>&1; then
  PREFIX_FLAGS="$PREFIX_FLAGS -ffile-prefix-map=$(cygpath -m "$WORK")=/nvc-build"
fi
version=$(emcc --version)
[[ "$version" == *"6.0.12"* ]] || { echo 'Activate Emscripten 6.0.12 first' >&2; exit 1; }
"$PYTHON" "$HERE/prepare.py" "$WORK"
NVC="$WORK/nvc-1.22.0"
patch --batch -d "$NVC" -p1 -i "$HERE/release-wasm.patch"
bash "$HERE/gen_wasm_symtab.sh" "$NVC"
DEPS="$WORK/deps"
mkdir -p "$DEPS/lib" "$DEPS/include" "$WORK/build"
cd "$WORK/zstd-1.5.6/lib"
make -j4 CC=emcc AR=emar CFLAGS="-O3 $PREFIX_FLAGS" libzstd.a
cp libzstd.a "$DEPS/lib/"
cp zstd.h zstd_errors.h "$DEPS/include/"
cd "$WORK/libffi-3.4.6"
CC=emcc CXX=em++ AR=emar RANLIB=emranlib NM=emnm EMMAKEN_JUST_CONFIGURE=1 \
  bash configure --host=wasm32-unknown-emscripten --disable-shared --enable-static \
  --disable-multi-os-directory --disable-builddir || true
test -f include/ffi.h && test -f include/ffitarget.h
cp include/ffi.h include/ffitarget.h "$DEPS/include/"
emcc -O2 $PREFIX_FLAGS -I"$DEPS/include" -c "$HERE/libffi_stub.c" -o "$DEPS/ffi.o"
emar rcs "$DEPS/lib/libffi.a" "$DEPS/ffi.o"
cd "$WORK/build"
printf '{"type":"commonjs"}\n' > package.json
zlib_CFLAGS="-sUSE_ZLIB=1" zlib_LIBS="-sUSE_ZLIB=1" \
libffi_CFLAGS="-I$DEPS/include" libffi_LIBS="-L$DEPS/lib -lffi" \
libzstd_CFLAGS="-I$DEPS/include" libzstd_LIBS="-L$DEPS/lib -lzstd" \
ac_cv_func_fpurge=no ac_cv_func_gettid=no ac_cv_func_tcgetwinsize=no \
CC=emcc CXX=em++ AR=emar RANLIB=emranlib NM=emnm EMMAKEN_JUST_CONFIGURE=1 \
  bash "$NVC/configure" --host=wasm32-unknown-emscripten --disable-llvm --disable-lto \
  CFLAGS="-O2 -sUSE_ZLIB=1 $PREFIX_FLAGS" \
  LDFLAGS="-sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=64MB -sMAXIMUM_MEMORY=512MB -sNODERAWFS=1 -sEXIT_RUNTIME=1 -sENVIRONMENT=node"
make src/cov/cov-style.h
make src/jit/wasm_symtab.o
make -j4 bin/nvc lib_libnvc_a_LIBADD=src/jit/wasm_symtab.o PTHREAD_CFLAGS= PTHREAD_LIBS=
node bin/nvc --version
make -j1 lib/std.08/STD.STANDARD-body lib/std.08/STD.TEXTIO-body lib/std.08/STD.ENV-body \
  lib/ieee.08/IEEE.STD_LOGIC_1164-body lib/ieee.08/IEEE.NUMERIC_STD-body lib/nvc.08/NVC.SIM_PKG-body \
  nvc="node ./bin/nvc" lib_libnvc_a_LIBADD=src/jit/wasm_symtab.o PTHREAD_CFLAGS= PTHREAD_LIBS=
mkdir -p browser
emcc -O2 -sUSE_ZLIB=1 src/nvc.o lib/libnvc.a lib/libthirdparty.a -L"$DEPS/lib" -lffi -lzstd \
  -o browser/nvc.mjs -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=64MB -sMAXIMUM_MEMORY=512MB \
  -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=web,worker -sINVOKE_RUN=0 -sEXIT_RUNTIME=1 \
  -sFORCE_FILESYSTEM=1 -sDYNAMIC_EXECUTION=0 -sEXPORTED_RUNTIME_METHODS=FS,callMain -sASSERTIONS=1 --profiling-funcs
"$PYTHON" "$HERE/pack-libraries.py" "$WORK/build"
echo "Candidate browser assets: $WORK/build/browser"
