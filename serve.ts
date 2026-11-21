// A minimal static file server for trying the atlas locally.
// Usage: node serve.ts [--port 8080]
// It serves only the app/ folder next to this file, answers 404 for anything
// it cannot find, and refuses paths that try to climb out of app/.
// Node 22 standard library only; this is a development convenience.

import { readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = fileURLToPath(new URL('./app/', import.meta.url));

const argv = process.argv.slice(2);
const flagAt = argv.indexOf('--port');
const parsed = flagAt >= 0 ? Number(argv[flagAt + 1]) : 8080;
const port = Number.isInteger(parsed) && parsed > 0 && parsed < 65536 ? parsed : 8080;

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
]);

const server = createServer((req, res) => {
  let route;
  try {
    route = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain' }).end('Bad request');
    return;
  }
  if (route === '/') route = '/index.html';
  const clean = normalize(route).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(appDir, clean);
  if (!filePath.startsWith(appDir)) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('Forbidden');
    return;
  }
  let body;
  try {
    if (!statSync(filePath).isFile()) throw new Error('not a file');
    body = readFileSync(filePath);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream',
    'content-length': body.length,
    'cache-control': 'no-store',
  }).end(body);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Leonida Platinum Atlas is being served at http://localhost:${port}`);
});
