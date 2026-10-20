export type VCDChange = Readonly<{ time: number; value: string }>;
export type VCDSignal = Readonly<{ name: string; id: string; width: number; changes: readonly VCDChange[] }>;
export type VCDDocument = Readonly<{
  timescale: Readonly<{ magnitude: number; unit: 's' | 'ms' | 'us' | 'ns' | 'ps' | 'fs' }>;
  signals: readonly VCDSignal[];
  endTime: number;
  sameTimeChanges: number;
}>;

/** Bounded digital VCD subset. Times are exact safe-integer ticks, never resampled. */
export const parseVCD = (source: string): VCDDocument => {
  if (typeof source !== 'string' || new TextEncoder().encode(source).byteLength > 512 * 1024) throw new Error('VCD source limit is 512 KiB');
  const tokens = source.match(/\S+/g) ?? [];
  if (tokens.length > 100_000) throw new Error('VCD token limit exceeded');
  let index = 0;
  const next = (): string => {
    const token = tokens[index++];
    if (token === undefined) throw new Error('Unexpected end of VCD');
    return token;
  };
  const block = (): string[] => {
    const values: string[] = [];
    for (let token = next(); token !== '$end'; token = next()) values.push(token);
    return values;
  };
  const label = (text: string): string => {
    if (!text || text.length > 512 || /[\u0000-\u001f]/.test(text)) throw new Error('Invalid VCD label');
    return text;
  };
  const scopes: string[] = [];
  const signals: VCDSignal[] = [];
  const names = new Set<string>();
  const ids = new Map<string, { width: number; changes: VCDChange[]; lastTime?: number; lastValue?: string }>();
  let timescale: VCDDocument['timescale'] | undefined;
  let defined = false;
  while (index < tokens.length && !defined) {
    const command = next();
    const values = block();
    if (['$date', '$version', '$comment'].includes(command)) continue;
    if (command === '$timescale') {
      const match = /^(1|10|100)(s|ms|us|ns|ps|fs)$/.exec(values.join(''));
      if (!match || timescale) throw new Error('VCD requires one valid timescale');
      timescale = { magnitude: Number(match[1]), unit: match[2] as VCDDocument['timescale']['unit'] };
    } else if (command === '$scope') {
      if (values.length !== 2 || !['module', 'task', 'function', 'begin', 'fork'].includes(values[0]!) || scopes.length >= 32) throw new Error('Invalid VCD scope');
      scopes.push(label(values[1]!));
    } else if (command === '$upscope') {
      if (values.length || !scopes.pop()) throw new Error('Unbalanced VCD scope');
    } else if (command === '$var') {
      const [kind, size, id, reference, range] = values;
      if (
        values.length < 4 ||
        values.length > 5 ||
        !['wire', 'reg', 'logic', 'integer', 'time', 'tri', 'tri0', 'tri1', 'wand', 'wor', 'supply0', 'supply1', 'trireg', 'triand', 'trior'].includes(kind!)
      )
        throw new Error('Unsupported VCD variable type');
      const width = Number(size);
      if (!/^\d+$/.test(size!) || !Number.isInteger(width) || width < 1 || width > 256 || !/^[!-~]{1,64}$/.test(id!) || (range !== undefined && !/^\[-?\d+(?::-?\d+)?\]$/.test(range)))
        throw new Error('Invalid VCD variable');
      const name = label([...scopes, label(reference!) + (range ?? '')].join('.'));
      if (signals.length >= 128 || names.has(name)) throw new Error('VCD signal count or duplicate-name limit exceeded');
      let data = ids.get(id!);
      if (data && data.width !== width) throw new Error('VCD aliases must have the same width');
      if (!data) {
        data = { width, changes: [] };
        ids.set(id!, data);
      }
      signals.push({ name, id: id!, width, changes: data.changes });
      names.add(name);
    } else if (command === '$enddefinitions') {
      if (values.length || scopes.length || !timescale) throw new Error('Incomplete VCD definitions');
      defined = true;
    } else throw new Error(`Unsupported VCD header directive: ${command}`);
  }
  if (!defined || !timescale) throw new Error('Missing VCD definitions or timescale');
  let time = 0;
  let events = 0;
  let sameTimeChanges = 0;
  let dumping = false;
  while (index < tokens.length) {
    const token = next();
    if (token === '$comment') {
      block();
      continue;
    }
    if (['$dumpvars', '$dumpall', '$dumpon', '$dumpoff'].includes(token)) {
      if (dumping) throw new Error('Nested VCD dump directive');
      dumping = true;
      continue;
    }
    if (token === '$end') {
      if (!dumping) throw new Error('Unexpected VCD end');
      dumping = false;
      continue;
    }
    if (token.startsWith('#')) {
      const value = Number(token.slice(1));
      if (dumping || !/^#\d+$/.test(token) || !Number.isSafeInteger(value) || value < time) throw new Error('VCD timestamps must be monotonic safe integers');
      time = value;
      continue;
    }
    let id: string;
    let value: string;
    if (/^[01xXzZ].+$/.test(token)) {
      value = token[0]!.toLowerCase();
      id = token.slice(1);
    } else if (/^[bB][01xXzZ]+$/.test(token)) {
      value = token.slice(1).toLowerCase();
      id = next();
    } else throw new Error('Unsupported VCD value change (digital scalar/vector only)');
    const data = ids.get(id);
    if (!data || value.length > data.width || ++events > 32768) throw new Error('Unknown VCD identifier, oversized value or event limit exceeded');
    if (!/^[bB]/.test(token) && data.width !== 1) throw new Error('Scalar VCD changes require a one-bit signal');
    value = value.padStart(data.width, value[0] === 'x' || value[0] === 'z' ? value[0] : '0');
    const last = data.changes.at(-1);
    if (data.lastTime === time && data.lastValue !== value) sameTimeChanges++;
    data.lastTime = time;
    data.lastValue = value;
    if (last?.time === time) {
      data.changes[data.changes.length - 1] = { time, value };
    } else if (last?.value !== value) data.changes.push({ time, value });
  }
  if (dumping) throw new Error('Unterminated VCD dump directive');
  return { timescale, signals, endTime: time, sameTimeChanges };
};

export const vcdValueAt = (signal: VCDSignal, time: number): string => {
  if (!Number.isSafeInteger(time) || time < 0) throw new Error('VCD cursor must be a nonnegative safe integer');
  let low = 0;
  let high = signal.changes.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (signal.changes[middle]!.time <= time) low = middle + 1;
    else high = middle;
  }
  return low ? signal.changes[low - 1]!.value : 'x'.repeat(signal.width);
};
