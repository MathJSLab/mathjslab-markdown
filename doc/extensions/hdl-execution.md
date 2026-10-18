# Application-owned HDL execution

The `hdl` extension accepts `vhdl-run` and `verilog-run` fences. Ordinary
`vhdl`, `verilog`, `vhd`, `sv` and `systemverilog` fences remain highlighted
source. No compiler, simulator, synthesis executable or service is bundled.
`features: "all"` does not register HDL execution: inject its executor
explicitly.

For concrete GHDL/Icarus/Yosys adapters and browser integration, see
[Real HDL backends](hdl-backends.md). Tool installation and isolation remain
the host's responsibility.

```ts
import { createEducationalMarkdownEngine } from "mathjslab-markdown";
import { hdlExtension, type HDLExecutor } from "mathjslab-markdown/extensions";

// Implement with your application's sandboxed toolchain or Worker adapter.
const executor: HDLExecutor = applicationHDLExecutor;
const engine = createEducationalMarkdownEngine({
    extensions: [hdlExtension(executor)],
    securityMode: "strict",
    executionPolicy: {
        hdl: { enabled: true, allowInRestrictedMode: true, timeoutMs: 30000 },
    },
});
```

Execution is disabled by default in every security mode. Strict and sanitized
documents additionally require `allowInRestrictedMode: true`. Prefer
authorizing only documents your application intends to execute. Engine
capabilities such as `network` do not authorize HDL execution or configure the
host's toolchain.

## Fence syntax

The body is strict JSON, independent of the compiler's command-line syntax:

```verilog-run {width=75%}
{
  "operation": "synthesize",
  "top": "gate",
  "standard": "2012",
  "files": [
    {
      "name": "gate.v",
      "source": "module gate(input a,b, output y);\nassign y = a & b;\nendmodule\n"
    }
  ]
}
```

Language comes from the opening fence. `operation` is `simulate` or
`synthesize`; `top` names the testbench or design. Files are passed in their
listed order and source strings are preserved exactly. Filenames are unique,
flat ASCII names, starting with a letter, digit or underscore, ending in
`.vhd`/`.vhdl` for VHDL or `.v`/`.sv` for Verilog. Paths, duplicate names,
unknown request fields, empty source and NUL characters are rejected. Top
identifiers use letters, digits and underscores, beginning with a letter or
underscore, at most 128 characters.

Optional VHDL standards are `93`, `02`, `08`, `19`; Verilog/SystemVerilog
standards are `2005`, `2012`, `2017`. The host maps these identifiers to its
toolchain and reports unsupported dialects. Simulation may specify a positive
finite `stopTimeNs`, at most 1e9. This is a requested simulation-time limit,
separate from the wall-clock `timeoutMs`. Synthesis rejects `stopTimeNs`.
Arbitrary compiler arguments, commands, URLs and shell scripts are not
accepted.

## Executor contract

`HDLExecutor.createSession(context)` creates an isolated session for one block.
`session.execute(request, context)` returns `HDLExecutionResult`, and the
required `session.dispose()` releases workers, processes and temporary files.
Both callbacks receive a cancellation signal, source URL and normal document
context. They may be asynchronous. Blocks may run concurrently under the
engine's `maxConcurrentRenders`; adapters must isolate their jobs.

The optional `vcd` result field accepts raw digital VCD. Return either `vcd` or
`waveform`, not both.

Results have `status: "success" | "error" | "cancelled"` and optional:

- `logs`: plain text, rendered without interpreting HTML.
- `diagnostics`: compiler messages with severity, message and optional source
  filename, line and column. Filenames must belong to the request. They appear
  in the block and flow through `onDiagnostic` as `hdl-compiler-diagnostic`.
  HDL locations are included in the message; the Markdown diagnostic location
  still identifies the executable fence.
- `waveform`: WaveJSON using the `signal` family, rendered by WaveDrom.
- `netlist`: the [supported Yosys JSON subset](netlist.md), rendered by
  netlistsvg.

The host converts simulator output (such as VCD) into WaveJSON and synthesis
output into Yosys JSON. Raw VCD can also be returned directly; see the
[VCD viewer](vcd.md). Results may contain both visual types. No raw HTML, SVG
or DOM output contract is provided. Existing renderer validation, sanitization,
style isolation and sizing still apply. Sizing attributes affect graphics; text
logs retain their typographic size. The renderer displays logs and diagnostics
even when the executor returns an error, alongside a preserved source fallback.

Sessions are disposed after execution, before final rendering, and on
cancellation or timeout, including sessions that finish creation after
cancellation. Document update, disposal and deferred rendering follow the
engine lifecycle. No output from an aborted execution is mounted. Disposal must
promptly terminate active jobs; a signal or JavaScript timeout alone cannot
stop a compiler running in the host. There is no caching or state sharing
between executable blocks.

The manifest opts into visible-mode deferral through `deferRendering: true`;
execution waits for visibility when the engine has an `IntersectionObserver`.
When that browser API is unavailable, normal eager rendering applies.

## Limits and host responsibilities

Default policy limits are 16 executable blocks, 256 KiB per request and 30
seconds per execution. Configure `maxBlocks`, `maxSourceBytes` and `timeoutMs`
in `executionPolicy.hdl`. Their ceilings are 128 blocks, 2 MiB and 300 seconds;
smaller engine source limits also apply. Requests contain at most 16 files.
Results are limited to 512 KiB, logs to 65,536 characters and diagnostics to
128 messages of at most 4,096 characters. WaveDrom and netlist limits apply
separately.

The application chooses GHDL, Icarus Verilog, Verilator, Yosys or another
backend, including any required language plugins. It owns compiler
availability, filesystem/process isolation, memory/CPU/output quotas,
simulation stop time, network policy and conversion of tool output. Do not
concatenate author data into shell commands. Pass validated filenames and top
names as separate arguments, and keep source inside an isolated job directory.
No automatic backend selection, installation or fallback service is performed
by this package.

Stable diagnostics include `hdl-execution-disabled`, `hdl-block-limit`,
`hdl-source-limit`, `hdl-compiler-diagnostic`, `hdl-execution-error`,
`hdl-execution-timeout`, `hdl-execution-cancelled` and `hdl-disposal-error`.

The [AND simulation](../../example/en/hdl-porta-and.md),
[multiplexer synthesis](../../example/en/hdl-multiplexador.md),
[adder synthesis](../../example/en/hdl-somador.md) and
[counter simulation](../../example/en/hdl-contador.md) lessons contain paired
VHDL and Verilog requests, with equivalent Portuguese and Spanish versions.
Automated package tests verify injected executors and real visual rendering.
Optional native backend tests compile the translated lessons with installed
GHDL, Icarus/VVP and Yosys; see [HDL backends](hdl-backends.md). Shared
execution queues and deadlines are documented in
[execution scheduling](../execution-scheduling.md).

See [incremental HDL results](../incremental-results.md) for optional progress,
log/VCD streaming, provisional previews and final-result compatibility.

See [inspection and local exports](../inspection-and-export.md) for available
files, host callbacks and format limits.

See [HDL setup and troubleshooting](hdl-troubleshooting.md) for browser/app
integration, deployment limits and the three-language audit.
