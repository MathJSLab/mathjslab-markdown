# HDL in static browser deployments

Use the browser executor for static hosting. Compilation, synthesis and
simulation must execute on the visitor's device. The server delivers files
only; an HTTP/native execution service is not a solution or fallback.

**Current implementation is partial:** real Icarus simulation and YoWASP
synthesis support the Verilog examples. GHDL WebAssembly supports VHDL-2008
synthesis, including tested IEEE.NUMERIC_STD arithmetic and sequential netlists.
NVC Wasm supports real VHDL-2008 simulation and interactive replay within the
precise library/port profile documented in the current report. See the
[VHDL progress report](../hdl-vhdl-progress.md) and the
[research, evidence and validation report](../hdl-browser-results.md). The
historical [native audit](../hdl-audit-results.md) is not browser validation.

## Application integration

Copy [MarkdownHDLConfiguration.ts](../integration/MarkdownHDLConfiguration.ts)
to mathjslab-app/src/MarkdownHDLConfiguration.ts. Its existing registration
`extensions: [...hdlConfiguration.extensions, ...]` can remain. Use the
returned executionPolicy too. Explicit application authorization is required in
both development and production; Markdown cannot grant permission.

These changes are local and unpublished. The registry version 0.6.1 does not
contain `createBrowserHDLExecutor`. Point the app at this built local package
or install a local test tarball made with `npm pack --ignore-scripts` after the
build. Editing this repository does not update the installed app dependency.
Publication remains blocked by the issues in the report.

Build this package and copy **all** of `dist/browser/hdl/` to the app's public
`hdl/` directory, preserving subdirectories. The package exports
`mathjslab-markdown/hdl/assets/*` for tooling that resolves package assets. The
app build can copy from `node_modules/mathjslab-markdown/dist/browser/hdl/`;
this is a build operation, not a runtime Node dependency. This repository also
supplies `node script/copy-hdl-assets.mjs <destination>` after the package
build. Keep this step in both app development and production asset pipelines.
For an app deployed under a subpath, pass its public HDL directory URL
explicitly rather than assuming `/hdl/`.

Copy one complete toolchain snapshot at a time. With immutable HTTP caches,
use a fresh versioned directory (for example `hdl/<toolchain-lock-sha256>/`)
and pass that URL to the executor. All Worker imports stay relative to it.
Mixing an old cached loader/Wasm with new files can fail integrity checks;
cache versioning uses ordinary static paths and requires no execution service
or COOP/COEP headers. The app's previous validation does not cover later copies.

```ts
import { createBrowserHDLExecutor } from "mathjslab-markdown/hdl";
import {
    hdlExtension,
    hdlInteractiveExtension,
} from "mathjslab-markdown/extensions";

const executor = createBrowserHDLExecutor({
    allowBrowserExecution: true,
    assetsURL: new URL("hdl/", document.baseURI),
    timeoutMs: 30000,
    maxSessions: 4,
});
const extensions = [hdlExtension(executor), hdlInteractiveExtension(executor)];
const executionPolicy = {
    hdl: { enabled: true },
    "hdl-interactive": { enabled: true },
};
```

No credentials, endpoints, sessionStorage settings, CDN or user-installed tools
are required. `features: 'all'` enables renderers, not permission or a
compiler. The legacy native/HTTP exports remain for API compatibility and
regression checks; they are not used by this static integration.

## Static server and CSP

Serve JS/MJS as JavaScript and `.wasm` as `application/wasm`. Use HTTP for
local development and HTTPS for published sites. `file://` does not load module
Workers correctly. All tool assets must be on the application's origin.

The tested HDL policy was:

```text
default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:
```

HDL uses module Workers from real static URLs, no blob worker and no
SharedArrayBuffer. COOP/COEP and cross-origin isolation were not required in
the tested browsers. Other extensions can need additional policies (for example
TikZ blob Workers, map tiles, fonts or MathJSLab plotting). Configure those
according to their actual resource requirements.

## Diagnostics and semantics

