# HDL inspection and local export

The VCD, netlist, batch HDL and interactive HDL extensions provide local,
user-triggered exports. They do not execute another simulation, contact a
service or upload results. Interactive exports describe confirmed steps;
incremental VCD previews have inspection controls but no export buttons.

## Inspecting a recording

- Search signal names using a literal, case-insensitive substring. Search only
  filters the signal list; it does not change selected signals or exported
  data.
- Select a navigation signal and use Previous/Next transition to move the first
  cursor to its preceding/following value change inside the current window.
  Unselected signals cannot be navigated. Repeated equal samples are skipped;
  same-tick changes retain the parser's existing last-value semantics.
- Set Cursor and Cursor B to inspect held values at two integer ticks. Their
  signed difference is shown in ticks and the recording's exact timescale unit.
  The second cursor uses a dashed line. Window changes clamp both cursors;
  Reset restores the full window and both cursors to zero.
- Radix offers binary, hex, unsigned decimal and signed decimal. Signed values
  use two's complement at the declared width, including single-bit signals.
  Known values use BigInt; mixed `x`/`z` strings always remain binary.

These choices work with responsive sizing, Shadow DOM and incremental preview
restoration. Start/End define the window. The existing 32-signal and
4,096-segment visual limits still apply. Batch result inspection remains active
after compiler sessions are released and ends when the document is disposed.

## Available files

| Location                                | Exports                                                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| VCD recording or confirmed HDL waveform | Original complete VCD; selected signals/window as CSV; current visible waveform as standalone SVG                                  |
| Netlist                                 | Original netlist JSON; sanitized schematic SVG                                                                                     |
| Batch HDL                               | Versioned JSON result, optional log TXT, optional netlist JSON or WaveDrom SVG; VCD/netlist viewers also provide their own exports |
| Interactive HDL                         | Versioned JSON session report and latest confirmed log TXT; confirmed VCD viewer provides VCD/CSV/SVG                              |

SVG files contain graphics only, retain the viewBox proportions, and remove
Markdown sizing CSS from the SVG root. Netlist SVG keeps the sanitized bundled
skin; VCD SVG includes its background, labels and both cursors. No SVG is
available for a zero-duration recording or an invalid/dense visible window.

CSV uses quoted UTF-8 fields and CRLF rows. The first column is an integer tick
with the timescale in its heading. Remaining columns use exact-width binary
strings, including leading zeros, `x` and `z`, regardless of the visible radix.
Rows contain the window endpoints and every selected-signal event within the
window, using held values at each time. No resampling or truncation occurs.
Aliases remain separate columns. Formula-like signal headings receive an
apostrophe prefix for spreadsheet safety. Import bit-string columns as text in
spreadsheet programs to preserve leading zeros and long buses.

CSV supports 1–32 distinct signals, at most 4,096 data rows, and 4 MiB of UTF-8
text. All downloads have the same 4 MiB ceiling; oversized exports produce
`hdl-export-error` without a partial file. Reduce the window/selection for CSV.
Original VCD export is independent of selection/window and preserves its text.

## Host integration

The default action creates a local Blob download with a fixed filename. URLs
are revoked after the browser has consumed the click and on document disposal.
Buttons and listeners are removed during update/disposal. No new execution or
network permission is required to export already rendered data.

Applications can intercept downloads using the synchronous context callback:

```ts
import type { HDLArtifact } from "mathjslab-markdown";

await engine.renderDocument(source, container, {
    onHDLExport(artifact: HDLArtifact) {
        // Save locally through the application's own file UI.
        saveTextFile(artifact.filename, artifact.mediaType, artifact.text);
    },
});
```

`HDLArtifact` is a readonly `{filename, mediaType, text}` value, exported from
core, extensions, HDL and Node HDL entries. Supplying `onHDLExport` replaces
the default download. Handler failures become warning diagnostic
`hdl-export-error`. The callback only runs after a user clicks an enabled
export button.

For non-DOM CSV use:

```ts
import { exportVCDCSV } from "mathjslab-markdown/extensions";

const csv = exportVCDCSV(recording, {
    signals: ["tb.clock", "tb.data[3:0]"],
    start: 10,
    end: 100,
});
```

`VCDCSVOptions` is public. Omitted options select the full recording and all
signals, subject to the same limits. Invalid options throw; the UI catches and
reports those errors.

## JSON reports

Reports have `schemaVersion: 1`. Batch reports contain `language`, `top` and
the final `result`, including compiler diagnostics and logs. Compilation errors
also allow JSON/TXT export. Invalid execution responses are not exported.

Interactive reports contain language/top, declared inputs/outputs, step and
stop times, current time, step count, state (`ready`, `paused`, `finished` or
`error`), configured stimuli, committed input history and all check results.
Each history entry has `startNs`, `endNs` and the input values used. Each check
retains its ID, time, signal and expected value plus `status` (`pending`,
`passed`, `failed`, `not-run`) and `actual` only when evaluated. The optional
`result` is the latest confirmed step, including its available VCD and logs.
`HDLCheckResult` is exported as a public type.

Exports are disabled while interactive work is running, queued or resetting.
Pause allows export once the in-flight step completes. Before the first step,
JSON describes the ready plan; TXT waits for a confirmed result. Reset clears
history, check outcomes and the previous result. Execution errors can export
previous confirmed results with error state, an error message and unreached
checks. Progress, partial logs and partial VCD never replace the confirmed
snapshot.

This is an inspection/export format, not a session restore protocol. HDL source
files, native process state, credentials and service configuration are not
included. Existing HDL fences and backend request/result contracts remain
compatible.
