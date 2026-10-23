# WebKit fragment navigation: 0.8.1 candidate

This is an unpublished correction to mathjslab-markdown 0.8.0. No commit, push,
npm publication, application edit, or deployment is part of this work.

## Reproduction and cause

The standalone regression uses the distributed custom element, an educational
engine with `cross-references`, a document loaded by URL, 60 paragraphs before
`## 2.3 Logic gates {#gates}`, a 24 px body font, and 1,000 px of space after
the viewer. It has no application panels, transforms, or application runtime.

On Windows, Playwright 1.64.1 / WebKit 27.2 (revision 2370), the original code
called `scrollIntoView({ block: 'start', behavior: 'smooth' })` while the
viewer was still in `loading`. The loading status occupied 51 px.
`MarkdownNavigator` then published `idle`, and the component hid that status
and rebuilt its navigation controls. WebKit retained the destination calculated
before that layout change: two seconds after clicking, the target was at top
-50.625 px, bottom -8.625 px, entirely outside the viewport.

A controlled diagnostic that kept only the status out of layout produced top
0.375 px / bottom 42.375 px with the original scroll implementation. That
experiment isolates the disappearing status as the cause; hiding status UI is
not the retained correction. Removing application rotations is unnecessary.

The retained correction schedules the component's native scroll on the next
animation frame, after the navigation state and controls have settled. The same
standalone reproduction then ends at 0.375 px / 42.375 px with normal smooth
motion and status height zero. There is no user-agent branch, browser skip,
timeout increase, forced reduced motion, or compensating pixel offset.
`MarkdownNavigator` keeps its public callback/state ordering, and reference
registration, IDs, localized text and diagnostics remain unchanged.

Pending scrolls are coalesced and canceled when the viewer is released. Focus
behavior and section announcements are preserved. The section observer sorts
currently intersecting headings by their live rectangles: observer snapshots
describe threshold crossings during animation and could otherwise select a
different section after the target stops. Repeated collection navigation to the
same fragment announces the section rather than a newly loaded page.

## Reproducible checks

Build and test sequentially:

```shell
npm run build
node node_modules/playwright-core/cli.js install chromium firefox webkit
npm run test:browser:fragments
```

The test driver is pinned to Playwright 1.64.1 to reproduce revision 2370.
Existing installed binaries may be reused. The runner starts its own package
fixture server on an ephemeral loopback port; it does not serve or modify the
application. Browsers and individual test cases are intentionally sequential.

The default matrix covers Chromium, Firefox and WebKit; pt/en/es; normal and
reduced motion; ordinary standalone documents, 36 px fonts with large heading
margins, two nested scroll containers with separate Shadow Roots, and a
manifest-backed collection. Every case follows an explicit numbered reference,
a keyboard-activated ordinary link, the page outline, and an unnumbered
reference. Every layout includes trailing space so a scroll limit cannot hide
the defect. CSS scroll margins and container scroll padding are also exercised.

Assertions start two seconds after activation, then collect three geometry
samples over another 200 ms. They require the complete heading to remain in the
viewport and every clipping scrollport (one-pixel rounding tolerance), plus a
stable final position. The test also verifies ready-state scrolling, motion
options, localized reference text, an unchanged host URL, `aria-busy`,
`aria-current`, section announcements and absence of page errors. A transient
intersection while animating is insufficient.

Results are written to ignored `report/fragment-navigation.json`, including
browser versions, every final geometry sample, native scroll options and
component state. Failures are collected and fail the run; no engine is skipped.
Optional environment variables select a smaller diagnosis without changing the
default matrix:

```powershell
$env:MARKDOWN_FRAGMENT_BROWSERS = 'webkit'
$env:MARKDOWN_FRAGMENT_LOCALES = 'pt'
$env:MARKDOWN_FRAGMENT_MOTION = 'no-preference'
$env:MARKDOWN_FRAGMENT_SCENARIOS = 'document'
npm run test:browser:fragments
```

`MARKDOWN_FRAGMENT_REPEATS` repeats cases. `MARKDOWN_PLAYWRIGHT_MODULE` can
point to another installed driver's `index.mjs` for a deliberate version
comparison. Clear selector variables before running the full matrix. The
temporary status-hiding control used to isolate the cause has been removed from
the retained fixture.

## Verified production browser results (Windows, 2026-10-23)

The complete matrix passed with the production distribution, without retries:

| Engine   | Version             | Cases | Navigations | Failures |
| -------- | ------------------- | ----: | ----------: | -------: |
| Chromium | 156.0.8078.4        |    24 |          96 |        0 |
| Firefox  | 157.0               |    24 |          96 |        0 |
| WebKit   | 27.2, revision 2370 |    24 |          96 |        0 |
| Total    | Playwright 1.64.1   |    72 |         288 |        0 |

Each engine covered all three locales and both motion preferences. WebKit's
final vertical geometry across all actions/locales/preferences was:

| Scenario                          | Final top (px) | Final bottom (px) |
| --------------------------------- | -------------: | ----------------: |
| Standalone, 24 px font            |    0.125–0.375 |     42.125–42.375 |
| 36 px font, large margins         |       23.65625 |         104.65625 |
| Nested scrollports and Shadow DOM |           23.5 |              77.5 |
| Collection                        |    0.125–0.375 |     42.125–42.375 |

Horizontal visibility, every ancestor scrollport, and all three settled samples
also passed. Native scrolls occurred in `ready`, with zero status height, using
`smooth` normally and `auto` for reduced motion. The retained fixture contains
no status-hiding override. The full matrix ran outside the local restriction to
allow Firefox's `newPage`, as indicated by the app's earlier infrastructure
diagnosis. No builds or other browser runs overlapped.

The production build completed with the existing ELK/sax and bundle-size
warnings. Pinned HDL assets passed integrity checks. Unit regressions also
cover queued scroll cancellation (disposal, replacement and rapid back to a
fragment-free URL), ready-state ordering, and stale observer rectangles.

Final package checks passed: lint, TypeScript, 618 unit tests in 42 suites, 21
distribution tests, and verification of all 882 packaged files, public exports,
declarations and relative imports. Formatting and `git diff --check` also
passed. The application's preexisting diff (only its diagnostic report) had the
same SHA-256 before and after this work. The package HEAD remains `68cf247`;
the 0.8.1 source changes are deliberately uncommitted.

## Application follow-up and limitations

After consuming the corrected package, update the app's dependency and lockfile
through its normal release workflow, rebuild it, and rerun
`test/browser/markdown-heading-references.spec.ts` in all three engines and
locales. Retain `toBeInViewport`, and additionally inspect the heading after
scrolling has settled; an early pass during animation does not establish the
final position. Keep the 24 px / trailing-space standalone reproduction as a
useful diagnostic. No panel transform workaround or browser exclusion is
needed. The application has not been edited in this work.

The local unpublished candidate is `mathjslab-markdown-0.8.1.tgz` in the
package root. It can be consumed for a separately authorized application
validation before any registry publication. The 0.8.1 changelog is marked
unreleased; no tag or release has been created.

Local Windows engine results do not replace the application's Linux GitHub
Actions matrix or establish native macOS Safari coverage. Firefox may require
an unrestricted local test process because of the launch/newPage restriction
already recorded in the app's report; an infrastructure crash must not be
reported as a passing or skipped browser.

The Firefox image `NS_BINDING_ABORTED` retry is a separate, unproven issue. The
app reports all 15 affected Firefox tests passed locally in three repeats. This
fragment suite contains no image request scenario and establishes no cause or
correction for that cancellation. No image assertions, request-failure
handling, retries, or application tests have been weakened or changed.
