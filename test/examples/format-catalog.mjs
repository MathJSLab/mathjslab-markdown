import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { exampleFiles } from './reference-audit.mjs';

// One native Node process avoids loading formatter plugins through Jest's VM
// or starting a separate formatter process for each catalogue file.
const formatted = {};
for (const file of exampleFiles(fileURLToPath(new URL('../../example/', import.meta.url)))) {
  formatted[file] = await prettier.format(fs.readFileSync(file, 'utf8'), { ...(await prettier.resolveConfig(file)), filepath: file });
}
process.stdout.write(JSON.stringify(formatted));
