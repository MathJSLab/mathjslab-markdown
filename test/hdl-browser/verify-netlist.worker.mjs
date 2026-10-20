import { runYosys } from '../../dist/browser/hdl/yosys/bundle.js';
self.onmessage = async ({ data }) => {
  let logs = '';
  const log = (bytes) => {
    if (bytes) logs += new TextDecoder().decode(bytes);
  };
  try {
    await runYosys(
      ['-Q', '-T', '-p', `read_json circuit.json; hierarchy -top ${data.top}; eval -set a 9 -set b 13 -show y`],
      { 'circuit.json': new TextEncoder().encode(JSON.stringify(data.netlist)) },
      { stdout: log, stderr: log },
    );
    self.postMessage({ logs });
  } catch (error) {
    self.postMessage({ error: error.message, logs });
  }
};
