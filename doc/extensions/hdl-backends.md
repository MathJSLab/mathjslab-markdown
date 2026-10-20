> Legacy native/HTTP adapter reference. Static applications must use
> [the browser executor](hdl-troubleshooting.md). Browser VHDL-2008 now uses NVC simulation/replay and GHDL synthesis;
> services are not a fallback for that requirement. The npm distribution now
> also contains browser Wasm assets; the no-toolchain statement below describes
> the earlier native-only distribution.

# Real HDL backends

The optional native adapter compiles the author's actual VHDL or Verilog. It
does not select handwritten circuit models by the top name. Browser and Node
entries are separate. The browser Wasm toolchain is described in the browser
guide; this section describes only the legacy native adapter.

| Operation            | VHDL                                     | Verilog / SystemVerilog              |
| -------------------- | ---------------------------------------- | ------------------------------------ |
| Simulation           | GHDL analysis, elaboration and execution | Icarus compilation and VVP execution |
| Synthesis            | GHDL Verilog output followed by Yosys    | Yosys                                |
| Interactive controls | Deterministic replay with GHDL           | Deterministic replay with Icarus     |

Tool versions and dialect support depend on configured executables. Fixed
argument arrays are used without a shell. Unsupported dialects cause compiler
errors rather than silent substitution; some Icarus versions reject `2017`.

## Native host

```ts
import { createNativeHDLExecutor } from "mathjslab-markdown/hdl/node";

const executor = createNativeHDLExecutor({
    allowNativeExecution: true,
    ghdl: "/opt/hdl/bin/ghdl",
    iverilog: "/opt/hdl/bin/iverilog",
    vvp: "/opt/hdl/bin/vvp",
    yosys: "/opt/hdl/bin/yosys",
    timeoutMs: 30000,
});
console.log(await executor.capabilities());
```

Paths default to commands on PATH. `environment` supplies host environment
overrides; `temporaryDirectory` chooses the parent of private job directories.
The host owns installation and isolation.

**A private work directory is not a sandbox.** Native HDL can perform file I/O
and some simulators can invoke processes. `allowNativeExecution: true` is a
host opt-in for trusted sources or an externally isolated runtime. Markdown
`securityMode: "strict"` sanitizes presentation, not compiler execution. Never
expose this development adapter as a public untrusted-code service.

Batch sessions execute once and must be disposed. Disposal aborts active jobs,
waits for process termination and removes temporary files. Requests are limited
to 256 KiB; logs to 64 KiB; VCD and netlist files to 512 KiB and their viewer's
format limits. Timeout applies to each tool invocation; the engine supplies its
overall execution timeout. Hard CPU, memory and disk quotas require host
isolation.

Simulation defaults to a 1000 ns stop limit. GHDL writes four-state VCD. Icarus
uses an additional recording root and a default `1ns/1ps` directive for sources
without their own timescale; explicit source timescales still apply. File order
and contents are preserved. The `markdown_` filename prefix is reserved for
adapter artifacts. Compiler locations are reported when available. Synthesis
flattens hierarchy to the schematic viewer's Yosys subset.

## Browser application and local service

The `markdown_` entity/module prefix is also reserved for generated wrappers.
Compiler messages originating in those wrappers remain available as text,
without exposing generated files as author-source diagnostic locations.

The development helper is run from this repository. The npm package ships
adapter and handler factories for application-owned services, without
development scripts or compiler executables.

Browsers cannot start native executables. Use an explicitly configured service
and the browser-safe `mathjslab-markdown/hdl` entry. For trusted local
examples:

```powershell
$env:HDL_ALLOW_NATIVE = "1"
$env:HDL_ORIGINS = "http://localhost:8080"
$env:HDL_GHDL = "C:\hdl\bin\ghdl.exe"
$env:HDL_IVERILOG = "C:\hdl\bin\iverilog.exe"
$env:HDL_VVP = "C:\hdl\bin\vvp.exe"
$env:HDL_YOSYS = "C:\hdl\bin\yosys.exe"
npm run serve:hdl
```

The service binds only to `127.0.0.1` and prints its endpoint, a random token
and tool capabilities. `HDL_PORT` defaults to 8787; `HDL_TOKEN` can supply a
host-managed secret. Put the token in trusted application configuration, never
Markdown, URLs, committed files or examples. Match `HDL_ORIGINS` to the app's
development URL. Stop the service after testing.

Portable toolchains may also require runtime libraries on their child-process
PATH. Set `HDL_TOOL_PATH` to those directories (for OSS CAD Suite on Windows,
its `bin` and `lib`, separated by a semicolon). This changes only the service's
tool environment, not the system PATH. Tests configure the detected suite's
runtime directories automatically.

The `mathjslab-app` development integration reads session-only settings. In the
development page's console, configure your printed endpoint/token:

```js
sessionStorage.setItem(
    "mathjslab.hdl.backend",
    JSON.stringify({
        enabled: true,
        endpoint: "http://127.0.0.1:8787/hdl",
        token: "PASTE_THE_SERVICE_TOKEN_HERE",
    }),
);
location.reload();
```

Remove that sessionStorage key and reload to disable it. The application
accepts only loopback endpoints and only in development builds. Its npm
installation must point to this local package, or a version containing these
new exports. No app version or dependency manifest change is required for local
testing.

