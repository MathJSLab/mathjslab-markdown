// SPDX-License-Identifier: MIT
// These fixed compiler resources are data, never remote processing requests.
export async function verifiedBytes(name, expected) {
  const response = await fetch(new URL(name, import.meta.url));
  if (!response.ok) throw new Error(`GHDL asset ${name}: HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 4 * 1024 * 1024) throw new Error('GHDL compressed asset exceeds 4 MiB');
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (hash !== expected) throw new Error(`GHDL asset integrity failed: ${name}`);
  return bytes;
}
export async function unpackLibraries(compressed) {
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const reader = stream.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.length;
      if (length > 16 * 1024 * 1024) {
        await reader.cancel();
        throw new Error('GHDL libraries exceed 16 MiB');
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }
  const archive = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    archive.set(chunk, offset);
    offset += chunk.length;
  }
  const decoder = new TextDecoder();
  const text = (start, count) => decoder.decode(archive.subarray(start, start + count)).split('\0')[0];
  const files = new Map();
  for (offset = 0; offset + 512 <= archive.length;) {
    if (archive.subarray(offset, offset + 512).every((byte) => byte === 0)) break;
    const name = text(offset, 100).replace(/^\.\//, '');
    const prefix = text(offset + 345, 155);
    const path = prefix ? prefix + '/' + name : name;
    const sizeText = text(offset + 124, 12).trim();
    if (!/^[0-7]+$/.test(sizeText)) throw new Error('Invalid GHDL tar size');
    const size = parseInt(sizeText, 8);
    const type = archive[offset + 156];
    if (path.startsWith('/') || path.split('/').some((part) => part === '..') || offset + 512 + size > archive.length) throw new Error('Invalid GHDL library path or length');
    if ((type === 0 || type === 48) && name) {
      if (files.has(path) || files.size >= 512) throw new Error('Duplicate or excessive GHDL library files');
      files.set(path, archive.slice(offset + 512, offset + 512 + size));
    } else if (type !== 53 && type !== 0 && type !== 48) throw new Error('Unsupported GHDL library archive entry');
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}
