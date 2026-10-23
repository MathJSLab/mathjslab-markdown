# 3Dmol initialization without OffscreenCanvas

## Diagnosis

The standalone production fixture reproduces both PDB and XYZ failures with
3Dmol 2.5.5 on Windows WebKit 27.2 (Playwright 1.64.1, revision 2370).
`OffscreenCanvas` is absent, while HTML canvas WebGL is available. Upstream
`Renderer.initGL` reads the bare identifier, catches the resulting
`ReferenceError` before assigning `_gl`, and subsequently fails at
`setDefaultGLState` / `clearDepth`. The baseline made no WebGL draw calls.
Evidence is in ignored `report/molecule-baseline.json`.

This is not established as a 0.8.1 regression: the `molecule-3d` extension is
identical in tags v0.8.0 and v0.8.1, and both pin 3Dmol 2.5.5. The 0.8.1 scroll
correction concerns a separate component and is left unchanged.

The first `typeof`-only correction fixed WebKit but exposed a second capability
case in this Firefox installation: OffscreenCanvas exists, yet its WebGL2
context is unavailable. HTML canvas's WebGL1 context works. The intermediate
results are in `report/molecule-first-fix.json`; neither a fake global nor a
browser exclusion was retained.

## Correction and reproduction

The private runtime recipe in [script/3dmol](../script/3dmol/README.md) checks
the upstream version and complete bundle SHA-256 before replacing only the
`initGL` method. It guards the optional constructor and only commits the viewer
to the offscreen path if WebGL2 and the HTML bitmap output context are usable.
Otherwise it reaches the existing native HTML WebGL2/WebGL1 fallback.

The generated ES module is used by both the source distribution and browser
bundles. It is produced during builds, is not committed, and includes the
upstream license. The package ships the audited recipe. No `node_modules` file,
browser global, application source, user-agent branch or consumer bundler
configuration is modified. This remains a lazy, optional renderer.

Build and run browsers sequentially:

```shell
npm run build
npm run test:browser:molecules
node --test test/distribution/3dmol-runtime.test.mjs
```

The minimal fixture has no app interface and loads the production engine with
only `molecule-3d`. Each engine renders PDB and XYZ with its native
capabilities, then in a fresh page where the test removes the optional global.
It does not define an artificial constructor or binding. Native Chromium
exercises usable OffscreenCanvas; native Firefox additionally exercises the
HTML fallback when offscreen WebGL2 is unavailable; native WebKit exercises the
absent-global case.

Assertions require no alerts or console/page errors, real WebGL draw calls,
non-background molecular pixels, resized canvas dimensions with visible
geometry, removal of the canvas and disconnection of the extension's resize
observer on session disposal, and no later draws when its container changes.
The same test also imports the distributed private ES module directly and
checks that it leaves the optional global unchanged.

`MARKDOWN_MOLECULE_BROWSERS` and `MARKDOWN_MOLECULE_MODES` can restrict a local
diagnosis; the default runs all three engines with native and absent modes,
without retries or overlapping builds. Reports go to
`report/molecule-rendering.json` (`MARKDOWN_MOLECULE_REPORT` can change this).

## Integration and limits

A new package patch release is required to deliver this correction. This work
does not change version metadata, commit, push, publish or deploy. Once a
release is authorized, the app should consume that version, update its lockfile
and rebuild its browser bundles. It needs no OffscreenCanvas shim. Re-run its
two extension audits, 3D models test and heading references in all three
engines. The application working tree is not edited here.

This host has neither an installed WSL Linux runtime nor Docker. Linux and
native macOS Safari are not validated by these Windows runs. The new regression
can run on Linux with the same pinned Playwright driver; install its browser
dependencies before running it. No remote CI run is initiated because the user
prohibits commit and push.

## Verified results (Windows, 2026-10-23)

- Production type emission and browser build passed (217.983 s for the final
  browser build, with the four existing ELK/sax/bundle-size warnings).
- All 12 molecular cases passed without retries: three engines, native/absent
  modes, PDB/XYZ. Chromium 156.0.8078.4 used real offscreen WebGL2; Firefox
  157.0 used HTML WebGL1 when its offscreen WebGL2 was unavailable; WebKit 27.2
  used HTML WebGL2 with no OffscreenCanvas binding. Rendered water molecules
  contained 4,044–4,130 non-background pixels before resize and 4,043–4,130
  afterwards. Canvas width changed from 1,280 to 840 pixels; observers were
  disconnected and no further draws occurred after session disposal.
- The nine focused fragment cases / 36 navigations passed across pt/en/es and
  all three engines, including final stable geometry, explicit references,
  ordinary links and outline links. This recheck uses the standalone document
  scenario and normal motion, rather than repeating the earlier 72-case matrix.
  Evidence: `report/molecule-fragment-navigation.json`; the previous full
  fragment report was preserved.
- The 10 targeted viewer lifecycle unit tests and all 22 distribution tests
  passed. The new distribution test reproduces identical runtime bytes twice,
  checks the dependency remains unchanged and confirms the license/source entry
  point. Existing distribution tests also exercise core import isolation,
  localized rendering, Workers and HDL sessions.
- Package verification passed for all 889 files, public exports, actual
  ES-module imports and bundled licenses. The vendor module is parsed as
  JavaScript to avoid mistaking upstream comments quoting TypeScript imports
  for live imports. All 29 pinned HDL asset hashes and the existing
  source/reproducibility gates passed. Formatting and diff whitespace checks
  passed.
- The release workflow includes the molecular regression for a future Linux
  run; it has not been pushed or dispatched.
- Full source lint passed. There was no broad dependency update, compiler
  reconstruction, application build, general unit-suite rerun or hosted Linux
  browser run in this task.

No tracked HDL assets, heading-navigation implementation, package version or
lockfile were changed. Commit HEAD remains `b95d7ab`; all correction files are
left uncommitted for review. The expected next release is a patch after 0.8.1
(normally 0.8.2), subject to release authorization and Linux validation.

## Release preparation

The user subsequently authorized release 0.8.2. Package and lockfile versions
and the dated changelog are updated. The implementation-stage statements above
record the earlier no-commit/no-publication scope; release preparation now
includes commit, GitHub release and npm publication. The app remains unchanged.
The focused Linux workflow reuses prior local validation and omits rebuilding
the app: nine fragment cases and twelve molecular cases run sequentially.

## Consolidated 0.8.2 release validation

After resuming from the forced shutdown, the repository and the saved tarball
were intact; no v0.8.2 GitHub release/tag or npm version had yet been
published. The original Linux run passed the package build, publication gates,
package verification and all nine reference cases / 36 settled navigations:
https://github.com/MathJSLab/mathjslab-markdown/actions/runs/40022796935

Its molecular test exposed a runner limitation: Firefox headless supplied no
WebGL context at all, including HTML WebGL1. Xvfb with Mesa software rendering
made all four Firefox cases render correctly. Forcing every engine to headed
mode also exposed a first-frame timeout in Chromium. The final launch settings
retain headless Chromium/WebKit and use a virtual display only for Firefox. The
fixture explicitly supplies its favicon rather than requesting a missing server
asset. Pixel, geometry, error and disposal assertions remain unchanged; no
retries or browser exclusions were introduced.

The final Linux run passed all 12 molecular cases using the earlier built
candidate, without repeating its successful build/reference matrix:
https://github.com/MathJSLab/mathjslab-markdown/actions/runs/40029341760

Together with the Windows checks above, this validates the 0.8.2 correction on
both platforms. The remaining release actions are the annotated v0.8.2 tag,
GitHub release and npm publication followed by public-registry integrity
verification. The app's local changes remain untouched.