```ts
import { createEducationalMarkdownEngine } from "mathjslab-markdown";
import {
    hdlExtension,
    hdlInteractiveExtension,
} from "mathjslab-markdown/extensions";
import { createHTTPHDLExecutor } from "mathjslab-markdown/hdl";

const executor = createHTTPHDLExecutor({
    endpoint: applicationConfig.hdlEndpoint,
    token: applicationConfig.hdlToken,
});
const available = await executor.capabilities();
// Present available.languages in the application's backend settings.
const engine = createEducationalMarkdownEngine({
    extensions: [hdlExtension(executor), hdlInteractiveExtension(executor)],
    securityMode: "strict",
    executionPolicy: {
        hdl: { enabled: true, allowInRestrictedMode: true },
        "hdl-interactive": { enabled: true, allowInRestrictedMode: true },
    },
});
```

Existing translated `hdl-*` and `hdl-live-*` examples work unchanged. Ordinary
highlighted HDL never executes. `features: "all"` still does not register
executors automatically. Availability does not grant execution permission.

`createHDLHTTPHandler(executor, options)` embeds the service in a Node host. It
requires a token of at least 32 characters and an explicit origin list.
Authenticated routes under `/hdl` provide capabilities, create/execute/step and
DELETE disposal. Sessions default to eight maximum, reject concurrent actions
and expire after five idle minutes; an expired live session requires Reset.
Abort/disconnect and service disposal release work. Hosts configure
request/header timeouts and deployment isolation. HTTPS applications may
require an HTTPS endpoint because of browser mixed-content and local-network
restrictions.

## Interactive replay

`capabilities().languages[language].interactive` is `"replay"`, not a
persistent simulator kernel. Each Step compiles and simulates the source from
time zero with accumulated input history, returning outputs and full VCD.
Sequential state is reconstructed by execution, not a JavaScript circuit model.
Reset disposes history.

Replay targets deterministic teaching circuits. Repeated compilation costs grow
with history. Randomness, external files and foreign interfaces are not
reproduced reliably. Persistent VPI/VHPI backends can later implement the same
executor contract without changing Markdown syntax.

Ports must be simple named top-level digital inputs/outputs: VHDL `std_logic`
or `std_logic_vector`, or Verilog ports with matching widths. Hierarchical
paths, unsigned/signed VHDL ports, bidirectional ports and generics are outside
this adapter. Incompatible mappings produce compiler errors. One source slot is
reserved for the wrapper. Replay is limited to 1000 steps and respects
`stopTimeNs`. It does not invent clocks; sequential examples supply their own
simulation-only clocks. Histories remain subject to VCD viewer limits.

Inputs are applied as delta-cycle/nonblocking updates at the current time,
preserving inputs used by an already reached clock edge. Outputs include events
at the new target time. Icarus drains that time's updates and VCD writes before
stopping one femtosecond later; the private drain interval is removed from the
returned recording. Live designs must not terminate themselves with `$finish`,
`stop` or `finish` before the replay checkpoint.

The development service also discovers unpacked tools in
`node_modules/.cache/mathjslab-hdl-tools`; explicit `HDL_*` settings take
precedence. It never downloads or installs executables automatically.

On Windows x64, the repository's explicit `npm run prepare:hdl:tools` command
downloads a reproducible portable profile (GHDL 6.0.0 and OSS CAD Suite
2026-10-17), verifies the published SHA-256 hashes and extracts it into that
ignored cache. No installer runs and system PATH is unchanged. The cache
survives `clean:build` and `clean:results`; removing node_modules removes it.
Other hosts can supply their installed toolchains through `HDL_*` paths.

## Verification

```sh
npm run test:hdl:real
```

This builds source/declarations and runs boundary, HTTP and real tool tests.
GHDL, Icarus/VVP and Yosys are required: missing tools fail explicitly, without
silent skips or mock fallback. Set `HDL_GHDL`, `HDL_IVERILOG`, `HDL_VVP`,
`HDL_YOSYS` to executable paths. Tests also recognize an unpacked toolchain in
ignored `node_modules/.cache/mathjslab-hdl-tools/oss-cad-suite/bin`.

Tests cover all translated batch lessons, sequential/combinational live
circuits, changed source, compiler locations, timeout, reset, cleanup and the
browser/service contract. Ordinary distribution tests need no native tools.

References:
[GHDL invocation](https://ghdl.github.io/ghdl/using/InvokingGHDL.html),
[GHDL simulation](https://ghdl.github.io/ghdl/using/Simulation.html),
[Icarus flags](https://steveicarus.github.io/iverilog/usage/command_line_flags.html),
[VVP flags](https://steveicarus.github.io/iverilog/usage/vvp_flags.html).

See [execution sessions and scheduling](../execution-scheduling.md) for shared
engine and HTTP host queues, per-owner limits and session disposal guarantees.

See [incremental HDL results](../incremental-results.md) for optional progress,
log/VCD streaming, provisional previews and final-result compatibility.

See [HDL setup and troubleshooting](hdl-troubleshooting.md) for browser/app
integration, deployment limits and the three-language audit.

Stable replay recordings retain the verified checkpoint timestamp even when no
signal changes occur. Removing the private drain tick does not remove elapsed
simulation time or add artificial value transitions.
