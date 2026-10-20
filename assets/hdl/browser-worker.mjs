// SPDX-License-Identifier: MIT
// Each job owns this Worker and fresh MEMFS instances. Termination is cancellation.
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const limit = 512 * 1024;
const check = (text) => {
  if (encoder.encode(text).length > limit) throw new Error('HDL output exceeds 512 KiB');
  return text;
};
self.onmessage = async ({ data: { request, replay } }) => {
  let logs = '';
  const log = (value) => {
    logs += typeof value === 'string' ? value + '\n' : value ? decoder.decode(value) : '';
    if (encoder.encode(logs).length > 65536) throw new Error('HDL logs exceed 64 KiB');
  };
  const diagnostics = (failed) =>
    logs
      .split(/\r?\n/)
      .flatMap((line) => {
        const match = /^\/?([^:/]+\.(?:vhd|vhdl|v|sv)):(\d+)(?::(\d+))?:\s*(.*)$/.exec(line);
        return match
          ? [
              {
                ...(request.files.some((file) => file.name === match[1]) ? { file: match[1], line: +match[2], ...(match[3] ? { column: +match[3] } : {}) } : {}),
                severity: /warning/i.test(line) ? 'warning' : failed ? 'error' : 'info',
                message: match[4],
              },
            ]
          : [];
      })
      .slice(0, 128);
  try {
    if (!['verilog', 'vhdl'].includes(request.language)) throw new Error('Unsupported browser HDL language');
    if (request.operation === 'synthesize') {
      let sources = request.files;
      let top = request.top;
      if (request.language === 'vhdl') {
        const { synthesizeVHDL } = await import('./ghdl/frontend.mjs');
        let translation;
        try {
          translation = await synthesizeVHDL(request);
        } catch (error) {
          if (error.log) log(error.log);
          throw error;
        }
        if (translation.log) log(translation.log);
        // GHDL resolves VHDL names case-insensitively but preserves source
        // spelling in Verilog, whose module lookup is case-sensitive.
        const declaration = [...translation.verilog.matchAll(/^\s*module\s+([A-Za-z_][A-Za-z0-9_$]*)\b/gm)].find((match) => match[1].toLowerCase() === request.top.toLowerCase());
        if (!declaration) throw new Error('GHDL output does not declare the requested top');
        top = declaration[1];
        const verilog = translation.verilog.replace(/\/\*\s*([^\s:*]+\.vhdl?):(\d+):\d+\s*\*\//g, (comment, file, line) =>
          request.files.some((source) => source.name === file) ? `\n\`line ${line} "${file}" 0\n${comment}` : comment,
        );
        sources = [{ name: 'markdown_vhdl.v', source: check(verilog) }];
      }
      const { runYosys } = await import('./yosys/bundle.js');
      const files = Object.fromEntries(sources.map((file) => [file.name, encoder.encode(file.source)]));
      const script = `read_verilog ${request.standard !== '2005' ? '-sv ' : ''}${sources.map((file) => file.name).join(' ')}; hierarchy -check -top ${top}; proc; flatten; opt; write_json markdown_netlist.json`;
      const output = await runYosys(['-Q', '-T', '-p', script], files, { stdout: log, stderr: log });
      const raw = output?.['markdown_netlist.json'];
      if (!raw) throw new Error('Yosys produced no netlist');
      const netlist = JSON.parse(check(typeof raw === 'string' ? raw : decoder.decode(raw)));
      self.postMessage({ result: { status: 'success', logs, diagnostics: diagnostics(false), netlist: { top, netlist } } });
      return;
    }
    if (request.language === 'vhdl') {
      const { simulateVHDL } = await import('./nvc/frontend.mjs');
      const vcd = check(await simulateVHDL(request, log));
      self.postMessage({ result: { status: 'success', logs, diagnostics: diagnostics(false), vcd } });
      return;
    }
    const [{ default: initPP }, { default: initIVL }, { default: initVVP }] = await Promise.all([import('./icarus/ivlpp.js'), import('./icarus/ivl.js'), import('./icarus/vvp.js')]);
    const init = async (factory, print) => {
      const module = await factory({ noInitialRun: true, print, printErr: log });
      // Bound MEMFS allocations while C code writes, before reading the result.
      // This is not a cap on the compiler's independent WebAssembly heap.
      const memfs = module.FS.filesystems.MEMFS;
      const sizes = new WeakMap();
      let total = 0;
      for (const name of ['expandFileStorage', 'resizeFileStorage']) {
        const original = memfs[name];
        memfs[name] = (node, size) => {
          const previous = sizes.get(node) ?? 0;
          const next = Math.max(previous, size);
          if (next > limit || total + next - previous > 4 * 1024 * 1024) throw new Error('HDL in-memory file limit exceeded');
          total += next - previous;
          sizes.set(node, next);
          return original(node, size);
        };
      }
      return module;
    };
    const run = (module, args) => {
      let code;
      try {
        code = module.callMain(args);
      } catch (error) {
        if (error?.name !== 'ExitStatus' || error.status !== 0) throw error;
      }
      if (code) throw new Error(`Icarus exited with code ${code}`);
    };
    const stop = request.stopTimeNs ?? 1000;
    const capture =
      '`timescale 1ns/1fs\nmodule markdown_capture; initial begin $dumpfile("markdown_trace.vcd"); $dumpvars(0,' +
      request.top +
      '); #' +
      stop +
      '; ' +
      (replay ? '#0.000001; ' : '') +
      '$finish; end endmodule\n';
    const files = [{ name: 'markdown_timescale.sv', source: '`timescale 1ns/1ps\n' }, ...request.files, { name: 'markdown_capture.sv', source: capture }];
    let preprocessed = '';
    const pp = await init(initPP, (text) => {
      preprocessed += text + '\n';
      check(preprocessed);
    });
    for (const file of files) pp.FS.writeFile('/' + file.name, file.source + '\n');
    run(pp, ['-L', ...files.map((file) => '/' + file.name)]);
    const compiler = await init(initIVL, log);
    compiler.FS.writeFile('/src.v', preprocessed);
    compiler.FS.writeFile(
      '/ivl.conf',
      `basedir:/\nmodule:system.vpi\ngeneration:${request.standard ?? '2012'}\ngeneration:no-specify\nout:/out.vvp\niwidth:32\nwidthcap:65536\nfunctor:cprop\nfunctor:nodangle\nflag:DLL=vvp.tgt\nroot:${request.top}\nroot:markdown_capture\n`,
    );
    run(compiler, ['-C/ivl.conf', '--', '/src.v']);
    const program = compiler.FS.readFile('/out.vvp');
    if (program.length > limit) throw new Error('Compiled HDL exceeds 512 KiB');
    const runtime = await init(initVVP, log);
    runtime.FS.writeFile('/sim.vvp', program);
    run(runtime, ['/sim.vvp']);
    const vcd = check(runtime.FS.readFile('/markdown_trace.vcd', { encoding: 'utf8' }));
    self.postMessage({ result: { status: 'success', logs, diagnostics: diagnostics(false), vcd } });
  } catch (error) {
    logs = (logs + '\n' + (error?.message ?? String(error))).slice(-65536);
    const items = diagnostics(true);
    self.postMessage({ result: { status: 'error', logs, diagnostics: items.length ? items : [{ severity: 'error', message: logs.slice(-4096) }] } });
  }
};
