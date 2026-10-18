export type NetlistBit = number | '0' | '1';
export type NetlistPort = { direction: 'input' | 'output'; bits: NetlistBit[] };
export type NetlistCell = {
  type: string;
  connections: Record<string, NetlistBit[]>;
  port_directions: Record<string, 'input' | 'output'>;
  attributes?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
};
export type NetlistModule = { ports: Record<string, NetlistPort>; cells: Record<string, NetlistCell>; attributes?: Record<string, unknown>; netnames?: Record<string, unknown> };
export type YosysNetlist = { modules: Record<string, NetlistModule> };
export type MarkdownNetlistInput = YosysNetlist | { top: string; netlist: YosysNetlist };

const object = (value: unknown, name: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name} must be an object`);
  return value as Record<string, unknown>;
};
const name = (value: string): void => {
  if (!value.length || value.length > 256 || /[<>&"'\u0000-\u001f]/.test(value)) throw new Error('Netlist names must be nonempty plain text, at most 256 characters, without XML markup');
};
const direction = (value: unknown): 'input' | 'output' => {
  if (value !== 'input' && value !== 'output') throw new Error('Netlist directions must be input or output; bidirectional ports are unsupported');
  return value;
};

/** Validate untrusted JSON and pass only the selected circuit to the renderer. */
export const validateNetlist = (value: unknown): { top: string; netlist: YosysNetlist } => {
  let nodes = 0;
  const visit = (item: unknown, depth: number): void => {
    if (++nodes > 30_000 || depth > 24) throw new Error('Netlist exceeds structural limits');
    if (typeof item === 'string' && item.length > 4096) throw new Error('Netlist string exceeds length limit');
    if (typeof item === 'number' && !Number.isFinite(item)) throw new Error('Netlist numbers must be finite');
    if (item && typeof item === 'object')
      for (const [key, child] of Object.entries(item)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error(`Unsupported netlist key: ${key}`);
        visit(child, depth + 1);
      }
  };
  visit(value, 0);
  const input = object(value, 'Netlist');
  const data = object(Object.hasOwn(input, 'netlist') ? input.netlist : input, 'Yosys netlist');
  const modules = object(data.modules, 'modules');
  const keys = Object.keys(modules);
  if (!keys.length || keys.length > 16) throw new Error('Netlist requires 1 to 16 modules');
  keys.forEach(name);
  let top: string;
  if (Object.hasOwn(input, 'netlist')) {
    if (typeof input.top !== 'string') throw new Error('Netlist envelope requires a top module name');
    top = input.top;
  } else {
    const marked = keys.filter((key) => Number(object(modules[key], 'module').attributes && object(object(modules[key], 'module').attributes, 'attributes').top) === 1);
    if (marked.length > 1 || (!marked.length && keys.length !== 1)) throw new Error('Ambiguous top module; use {top, netlist} or one top attribute');
    top = marked[0] ?? keys[0]!;
  }
  if (!Object.hasOwn(modules, top)) throw new Error(`Unknown top module: ${top}`);
  const selected = object(modules[top], 'top module');
  let pins = 0;
  const bits = (value: unknown): NetlistBit[] => {
    if (!Array.isArray(value) || !value.length || value.length > 256) throw new Error('Netlist ports require 1 to 256 bits');
    pins += value.length;
    if (pins > 8192) throw new Error('Netlist exceeds 8192 connected bits');
    for (const bit of value)
      if (!(typeof bit === 'number' && Number.isInteger(bit) && bit >= 2 && bit <= 1_000_000) && !['0', '1'].includes(bit))
        throw new Error('Invalid netlist bit ID or constant (supported: 0, 1)');
    return value as NetlistBit[];
  };
  const ports: Record<string, NetlistPort> = {};
  const inputPorts = object(selected.ports, 'ports');
  if (Object.keys(inputPorts).length > 128) throw new Error('Netlist exceeds 128 module ports');
  for (const [key, raw] of Object.entries(inputPorts)) {
    name(key);
    const port = object(raw, 'port');
    ports[key] = { direction: direction(port.direction), bits: bits(port.bits) };
  }
  const cells: Record<string, NetlistCell> = {};
  const inputCells = object(selected.cells, 'cells');
  if (Object.keys(inputCells).length > 128) throw new Error('Netlist exceeds 128 cells');
  if (!Object.keys(inputCells).length && !Object.keys(ports).length) throw new Error('Netlist circuit is empty');
  for (const [key, raw] of Object.entries(inputCells)) {
    name(key);
    const cell = object(raw, 'cell');
    if (typeof cell.type !== 'string') throw new Error('Cell type must be a string');
    name(cell.type);
    const rawConnections = object(cell.connections, 'connections');
    const rawDirections = object(cell.port_directions, 'port_directions');
    if (!Object.keys(rawConnections).length || Object.keys(rawConnections).length > 32) throw new Error('Cells require 1 to 32 ports');
    const connections: Record<string, NetlistBit[]> = {};
    const directions: Record<string, 'input' | 'output'> = {};
    for (const [pin, values] of Object.entries(rawConnections)) {
      name(pin);
      connections[pin] = bits(values);
      directions[pin] = direction(rawDirections[pin]);
    }
    cells[key] = { type: cell.type, connections, port_directions: directions, attributes: {}, parameters: {} };
  }
  return { top, netlist: { modules: { [top]: { ports, cells, attributes: { top: 1 }, netnames: {} } } } };
};
