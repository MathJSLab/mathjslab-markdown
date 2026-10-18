import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Development-only discovery; the public adapter never guesses repo paths. */
export const hdlToolOptions = () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const cache = path.join(root, 'node_modules', '.cache', 'mathjslab-hdl-tools');
  const suite = path.join(cache, 'oss-cad-suite');
  const suffix = process.platform === 'win32' ? '.exe' : '';
  const options = Object.fromEntries(
    ['ghdl', 'iverilog', 'vvp', 'yosys'].map((tool) => {
      const portable = [
        path.join(suite, 'bin', tool + suffix),
        path.join(cache, tool === 'vvp' ? 'iverilog' : tool, 'bin', tool + suffix),
        path.join(root, 'report', 'hdl-tools', tool === 'vvp' ? 'iverilog' : tool, 'bin', tool + suffix),
      ].find(existsSync);
      return [tool, process.env[`HDL_${tool.toUpperCase()}`] ?? portable ?? tool];
    }),
  );
  const directories = process.env.HDL_TOOL_PATH ?? (existsSync(path.join(suite, 'lib')) ? [path.join(suite, 'bin'), path.join(suite, 'lib')].join(path.delimiter) : '');
  return { ...options, ...(directories ? { environment: { PATH: directories + path.delimiter + (process.env.PATH ?? '') } } : {}) };
};
