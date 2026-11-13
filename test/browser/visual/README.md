# Visual renderer regression tests

Build with `npm run build` and install the Chromium revision pinned by the
lockfile with `npx playwright-core install chromium`. Run `npm run test:visual`
to check the SVG fixtures and compare their captures. Run
`node test/browser/visual-fixtures.mjs` for functional checks alone.

The reference captures were generated on Windows 10 with Chromium 156. The
suite uses a 960 × 720 viewport, DPR 1, light mode and reduced motion. Wait for
fonts before capture. Vega uses its default sans-serif font, Graphviz uses its
default serif font, and TikZ uses the packaged fonts. Run pixel comparisons on
the reference platform with the same installed fonts. Other platforms can run
the functional checks while separate baselines are pending. Baseline updates on
another platform write to `baselines/<platform>/` so they cannot replace the
Windows captures. For Linux, generate and compare twice on the same Ubuntu
24.04 image and font set used by release CI. Review the captures before adding
pixel comparison to that job.

To generate candidates on GitHub Actions, run the **Markdown release
validation** workflow manually with `visual_baselines` enabled on the ref to
validate. The dedicated Ubuntu job builds the package, generates the captures,
compares two fresh runs and checks the Chromium accessibility tree. Download
`markdown-visual-baselines-linux` to review the four PNGs and the recorded
environment. Commit approved captures under `baselines/linux/`.

## Mathematical label accessibility

Run `node test/browser/visual/math-labels.mjs` after building. The test
compares the Chromium accessibility tree for the chart in a Shadow Root and a
separately mounted SVG export. Each formula must expose one image with its
configured accessible name in each tree. The anchor keys must stay hidden.

For assistive-technology verification, render the same fixture with the host's
`vegaMathLabels` configuration. Navigate through the chart with the reader's
graphics navigation and check that the nine names are announced once each.
Repeat with the exported SVG opened as a document. Record the browser, reader
and versions and any labels that are skipped or announced twice. The automated
tree check does not measure spoken output.

Captures must have identical dimensions. A pixel differs when any RGBA channel
differs by more than 25 out of 255. The comparison allows up to 0.1% different
pixels. Failed comparisons write the actual PNG under `test-results/visual/`.
Regenerate deliberately with `npm run test:visual -- --update` and review all
changed images.
