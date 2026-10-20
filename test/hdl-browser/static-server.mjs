import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const serveStatic = async () => {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
  const requests = [];
  const server = createServer(async (request, response) => {
    requests.push({ method: request.method, url: request.url });
    if (request.method !== 'GET') {
      response.writeHead(405).end();
      return;
    }
    try {
      const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const filename = path.resolve(root, '.' + name);
      if (!filename.startsWith(root + path.sep)) throw new Error('Outside root');
      const data = await readFile(filename);
      response.setHeader(
        'Content-Type',
        { '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.html': 'text/html' }[path.extname(filename)] ??
          'application/octet-stream',
      );
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:",
      );
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}`, requests, close: () => new Promise((resolve) => server.close(resolve)) };
};
