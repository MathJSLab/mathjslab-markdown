# Interactive HDL simulation through a host session

Register `hdlInteractiveExtension(executor)` from
`mathjslab-markdown/extensions`. The optional
`HDLExecutor.createInteractiveSession` method supplies the stateful backend;
interactive-only adapter objects are also accepted by this factory. Batch-only
executors remain compatible. This extension is not automatically registered by
`features: "all"`.

The optional [real HDL backend](hdl-backends.md) implements this contract
through deterministic replay with actual GHDL/Icarus compilation. Its
capabilities distinguish replay from a persistent simulator kernel.

```ts
const engine = createEducationalMarkdownEngine({
    extensions: [hdlInteractiveExtension(applicationHDLExecutor)],
    securityMode: "strict",
    executionPolicy: {
        "hdl-interactive": {
            enabled: true,
            allowInRestrictedMode: true,
            timeoutMs: 30000,
            maxSteps: 1000,
        },
    },
});
```

The policy is separate from `executionPolicy.hdl`: batch authorization alone
does not enable interactive execution. Strict/sanitized modes require explicit
restricted-mode authorization too. No compiler, simulator, service or browser
Worker adapter is bundled. The host owns tool installation, sandboxing, signal
binding and transport. Rendering the controls does not execute HDL.

## Syntax

```verilog-live
{
  "top": "gate",
  "files": [{"name": "gate.v", "source": "module gate(input a,b,output y); assign y=a&b; endmodule"}],
  "inputs": [{"name": "a", "width": 1, "initial": "0"},
             {"name": "b", "width": 1, "initial": "1"}],
  "outputs": [{"name": "y", "width": 1}],
  "stepNs": 10,
  "stopTimeNs": 1000
}
```

Use `vhdl-live` for VHDL. The file, top and optional standard rules match
[batch HDL](hdl-execution.md); operation defaults to `simulate` and synthesis
is rejected. Inputs/outputs are explicit top-level or dotted hierarchical
signal names. Names use ASCII letters, digits, underscores and dots, beginning
with a letter/underscore. Reserved prototype names and duplicate/overlapping
names are rejected. The host validates that the declared signals exist, have
the specified direction and width, and can be driven/observed by its simulator.

Input values are exactly `width` bits using `0/1/x/z`. One-bit inputs use a
dropdown; buses use text fields. Outputs are read-only current values. The
source is not edited or recompiled when changing an input. Edits are applied at
the next step; the host must settle the design after applying them. Sequential
designs need a clock in their testbench or an appropriate host clock source.
Advancing time does not invent clock edges for a held input.

Run repeatedly advances time in bounded batches; Step advances one batch. Pause
stops scheduling new batches, preserving the session; the in-flight batch may
finish. Reset cancels and disposes the old session, clears results, and
restores initial inputs. A new session is created on the next Run/Step.
Controls are localized in English, Portuguese and Spanish. They remain normal
HTML controls under fence sizing, such as
`verilog-live {width=75% height=20rem}`. Visible-mode rendering defers
controls; compilation still waits for a click.

## Stateful executor

`createInteractiveSession(request, context)` creates/compiles an isolated
simulation session. `session.step({advanceNs, inputs}, context)` applies input
values at the current simulation time, settles the design, then advances by the
requested nanoseconds. Return `HDLInteractiveResult`:

```ts
{ timeNs: 10, values: { y: "1" }, logs: "optional text", vcd: optionalRecording }
```

All declared outputs must be present at their exact widths. `timeNs` must be a
nonnegative safe integer, reaching the requested target unless `finished` is
true; an early final result may be between the old and target times.
`finished: true` stops playback. One block never overlaps backend calls. Blocks
may run independently/concurrently, so adapters must isolate sessions. The
optional VCD is a complete bounded recording, not an incremental fragment; it
uses the [VCD viewer](vcd.md) for history inspection. Its cursor does not
rewind the simulator. Logs are text, never HTML. No raw DOM/SVG output is
accepted.

The required `dispose()` must promptly terminate workers/processes and release
resources. Reset, document update/disposal, cancellation and terminal errors
abort its context signal and dispose the session. Late-created sessions are
also disposed, without stepping or mounting stale results. Paused/completed
sessions remain owned by the block until reset/disposal, retaining state. An
unresponsive host cannot be forcibly terminated by a JavaScript timeout; the
host must honor cancellation and disposal. Backend errors disable Run/Step
until Reset. Missing interactive support preserves source with a diagnostic.

## Limits

Defaults: 8 blocks, 256 KiB request, 30 seconds per create/step operation, 1000
steps per session. Configure `maxBlocks`, `maxSourceBytes`, `timeoutMs` and
`maxSteps` (or legacy `maxStatements`) in the interactive policy; ceilings are
64 blocks, 2 MiB, 300 seconds and 10000 steps. Smaller source limits apply.
Reset resets the step quota, not the document block quota. Run waits 50 ms
between completed batches, preventing an unbounded synchronous loop; this is
playback pacing, not a real-time simulator guarantee.

