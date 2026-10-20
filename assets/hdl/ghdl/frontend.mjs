// Adapted from cachanova/synth-explorer, Apache-2.0; see NOTICE.md and APACHE-2.0.
// Host bindings only. All VHDL analysis/elaboration/synthesis is real GHDL Wasm.
import { unpackLibraries, verifiedBytes } from './resources.mjs';
const libraryRoot = '/ghdl/lib/ghdl';
const workDirectory = '/work';
const decoder = new TextDecoder('latin1');
const encoder = new TextEncoder();
const loadModule = async () => WebAssembly.compile(await verifiedBytes('ghdl-synth.wasm', '245664fcd1cbb1200627d9b566e90da3e54188447fabb38b2c9fe469a59eb57e'));
const loadLibraries = async () => unpackLibraries(await verifiedBytes('libraries.tar.gz', 'e67ca499db3ae429c382b1cc5c91775eb292918e2f7008daee29a995c6f2874a'));
export async function synthesizeVHDL(request) {
  const [module, libraries] = await Promise.all([loadModule(), loadLibraries()]);
  const fs = new VirtualFileSystem();
  for (const [name, contents] of libraries) {
    fs.add(`${libraryRoot}/${name}`, contents);
  }
  for (const file of request.files) {
    const contents = encoder.encode(file.source);
    fs.add(file.name, contents);
    fs.add(`${workDirectory}/${file.name}`, contents);
  }
  let memory;
  let instance;
  let outputBytes = 0;
  const stdout = [];
  const stderr = [];
  const bytes = () => new Uint8Array(memory.buffer);
  const view = () => new DataView(memory.buffer);
  const emit = (fd, contents) => {
    const chunk = typeof contents === 'string' ? encoder.encode(contents) : contents.slice();
    outputBytes += chunk.length;
    if (outputBytes > 512 * 1024) throw new Error('GHDL output exceeds 512 KiB');
    (fd === 2 ? stderr : stdout).push(chunk);
  };
  const cString = (pointer) => {
    if (!pointer) return '';
    const data = bytes();
    let end = pointer;
    while (data[end]) end += 1;
    return decoder.decode(data.subarray(pointer, end));
  };
  const fatString = (dataPointer, boundsPointer) => {
    const first = view().getInt32(boundsPointer, true);
    const last = view().getInt32(boundsPointer + 4, true);
    return last < first ? '' : decoder.decode(bytes().subarray(dataPointer, dataPointer + last - first + 1));
  };
  const writeFatString = (dataPointer, boundsPointer, value) => {
    bytes().set(encoder.encode(value), dataPointer);
    view().setInt32(boundsPointer, 1, true);
    view().setInt32(boundsPointer + 4, value.length, true);
  };
  const allocatedSize = (pointer) => {
    if (!pointer) return 0;
    const base = pointer - 16;
    const next = view().getUint32(base + 4, true);
    return (next & ~1) - base - 16;
  };
  const env = {
    strlen: (pointer) => {
      const data = bytes();
      let length = 0;
      while (data[pointer + length]) length += 1;
      return length;
    },
    strcmp: (left, right) => {
      const data = bytes();
      for (let index = 0; ; index += 1) {
        const difference = data[left + index] - data[right + index];
        if (difference) return difference;
        if (!data[left + index]) return 0;
      }
    },
    realloc: (pointer, size) => {
      const exports = instance.exports;
      if (!pointer) return exports.malloc(size);
      if (!size) {
        exports.free(pointer);
        return 0;
      }
      const oldSize = allocatedSize(pointer);
      const next = exports.malloc(size);
      if (!next) return 0;
      bytes().copyWithin(next, pointer, pointer + Math.min(oldSize, size));
      exports.free(pointer);
      return next;
    },
    fopen: (pathPointer) => {
      const descriptor = fs.open(cString(pathPointer));
      return descriptor < 0 ? 0 : descriptor;
    },
    fclose: (fd) => {
      fs.close(fd);
      return 0;
    },
    fread: (pointer, size, count, fd) => {
      const read = fs.read(fd, bytes().subarray(pointer, pointer + size * count));
      return read < 0 ? 0 : Math.floor(read / size);
    },
    fwrite: (pointer, size, count, fd) => {
      emit(fd, bytes().subarray(pointer, pointer + size * count));
      return count;
    },
    fputs: (pointer, fd) => {
      const value = cString(pointer);
      emit(fd, value);
      return value.length;
    },
    fflush: () => 0,
    ungetc: (character, fd) => fs.unread(fd, character),
    getc_unlocked: (fd) => fs.readByte(fd),
    feof_unlocked: (fd) => (fs.eof(fd) ? 1 : 0),
    putc_unlocked: (character, fd) => {
      emit(fd, new Uint8Array([character & 0xff]));
      return character;
    },
    __ghdl_get_stdout: () => 1,
    __ghdl_get_stderr: () => 2,
    __ghdl_get_stdin: () => 0,
    __ghdl_fprintf_g: (fd, value) => emit(fd, String(value)),
    __ghdl_snprintf_fmtf: (pointer, length, _format, value) => {
      const text = String(value).slice(0, length - 1);
      bytes().set(encoder.encode(text), pointer);
      bytes()[pointer + text.length] = 0;
    },
    isatty: () => 0,
    getenv: () => 0,
    gnat__os_lib__is_regular_file: (pointer, bounds) => (fs.has(fatString(pointer, bounds)) ? 1 : 0),
    gnat__os_lib__is_absolute_path: (pointer, bounds) => (fatString(pointer, bounds).startsWith('/') ? 1 : 0),
    gnat__os_lib__is_executable_file: () => 0,
    gnat__os_lib__is_directory: (pointer, bounds) => (fs.isDirectory(fatString(pointer, bounds)) ? 1 : 0),
    gnat__os_lib__delete_file: (_pointer, _bounds, _name, ok) => {
      if (ok) view().setInt32(ok, 0, true);
    },
    gnat__os_lib__rename_file: (...args) => {
      const ok = args.at(-1) ?? 0;
      if (ok) view().setInt32(ok, 0, true);
    },
    gnat__os_lib__file_time_stamp: () => 0n,
    gnat__os_lib__open_read__2: (pointer) => fs.open(cString(pointer)),
    gnat__os_lib__close: (fd) => fs.close(fd),
    gnat__os_lib__create_file__2: () => -1,
    gnat__os_lib__file_length: (fd) => fs.length(fd),
    gnat__os_lib__read: (fd, pointer, length) => {
      const read = fs.read(fd, bytes().subarray(pointer, pointer + length));
      return read < 0 ? 0 : read;
    },
    gnat__os_lib__write: (fd, pointer, length) => {
      emit(fd, bytes().subarray(pointer, pointer + length));
      return length;
    },
    gnat__os_lib__spawn: () => -1,
    gnat__os_lib__locate_exec_on_path: (data, bounds) => writeFatString(data, bounds, ''),
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc,
    fmod: (left, right) => left % right,
    fmin: Math.min,
    fmax: Math.max,
    log10: Math.log10,
    cbrt: Math.cbrt,
    grt_dynload_open: () => 0,
    grt_dynload_symbol: () => 0,
    __gnat_put_exception: () => {},
    __gnat_put_int: (value) => emit(2, String(value)),
    __gnat_put_char: (character) => emit(2, new Uint8Array([character & 0xff])),
    __gnat_put_string: (pointer, length) => emit(2, bytes().subarray(pointer, pointer + length)),
    __gnat_grow: (value) => value,
    __multi3: (result, al, ah, bl, bh) => {
      const left = (BigInt.asUintN(64, ah) << 64n) | BigInt.asUintN(64, al);
      const right = (BigInt.asUintN(64, bh) << 64n) | BigInt.asUintN(64, bl);
      const product = BigInt.asUintN(128, left * right);
      view().setBigUint64(result, product & ((1n << 64n) - 1n), true);
      view().setBigUint64(result + 8, product >> 64n, true);
    },
  };
  instance = await WebAssembly.instantiate(module, { env });
  const exports = instance.exports;
  memory = exports.memory;
  const currentPages = memory.buffer.byteLength / 65_536;
  if (currentPages < 1_024) memory.grow(1_024 - currentPages);
  exports.__wasm_call_ctors?.();
  exports.ghdlwasm_init();
  if (exports.synth_api__synth_init() !== 0) {
    throw new GhdlFailure('GHDL failed to initialize', text(stderr));
  }
  for (const file of request.files) {
    const [pointer, length] = adaString(exports, bytes, file.name);
    const rc = exports.synth_api__analyze_file(pointer, length);
    exports.free(pointer);
    if (rc !== 0) {
      throw new GhdlFailure(`GHDL failed to analyze ${file.name}`, text(stderr));
    }
  }
  stdout.length = 0;
  const [topPointer, topLength] = adaString(exports, bytes, request.top.toLowerCase());
  const rc = exports.synth_api__synth_top(topPointer, topLength);
  exports.free(topPointer);
  if (rc !== 0) {
    throw new GhdlFailure(`GHDL failed to synthesize ${request.top}`, text(stderr));
  }
  const verilog = text(stdout);
  if (!verilog.trim()) {
    throw new GhdlFailure('GHDL produced an empty Verilog netlist', text(stderr));
  }
  return { verilog, log: tail(text(stderr)) };
}
function adaString(exports, bytes, value) {
  const contents = encoder.encode(value);
  const pointer = exports.malloc(contents.length + 1);
  bytes().set(contents, pointer);
  bytes()[pointer + contents.length] = 0;
  return [pointer, contents.length];
}
function text(chunks) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const joined = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.length;
  }
  return decoder.decode(joined);
}
function tail(value) {
  return value.length <= 64 * 1_024 ? value : value.slice(-64 * 1_024);
}
class VirtualFileSystem {
  files = new Map();
  directories = new Set(['/', workDirectory, libraryRoot]);
  descriptors = new Map();
  nextDescriptor = 100;
  add(path, contents) {
    const normalized = normalizePath(path);
    this.files.set(normalized, contents);
    const parts = normalized.split('/').filter(Boolean);
    parts.pop();
    let directory = normalized.startsWith('/') ? '' : '.';
    for (const part of parts) {
      directory = directory === '' ? `/${part}` : `${directory}/${part}`;
      this.directories.add(directory);
    }
  }
  has(path) {
    return this.resolve(path) !== undefined;
  }
  isDirectory(path) {
    return this.directories.has(normalizePath(path));
  }
  open(path) {
    const contents = this.resolve(path);
    if (!contents) return -1;
    const descriptor = this.nextDescriptor;
    this.nextDescriptor += 1;
    this.descriptors.set(descriptor, { contents, position: 0 });
    return descriptor;
  }
  close(descriptor) {
    this.descriptors.delete(descriptor);
  }
  length(descriptor) {
    return this.descriptors.get(descriptor)?.contents.length ?? -1;
  }
  eof(descriptor) {
    const file = this.descriptors.get(descriptor);
    return !file || file.position >= file.contents.length;
  }
  read(descriptor, destination) {
    const file = this.descriptors.get(descriptor);
    if (!file) return -1;
    const length = Math.min(destination.length, file.contents.length - file.position);
    if (length <= 0) return 0;
    destination.set(file.contents.subarray(file.position, file.position + length));
    file.position += length;
    return length;
  }
  readByte(descriptor) {
    const byte = new Uint8Array(1);
    return this.read(descriptor, byte) <= 0 ? -1 : byte[0];
  }
  unread(descriptor, character) {
    const file = this.descriptors.get(descriptor);
    if (file && file.position > 0) file.position -= 1;
    return character;
  }
  resolve(path) {
    const normalized = normalizePath(path);
    return this.files.get(normalized) ?? this.files.get(`${workDirectory}/${normalized}`);
  }
}
function normalizePath(path) {
  const absolute = path.startsWith('/');
  const parts = [];
  for (const part of path.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return `${absolute ? '/' : ''}${parts.join('/')}` || (absolute ? '/' : '.');
}
class GhdlFailure extends Error {
  log;
  constructor(message, log) {
    super(message);
    this.log = log;
  }
}
