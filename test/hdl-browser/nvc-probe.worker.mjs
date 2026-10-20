// Experimental compiler probe only. This does not enable public capabilities.
// The candidate must be built locally; no external compiler service is used.
import { unpackLibraries } from '../../assets/hdl/ghdl/resources.mjs';

self.onmessage = async ({ data }) => {
  let logs = '';
  try {
    const base = new URL(data.base, self.location.href);
    if (base.origin !== self.location.origin) throw new Error('Probe assets must be same-origin');
    const { default: createNVC } = await import(new URL('nvc.mjs', base));
    const response = await fetch(new URL('libraries.tar.gz', base));
    if (!response.ok) throw new Error('Missing candidate standard libraries');
    const libraries = await unpackLibraries(await response.arrayBuffer());
    const log = (line) => {
      logs += line + '\n';
      if (logs.length > 65536) throw new Error('Probe log limit exceeded');
    };
    let exit = 0;
    const module = await createNVC({
      noInitialRun: true,
      locateFile: (name) => new URL(name, base).href,
      print: log,
      printErr: log,
      onExit: (code) => { exit = code; },
    });
    const fs = module.FS;
    for (const [name, contents] of libraries) {
      const path = '/nvc/lib/' + name;
      fs.mkdirTree(path.slice(0, path.lastIndexOf('/')));
      fs.writeFile(path, contents);
    }
    fs.mkdirTree('/work');
    fs.chdir('/work');
    for (const file of data.files) fs.writeFile(file.name, file.source);
    try {
      exit = module.callMain([
        '--std=08', '--messages=compact', '-L', '/nvc/lib',
        '-a', ...data.files.map((file) => file.name),
        '-e', data.top, '-r', '--format=vcd', '--wave=trace.vcd',
        '--stop-time=1000ns', '--exit-severity=error',
      ]) ?? exit;
    } catch (error) {
      if (error?.name !== 'ExitStatus') throw error;
      exit = error.status;
    }
    let vcd;
    try { vcd = fs.readFile('/work/trace.vcd', { encoding: 'utf8' }); } catch {}
    if (vcd?.length > 512 * 1024) throw new Error('Probe VCD limit exceeded');
    self.postMessage({ exit, logs, vcd, isolated: self.crossOriginIsolated });
  } catch (error) {
    self.postMessage({ error: error.message, logs, stack: error.stack });
  }
};
