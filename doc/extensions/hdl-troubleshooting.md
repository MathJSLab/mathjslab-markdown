# HDL example audit and web integration

## What works in a browser

| Fence / representation                          | Browser behavior                                                  | Requires execution service                                             |
| ----------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `vhdl`, `verilog`, `vhd`, `sv`, `systemverilog` | Highlighted source only                                           | No                                                                     |
| WaveDrom `signal`, `reg`, `assign`              | Declarative timing/register/logic diagrams                        | No                                                                     |
| `netlist`                                       | Draws an existing Yosys JSON netlist; does not synthesize source  | No                                                                     |
| `vcd`                                           | Inspects an existing recording; does not simulate hardware        | No                                                                     |
| `vhdl-run`, `verilog-run`                       | Authorized simulation or synthesis                                | Yes, unless the host explicitly supplies its own browser/WASM executor |
| `vhdl-live`, `verilog-live`                     | Authorized interactive session with input updates and checkpoints | Yes for the provided native/replay adapter                             |

Execution fence names are exactly `vhdl-run`, `verilog-run`, `vhdl-live` and
`verilog-live`. Presentation aliases such as `sv` do not imply `sv-run` or
`systemverilog-live` aliases. Use `verilog-run` with `standard: "2012"` for the
SystemVerilog examples.

There is no bundled browser HDL compiler. `features: "all"` selects renderers;
it never grants execution permissions or creates an executor. The corrected
full educational profiles recognize executable fences without an executor and
show `hdl-executor-missing`. Explicit host extensions replace these fallback
handlers. Minimal profiles still require explicit extension registration.

Published 0.6.0 did not register these fallback handlers: without the app's HDL
configuration, executable fences could become ordinary source listings. A
visible source listing is not evidence of compilation or simulation.

## Confirmed integration issue in mathjslab-app

The inspected app declares `mathjslab-markdown: ^0.6.0` and its installed copy
is 0.6.0, not a junction to this repository. Its
`src/MarkdownHDLConfiguration.ts` intentionally returns no HDL extensions in
production or without enabled development session settings. `src/Markdown.ts`
calls this configuration once during module initialization and registers only
the returned extensions. Changing sessionStorage therefore requires reloading
the application. Copying edits into this package does not update that installed
app copy automatically.

The production restriction is deliberate. The integration defect is silent
fallback to code, not the absence of automatic native execution. Do not remove
the development guard and assume a public deployment can simulate hardware.

A concrete drop-in replacement is provided at
[`doc/integration/MarkdownHDLConfiguration.ts`](../integration/MarkdownHDLConfiguration.ts).
Copy its contents to the app's `src/MarkdownHDLConfiguration.ts`. It works with
published 0.6.0 as well as the corrected package: blocked deployments register
safe diagnostic-only fences, enabled development settings register the real
extensions, and production remains blocked. The app engine's current
`extensions: [...hdlConfiguration.extensions, ...]` registration can remain. Do
not register both the supplied real and blocked extensions manually.

The candidate validates HTTP(S) loopback endpoints, token length and explicit
enablement. It contains no native imports and reports blocked configuration in
the lesson itself. The app's existing five configuration tests assume disabled
configuration returns an empty extensions array; update those assertions to
expect the diagnostic-only `hdl` and `hdl-interactive` extensions with empty
execution policies. Keep assertions that production never authorizes execution.
Additional candidate integration tests are in
`test/markdown/HDLAvailability.spec.ts`.

The app repository is outside this task's writable workspace. It was inspected
and its existing tests were run; the replacement is supplied here rather than
silently modifying another repository. After applying it, run the app's HDL
configuration tests, type check and browser build, then test lessons in the
actual browser/network environment.

## Trusted local development setup

From the Markdown repository, install/discover tools and start the service:

```powershell
npm run prepare:hdl:tools
$env:HDL_ALLOW_NATIVE = "1"
$env:HDL_ORIGINS = "http://localhost:8080"
npm run serve:hdl
```

The optional portable helper is Windows x64 only and verifies pinned SHA-256
archives. No compiler is installed by `npm install`. Its ignored cache is under
`node_modules/.cache/mathjslab-hdl-tools`; `npm ci` or replacement of
node_modules can remove it. For persistent system tools, configure `HDL_GHDL`,
`HDL_IVERILOG`, `HDL_VVP`, `HDL_YOSYS` and, where DLL lookup needs it,
`HDL_TOOL_PATH`. Check the service's printed capabilities: VHDL needs GHDL,
Verilog simulation needs Icarus **and** VVP, Verilog synthesis needs Yosys, and
VHDL synthesis needs GHDL **and** Yosys.

In the development app's browser console, use the endpoint and token actually
printed by the service (do not commit the token):

```js
sessionStorage.setItem(
    "mathjslab.hdl.backend",
    JSON.stringify({
        enabled: true,
        endpoint: "http://127.0.0.1:8787/hdl",
        token: "COPY_THE_CURRENT_SERVICE_TOKEN_HERE",
    }),
);
location.reload();
```