At most 16 inputs and 64 outputs, each 1–64 bits, are accepted. `stepNs` is an
integer from 1 to 1000000, default 10. Optional `stopTimeNs` is a positive
integer at most 1e9; batches shorten at the endpoint. Without it the endpoint
is 1e9 ns, additionally limited by the step quota. Each result is at most 512
KiB, logs at most 65536 characters, with VCD limits applied separately. No
author-supplied commands, tool arguments, URLs or automatic backend are used.

Public types: `HDLInteractiveRequest`, `HDLInteractiveInput`,
`HDLInteractiveSignal`, `HDLInteractiveStep`, `HDLInteractiveResult` and
`HDLInteractiveSession`. Diagnostics include `hdl-interactive-disabled`,
`hdl-interactive-error`, `hdl-interactive-timeout` and
`hdl-interactive-disposal-error`; configuration failures use the usual
`extension-render-error`, with Markdown source location.

Translated [AND](../../example/en/hdl-live-and.md),
[multiplexer](../../example/en/hdl-live-mux.md),
[counter](../../example/en/hdl-live-counter.md) and
[register](../../example/en/hdl-live-register.md) lessons contain paired VHDL
and Verilog requests. Sequential examples use simulation-only internal clocks.
Tests exercise a stateful digital model in a real Worker. Optional native
backend tests also run the translated examples with GHDL and Icarus/VVP; see
[HDL backends](hdl-backends.md). For shared concurrency, queue limits and
cleanup guarantees, see [execution scheduling](../execution-scheduling.md).

See [incremental HDL results](../incremental-results.md) for optional progress,
log/VCD streaming, provisional previews and final-result compatibility.

## Scripted stimuli and checks

The engine can orchestrate a bounded timeline in either `vhdl-live` or
`verilog-live`. Add these optional fields alongside `inputs`, `outputs` and
`stepNs`:

```json
{
    "stimuli": [
        { "timeNs": 0, "inputs": { "a": "1" } },
        { "timeNs": 7, "inputs": { "a": "0" } }
    ],
    "checks": [
        { "id": "on", "timeNs": 7, "signal": "y", "expected": "1" },
        { "id": "off", "timeNs": 12, "signal": "y", "expected": "0" }
    ]
}
```

With `b.initial = "1"`, `stepNs = 10` and `stopTimeNs = 12`, an AND gate
advances first to 7 ns and then to 12 ns. Run schedules both advances; Step
executes one. Checks at a boundary observe the completed preceding interval.
The stimulus at 7 ns is applied when starting the next interval, after the
check at 7 ns. Simulator delta-cycle and clock-edge semantics remain the
backend's responsibility; a timed input change does not imply a clock edge.

Stimulus times are strictly increasing nonnegative integer nanoseconds, below
`stopTimeNs` (default ceiling: 1,000,000,000 ns). Each entry changes one or
more declared inputs; omitted inputs retain their preceding values. Inputs
appearing anywhere in the script have disabled manual controls for the entire
run. Other inputs remain manually editable. Time-zero stimuli override initial
values.

Checks use positive integer times up to and including `stopTimeNs`, ordered by
time; multiple checks may share a time. Each has a unique ASCII identifier
starting with a letter (letters, digits, underscores and hyphens; 64 characters
maximum), a declared output name, and an exact-width expected bit string.
Comparison is literal four-state equality: `x` and `z` are states, not
wildcards. Both timelines allow at most 256 entries each. Unknown fields,
invalid signal names, widths, values, times and duplicate IDs are rejected
before execution. No JavaScript expressions or arbitrary HDL snippets are
evaluated as checks.

A result table reports pending, passed, failed and not-run checks, with
expected and actual states. A mismatch emits warning diagnostic
`hdl-check-failed` and does not stop subsequent checks. Evaluation occurs only
after a final validated step result, never from incremental previews. Early
completion, execution errors or the step quota mark unreached checks as not
run. Reset clears all results and restarts the timeline. Cancellation/disposal
retains the existing lifecycle. Every boundary counts against
`executionPolicy['hdl-interactive'].maxSteps`; choose that quota to cover the
planned intervals.

The public `HDLStimulus` and `HDLCheck` types are exported from the extensions,
HDL and Node HDL entries. `HDLInteractiveRequest` carries optional `stimuli`
and `checks`. Orchestration and comparison belong to the Markdown extension:
direct calls to `createInteractiveSession().step()` continue to apply only
their explicit inputs and advances. The native and HTTP adapters need no new
simulator commands. Existing requests without timelines retain their behavior.

Complete examples for both HDL languages are available in the corresponding
[English](../../example/en/hdl-stimuli-checks.md),
[Portuguese](../../example/pt/hdl-stimuli-checks.md) and
[Spanish](../../example/es/hdl-stimuli-checks.md) lessons.

See [inspection and local exports](../inspection-and-export.md) for available
files, host callbacks and format limits.
