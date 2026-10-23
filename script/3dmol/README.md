# Private 3Dmol compatibility runtime

3Dmol 2.5.5 reads the bare `OffscreenCanvas` identifier in `initGL` before
choosing its HTML canvas fallback. Environments with WebGL but no such global
raise `ReferenceError`, followed by an uninitialized `clearDepth` error.

`npm run prepare:3dmol` verifies the exact upstream version and SHA-256 of
`node_modules/3dmol/build/3Dmol.js`, then replaces only `Renderer.initGL` with
the reviewed method in `initGL.js.txt`. A different version, input hash or
method boundary fails the build. The method guards the optional constructor
with `typeof`, uses the offscreen path only when its WebGL2 and bitmap contexts
are usable, and otherwise reaches the existing HTML WebGL2/WebGL1 fallback.
Offscreen initialization exceptions also fall back to HTML canvas. No other
renderer method is changed.

The generated runtime wraps the upstream UMD factory in a private ES module,
removes its inline source map and exports its API as the default export. It
does not define browser globals. The source workspace copy is ignored; builds
also generate the distributable copy under `dist/source`. Browser builds bundle
that same runtime, so consumer bundlers need no plugin or patch step. Builds
ship the BSD-3-Clause license beside the runtime and in browser assets. No
installed dependency is edited, and consumer install scripts are unnecessary.

Run the normal build, then `npm run test:browser:molecules`. The regression
renders real PDB/XYZ geometry with native capabilities and with the global
removed in an isolated test page. It checks pixels, resize and disposal.

When updating 3Dmol, inspect upstream `src/WebGL/Renderer.ts` and the
distributed bundle, re-evaluate the guard, update the audited lock, and repeat
the browser regression. Remove this recipe once an adopted upstream release
fixes it.

On a Linux runner where Firefox headless exposes no WebGL contexts, use
`LIBGL_ALWAYS_SOFTWARE=1 MARKDOWN_MOLECULE_HEADED=firefox xvfb-run -a npm run test:browser:molecules`.
This changes the test display configuration only. Chromium and WebKit retain
headless mode; every engine still must draw real molecular pixels.
