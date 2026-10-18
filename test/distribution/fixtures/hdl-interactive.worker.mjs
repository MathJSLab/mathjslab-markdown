import { parentPort } from 'node:worker_threads';
// Stateful executable digital model for transport tests, not an HDL compiler.
let request;
let time = 0;
let q = '0000';
let trace = '';
parentPort.on('message', (message) => {
  if (message.type === 'initialize') {
    request = message.request;
    const output = request.outputs[0];
    trace = `$timescale 1ns $end\n$var wire ${output.width} ! ${output.name} $end\n$enddefinitions $end\n`;
    parentPort.postMessage({ ready: true });
    return;
  }
  const { inputs, advanceNs } = message.step;
  let value;
  if (request.top === 'live_and') value = inputs.a === '0' || inputs.b === '0' ? '0' : inputs.a === '1' && inputs.b === '1' ? '1' : 'x';
  else if (request.top === 'live_mux') value = inputs.s === '0' ? inputs.a : inputs.s === '1' ? inputs.b : 'xxxx';
  else if (request.top === 'live_counter') {
    q = inputs.rst === '1' ? '0000' : ((parseInt(q, 2) + 1) % 16).toString(2).padStart(4, '0');
    value = q;
  } else if (request.top === 'live_register') {
    if (inputs.enable === '1') q = inputs.d;
    value = q;
  } else throw new Error('Unknown fixture design');
  const width = request.outputs[0].width;
  trace += `#${time}\n${width === 1 ? value + '!' : 'b' + value + ' !'}\n`;
  time += advanceNs;
  trace += `#${time}\n`;
  parentPort.postMessage({ timeNs: time, values: { [request.outputs[0].name]: value }, logs: `Worker model ${request.language}/${request.top}`, vcd: trace });
});
