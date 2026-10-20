// SPDX-License-Identifier: MIT
// Real NVC analysis/elaboration/runtime, isolated in the owning job Worker.
import createNVC from './nvc.mjs';
import { unpackLibraries } from '../ghdl/resources.mjs';

const verified = async (name, expected) => {
  const response = await fetch(new URL(name, import.meta.url));
  if (!response.ok) throw new Error(`NVC asset ${name}: HTTP ${response.status}`);
  const data = await response.arrayBuffer();
  if (data.byteLength > 4 * 1024 * 1024) throw new Error('NVC asset exceeds 4 MiB');
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (hash !== expected) throw new Error(`NVC asset integrity failed: ${name}`);
  return data;
};

export async function simulateVHDL(request, log) {
  const [wasm, compressed] = await Promise.all([
    verified('nvc.wasm', 'b07c22ecbacefd68cc8962f57b0e9678eae334bd3ba1b73595af56ffbe341a52'),
    verified('libraries.tar.gz', '4e727910bf47c615fb3879ba8c33e4bb9e009e8f511038e830089cb7931d0770'),
  ]);
  const libraries = await unpackLibraries(compressed);
  const compiled = await WebAssembly.compile(wasm);
  let exit = 0;
  const module = await createNVC({
    noInitialRun: true,
    instantiateWasm: (imports, receive) => {
      const instance = new WebAssembly.Instance(compiled, imports);
      receive(instance);
      return instance.exports;
    },
    print: log,
    printErr: log,
    onExit: (code) => { exit = code; },
  });
  const fs = module.FS;
  for (const [name, data] of libraries) {
    const path = '/nvc/lib/' + name;
    fs.mkdirTree(path.slice(0, path.lastIndexOf('/')));
    fs.writeFile(path, data);
  }
  fs.mkdirTree('/work');
  fs.chdir('/work');
  const write = fs.write;
  const sizes = new Map();
  let allocated = 0;
  fs.write = function(stream, buffer, offset, length, position, ...rest) {
    if (fs.isFile(stream.node.mode)) {
      const end = (position ?? stream.position) + length;
      const before = sizes.get(stream.node) ?? 0;
      const growth = Math.max(before, end) - before;
      if (end > 512 * 1024 || allocated + growth > 4 * 1024 * 1024) throw new Error('NVC work filesystem limit exceeded');
      sizes.set(stream.node, Math.max(before, end));
      allocated += growth;
    }
    return write.call(this, stream, buffer, offset, length, position, ...rest);
  };
  for (const file of request.files) fs.writeFile(file.name, file.source);
  try {
    exit = module.callMain([
      '--std=08', '--messages=compact', '-L', '/nvc/lib',
      '-a', ...request.files.map((file) => file.name),
      '-e', request.top, '-r', '--format=vcd', '--wave=markdown_trace.vcd',
      `--stop-time=${request.stopTimeNs ?? 1000}ns`, '--exit-severity=error',
    ]) ?? exit;
  } catch (error) {
    if (error?.name !== 'ExitStatus') {
      if (error?.stack) log(error.stack);
      throw error;
    }
    exit = error.status;
  }
  if (exit) throw new Error(`NVC exited with code ${exit}`);
  const result = fs.readFile('/work/markdown_trace.vcd', { encoding: 'utf8' });
  if (new TextEncoder().encode(result).length > 512 * 1024) throw new Error('NVC VCD exceeds 512 KiB');
  return result;
}
