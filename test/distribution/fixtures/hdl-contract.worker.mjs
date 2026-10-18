import { parentPort } from 'node:worker_threads';

// A transport fixture, deliberately not an HDL compiler or simulator.
parentPort.on('message', ({ request, result }) => {
  if (!['vhdl', 'verilog'].includes(request.language) || !request.files.every((file) => typeof file.source === 'string')) throw new Error('Invalid transported HDL request');
  parentPort.postMessage({ ...result, logs: `Recorded fixture: ${request.language}/${request.operation}/${request.top}/${request.files.length}` });
});
