import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { hdlToolOptions } from './helper/hdl-tool-options.mjs';
import { createNativeHDLExecutor, createHDLHTTPHandler } from '../dist/source/markdown-hdl-node.js';

// Explicit development opt-in. Native tools are NOT an untrusted-code sandbox.
if (process.env.HDL_ALLOW_NATIVE !== '1') throw new Error('Set HDL_ALLOW_NATIVE=1 for trusted local HDL examples, or provide an OS-isolated backend.');
const executor = createNativeHDLExecutor({
  allowNativeExecution: true,
  ...hdlToolOptions(),
});
const token = process.env.HDL_TOKEN ?? randomBytes(32).toString('hex');
const origins = (process.env.HDL_ORIGINS ?? 'http://localhost:8080,http://127.0.0.1:8080').split(',');
const handler = createHDLHTTPHandler(executor, { token, allowedOrigins: origins });
const port = Number(process.env.HDL_PORT ?? 8787);
const server = createServer((request, response) => {
  void handler.handle(request, response);
});
server.requestTimeout = 30_000;
server.headersTimeout = 10_000;
server.listen(port, '127.0.0.1', async () => {
  console.log(`HDL endpoint: http://127.0.0.1:${server.address().port}/hdl`);
  console.log(`HDL token (application configuration only): ${token}`);
  console.log(JSON.stringify(await executor.capabilities(), null, 2));
});
const stop = async () => {
  server.close();
  await handler.dispose();
  server.closeAllConnections();
};
process.once('SIGINT', () => {
  void stop();
});
process.once('SIGTERM', () => {
  void stop();
});
