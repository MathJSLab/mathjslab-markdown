import { parseVCD, vcdValueAt } from './parser.js';

export type VCDCSVOptions = Readonly<{ signals?: readonly string[]; start?: number; end?: number }>;

/** Exact event rows plus window endpoints; bit strings preserve x/z and bus widths. */
export const exportVCDCSV = (source: string, options: VCDCSVOptions = {}): string => {
  const model = parseVCD(source);
  const start = options.start ?? 0,
    end = options.end ?? model.endTime;
  if (![start, end].every((time) => Number.isSafeInteger(time) && time >= 0 && time <= model.endTime) || start > end) throw new Error('Invalid CSV time window');
  if (options.signals && (new Set(options.signals).size !== options.signals.length || options.signals.some((name) => !model.signals.some((signal) => signal.name === name))))
    throw new Error('Invalid CSV signal selection');
  const selected = model.signals.filter((signal) => !options.signals || options.signals.includes(signal.name));
  if (!selected.length || selected.length > 32) throw new Error('CSV requires 1 to 32 signals');
  const times = new Set([start, end]);
  for (const signal of selected) for (const change of signal.changes) if (change.time >= start && change.time <= end) times.add(change.time);
  if (times.size > 4096) throw new Error('CSV exceeds 4096 rows; narrow the time window');
  const quote = (value: string): string => '"' + value.replace(/"/g, '""') + '"';
  const header = selected.map((signal) => (/^[=+@-]/.test(signal.name) ? "'" + signal.name : signal.name));
  const rows = [[`tick (${model.timescale.magnitude} ${model.timescale.unit})`, ...header].map(quote).join(',')];
  let bytes = new TextEncoder().encode(rows[0]!).byteLength + 2;
  for (const time of [...times].sort((a, b) => a - b)) {
    const row = [String(time), ...selected.map((signal) => vcdValueAt(signal, time))].map(quote).join(',');
    bytes += new TextEncoder().encode(row).byteLength + 2;
    if (bytes > 4 * 1024 * 1024) throw new Error('CSV exceeds 4 MiB; narrow the selection');
    rows.push(row);
  }
  return rows.join('\r\n') + '\r\n';
};
