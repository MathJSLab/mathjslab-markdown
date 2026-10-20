import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
const target = process.argv[2];
if (!target) throw new Error('Usage: node script/copy-hdl-assets.mjs <app-public-hdl-directory>');
await mkdir(path.resolve(target), { recursive: true });
await cp(new URL('../dist/browser/hdl/', import.meta.url), path.resolve(target), { recursive: true, force: true });
console.log('HDL assets copied to ' + path.resolve(target));