- `hdl-executor-missing`: register the authorized browser executor explicitly.
- Authorization error: enable the matching policy in trusted application code;
  sanitized/restricted rendering additionally needs `allowInRestrictedMode`.
- VHDL accepts only standard `08`. NVC handles simulation/replay; GHDL handles
  synthesis. Remove an obsolete app simulation guard only after copying all
  updated assets and applying the candidate integration. Other language/library
  features are limited to the tested profile in the VHDL report.
- Worker/CSP/fetch error: check all copied assets, JavaScript/Wasm MIME types,
  the public directory URL and the site's CSP. An HTML SPA fallback is not a
  compiler asset.
- Compiler errors retain source filename/line when the tool reports them.
- NVC can log `unsupported syscall: __syscall_getrusage`; this warning was
  observed in successful simulations. Check the actual status and diagnostics
  rather than treating every log line as a simulation failure.
- `2017` is rejected explicitly; the Icarus profile accepts `2005` and `2012`,
  with the actual subset determined by Icarus, not a claim of full SV support.

Interactive Run schedules Steps; Pause stops future Steps while the active Step
completes. Reset/disposal cancels active work and discards history. Each Step
recompiles and replays confirmed history, preserving earlier clock/input
boundaries. Cost grows with history, limited to 1,000 intervals. Inputs support
1–64-bit 0/1/x/z values. Hierarchical forcing, arbitrary VPI/VHPI, inout and
analog simulation are outside this replay contract. VCD viewer times use
recording ticks; session time uses nanoseconds.

Verify pinned assets with `npm run verify:hdl:assets`. Build with
`npm run build:types` and `npm run build:browser`, then run
`npm run test:hdl:browser`. The browser test records network requests and uses
a file-only static server. Native tests and JSDOM are complementary, never a
substitute for browser evidence. `npm run test:hdl:browser:verilog:runtime` adds
fresh counter/state/math/diagnostic sources and checks their actual VCD values.
The source-built Icarus modules include complete sources, SDK pins and two-root
Windows reconstruction evidence under `script/hdl/icarus-browser/`. Each module
has a 512 MiB Wasm heap ceiling. Real-valued VCD variables remain unsupported by
the digital importer, although real mathematical functions can execute.
GHDL's pinned Linux build and promoted assets now have independent clean-cache
reconstruction evidence in `script/hdl/ghdl-synth/reproduction.json`. The release
check verifies the source recipe, package pins, both builds and asset hashes;
matching binaries alone cannot bypass these checks. See the browser report for
the tested profile and integrated-app validation status.
No publication is claimed by this work.
## HDL result presentation

Batch execution shows a localized success/error/cancellation status. The
schematic or waveform precedes a native, keyboard-operable `details` section
for logs and compiler diagnostics. Successful jobs start with details closed;
error and cancelled results start with details open. Interactive waveforms also
precede their collapsible logs; reset clears and closes that section.

The UI treats compiler output as plain text, never HTML. ANSI CSI/OSC/string
commands, remaining C0/C1 controls (except tab/newline) and bidirectional format
controls are removed. CRLF and CR become LF. This is text normalization, not
terminal emulation: useful messages, Unicode, file/line locations, tabs and
line breaks remain. Split escape sequences are normalized from the accumulated
raw update snapshot. A final log replaces that snapshot, rather than appending
it again; the snapshot is used only when the final result omits logs.

**TXT exports contain the normalized log shown in the UI.** The extension's
JSON exports also contain normalized logs/diagnostic messages. Interactive TXT
and session JSON use the normalized log of the last confirmed step. Structured
diagnostic locations and HDL source files retain their original values. The
executor's returned result and `onHDLUpdate` payloads remain original compiler
data for host applications; consumers displaying those callbacks must treat
them as untrusted text and may need their own normalization.

No mathjslab-app configuration or compiler asset changes are needed. Upgrade
the Markdown library/bundle through the usual application build; keep explicit
execution authorization and the existing static asset-copy configuration.
Custom CSS that assumes logs are direct child `pre` elements should instead
target `.hdl-log-details .hdl-logs` (or `.hdl-interactive-logs`).