Unless `HDL_TOKEN` is explicitly configured by the host, restarting the service
generates a new token. Reconfigure the app to match. The token is not a
Markdown attribute or a lesson setting. A token must contain at least 32
characters for the service. The service listens on IPv4 loopback; use
`127.0.0.1` if localhost resolves only to IPv6. Configure the exact browser
Origin, including scheme and port, in `HDL_ORIGINS`. The GitHub URL of a lesson
is not the browser Origin.

The HTTP protocol is GET `/hdl/capabilities`, POST `/hdl/sessions`, POST
`/hdl/sessions/:id/execute` or `/step`, and DELETE `/hdl/sessions/:id`.
Requests use JSON and a Bearer token; responses may negotiate NDJSON updates.
CORS preflight permits Authorization/Content-Type and the execution methods.
Browser fetch failure cannot distinguish offline service, denied CORS,
HTTPS/mixed-content restrictions, local-network permissions and some proxies.
Check browser developer tools and the service console; Node fetch tests do not
emulate a browser's private-network enforcement.

## Diagnosing a blocked lesson

| Symptom                              | Meaning / next action                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Only highlighted source              | Expected for plain `vhdl`/`verilog`; for `*-run`/`*-live` in 0.6.0, verify extension registration/app fallback              |
| `hdl-executor-missing`               | Configure the app backend; registering all visual renderers does not create an executor                                     |
| Authorization diagnostic             | Set the matching `hdl` / `hdl-interactive` policy from trusted app code; restricted modes also need `allowInRestrictedMode` |
| HTTP 401                             | Token missing/stale; match the service's current token                                                                      |
| HTTP 403 / opaque browser CORS error | Allow the exact app Origin on the service; do not use the source Markdown URL                                               |
| Invalid JSON / proxy-login response  | Wrong endpoint, app HTML page, reverse proxy or authentication redirect                                                     |
| Capability says unavailable          | Install/configure the required tools on the service host; no compiler session is acquired by the corrected renderer         |
| Compiler diagnostic with file/line   | A source/dialect problem, distinct from transport or authorization                                                          |
| Run/Step disabled after error        | Read the visible diagnostic, repair configuration and Reset or reload                                                       |

Capability discovery is optional for custom executors; older adapters remain
compatible. When present it runs within the same cancellable execution deadline
as session acquisition, after policy authorization. Discovery never grants
permissions. Direct callers of backend APIs should inspect capabilities too.

## Interactive semantics

The provided native backend is deterministic replay, not a persistent simulator
kernel. Every successful Step recompiles the source and replays all confirmed
input intervals from time zero. A new input value applies to the next interval;
the already-recorded clock edge at the preceding checkpoint keeps its old
input. Compiler/runtime cost grows with accumulated history. Failed or
cancelled steps do not commit history. Reset disposes the old session and
starts a fresh history at zero on the next step.

Run schedules bounded Steps; Pause stops future scheduling while allowing the
in-flight Step to complete. Step uses the visible inputs. Reset restores
declared initial values and time zero. The counter/register examples generate
an internal 10 ns clock for testing and are not synthesis inputs. The batch
counter uses a simulation testbench. Synthesizable multiplexer/adder examples
use separate `*-run` synthesis requests. Native replay supports simple
top-level digital ports, not arbitrary hierarchical forcing, inout/analog
behavior or general VPI/VHPI.

The viewer uses VCD ticks at the reported timescale, while the interactive
status uses nanoseconds. An Icarus recording with 1 fs ticks uses 10,000,000
ticks for 10 ns; that is a unit conversion, not extra simulation time.

The interactive profile supports 1–64-bit `0/1/x/z` inputs, integer nanosecond
advances, at most 1,000 native replay intervals and bounded source/VCD sizes.
Do not exceed the smaller backend limit by merely increasing engine maxSteps.
Use `hdl-stimuli-checks.md` for scheduled boundaries at 7 and 12 ns. Standalone
recordings and schematic exports remain usable without the compiler service.

## Production options

1. Publish clearly labelled precomputed VCD/netlist/WaveDrom results. These are
   recordings/diagrams, not live runs; keep interactive requests visibly
   blocked.
2. Supply and authorize a genuine browser/WASM executor, with documented
   supported language subsets and resource limits. This package does not
   provide one.
3. Provide an application-owned isolated simulation service. Use HTTPS and
   proper user authentication, per-user job ownership and quotas, isolated
   workers with CPU/memory/time/disk limits, filesystem/network restrictions,
   fixed tool paths, cancellation/cleanup, and compatible proxy streaming/CORS.
   Browser code must import `/hdl`, never `/hdl/node`. Keep secrets out of
   lessons and bundles.

The loopback development service and its shared bearer token are not a public
multi-user service or an OS sandbox. Markdown securityMode sanitizes rendering;
it does not sandbox native compilers or HDL file/process access. Removing
NODE_ENV checks solves neither tool availability nor production isolation.

## Reproduction

Run `npm run test:hdl:real` for actual compilers, not handwritten circuit
models. The audit inventory is eight plain source fences, eight batch requests
and ten interactive requests per language: 78 HDL fences across pt/en/es. Plain
source is separately compiled/synthesized as a validation operation; it remains
a non-executing presentation fence in the browser. See the final
[audit results](../hdl-audit-results.md) for tool versions, executed lessons,
checks and remaining validation limits.
