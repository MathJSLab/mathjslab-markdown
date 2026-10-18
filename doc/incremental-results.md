# Incremental HDL results

HDL executors can publish ordered updates while `execute()` or `step()` is
pending. Existing synchronous/promise final results remain compatible. No
Markdown fence syntax or lesson content changes are required.

## Public contract

`HDLExecutionUpdate` is exported as a type from the core, extensions, HDL and
Node HDL entries. `MarkdownDocumentContext.onHDLUpdate` is an optional
synchronous observer:

```ts
type HDLExecutionUpdate =
    | Readonly<{ type: "progress"; phase: string }>
    | Readonly<{ type: "log"; text: string }>
    | Readonly<{ type: "vcd"; text: string }>;

// Inside a host adapter's execute() or step():
context.onHDLUpdate?.({ type: "progress", phase: "simulate" });
context.onHDLUpdate?.({ type: "log", text: "simulation started\n" });
context.onHDLUpdate?.({ type: "vcd", text: nextVCDChunk });
```

Log and VCD text append in arrival order within one action. A VCD stream starts
with its header; subsequent chunks continue the same record and may split
tokens. Each interactive action starts a fresh channel, so a replay header is
never appended to a previous step's header. Known phases are `compile`,
`elaborate`, `simulate` and `synthesize`; display labels are localized in
English, Brazilian Portuguese and Spanish. Custom phases display as plain text.

The engine observes its HDL fences automatically. Applications may also use
`renderDocument(source, container, { onHDLUpdate })`, or supply the observer in
a direct executor call. Factory contexts omit this action-scoped observer, so
retained sessions do not retain completed presentation callbacks. Emit no
updates after the action settles and honor its abort signal.

## Preview and final result

Logs display immediately as plain text. VCD previews coalesce redraws every 50
ms with at most one rendering in flight. Complete lines and parseable prefixes
display; incomplete headers wait. Signal selection, cursor, radix and narrowed
windows survive updates and final replacement. The default window end follows
the growing recording. Sizing and Shadow DOM remain supported.

Updates are provisional. Return the full final result normally, including
complete VCD/logs, compiler diagnostics and status: chunks do not replace these
fields. Only final validation commits interactive time, output values and the
successful-step counter. WaveDrom and netlists render from final results.

Cancel, Reset, update and disposal close observers, cancel preview timers and
discard stale updates/results. Execution slots still belong to the session
through asynchronous cleanup. Invalid update shapes or exceeded budgets fail
the action even if a producer catches the observer's exception and returns
success. No new alignment, sizing, or author-supplied executable syntax is
added.

## Limits and HTTP compatibility

Each action accepts at most 4096 updates and 2 MiB of serialized update data.
Phases support 128 characters; individual log/VCD chunks support 65536
characters. Accumulated logs are limited to 64 KiB of UTF-8 and VCD to 512 KiB
of UTF-8. Additional update fields are rejected. Final limits are unchanged.

For observed actions the HTTP adapter requests `Accept: application/x-ndjson`.
The host streams numbered newline-delimited JSON:

```json
{"sequence":1,"type":"update","update":{"type":"progress","phase":"simulate"}}
{"sequence":2,"type":"update","update":{"type":"log","text":"started\n"}}
{"sequence":3,"type":"result","result":{"status":"success","logs":"started\n"}}
```

Sequence numbers start at 1 and increase by one. Exactly one terminal `result`
or `error` is required. A failure after headers uses
`{ "sequence": n, "type": "error", "error": "message" }`; failures before
headers preserve the existing HTTP/JSON status and diagnostic code.

Frames are parsed as bytes arrive, preserving split UTF-8. Gaps, duplicates,
out-of-order frames, trailing updates and EOF without a result are rejected.
Readers are cancelled on failure, propagating disconnect cancellation to the
host. Frames and outstanding server buffers have a 2 MiB limit; exceeding
backpressure capacity fails rather than buffering indefinitely. Total stream
responses have a 4 MiB limit, including the full final result.

Without an observer the original JSON protocol is used. Legacy JSON responses
to update requests also remain accepted. Authentication, origins, session
quotas and shared scheduling are unchanged.

## Native backends

GHDL, Icarus/VVP and Yosys publish phases and decoded logs. Batch simulation
follows its growing VCD file every 100 ms without overlapping reads, sending
the final tail before completion. Arrival depends on tool flush behavior;
sampling is not wall-clock real-time simulation or one event per simulated
tick.

Interactive execution remains deterministic replay. Logs/progress arrive during
compilation/execution. VCD chunks arrive after checkpoint validation and
removal of the private Verilog drain tick, and represent that step's full
replay history. This does not add a persistent simulation kernel. Observer
failure or cancellation prevents committing a replay step.

Native capabilities optionally advertise `updates: ["progress", "log", "vcd"]`.
Older backends may omit this field. Stimulus sequences, assertions and further
inspection/export remain subsequent stages.
