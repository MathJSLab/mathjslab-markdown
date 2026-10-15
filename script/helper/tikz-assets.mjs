import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const collectTikZAssets = () => {
  const root = path.dirname(require.resolve('@rod2ik/tikzjax/package.json'));
  const files = [];
  const walk = (dir, relative = '') => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = path.posix.join(relative, entry.name);
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file, name);
      else if (!['run-tex.js', 'run-tex.min.js', 'tikzjax.js', 'tikzjax.min.js'].includes(name)) files.push({ name: `tikzjax/${name}`, file });
    }
  };
  walk(path.join(root, 'dist'));
  files.push({ name: 'tikzjax/LICENSE', file: path.join(root, 'LICENSE') });
  return files;
};
