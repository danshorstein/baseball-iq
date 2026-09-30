import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const base = new URL('../dist-pages/', import.meta.url);
const types = { html: 'text/html; charset=utf-8', mp4: 'video/mp4', vtt: 'text/vtt; charset=utf-8', jpg: 'image/jpeg', txt: 'text/plain; charset=utf-8' };
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/') { res.writeHead(302, { Location: '/baseball-iq/' }); res.end(); return; }
  const name = path === '/baseball-iq/' ? 'index.html' : path.replace('/baseball-iq/', '');
  if (!['index.html', 'cubs-baseball-iq.html'].includes(name) && !/^videos\/[a-z0-9-]+\.(mp4|vtt|jpg|txt)$/.test(name)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const file = await readFile(new URL(name, base));
    res.setHeader('Content-Type', types[name.split('.').at(-1)]);
    res.setHeader('Accept-Ranges', 'bytes');
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? '');
    if (range) {
      const from = Number(range[1]); const to = range[2] ? Math.min(Number(range[2]), file.length - 1) : file.length - 1;
      if (from > to || from >= file.length) { res.writeHead(416); res.end(); return; }
      res.writeHead(206, { 'Content-Range': `bytes ${from}-${to}/${file.length}`, 'Content-Length': to - from + 1 });
      res.end(file.subarray(from, to + 1));
    } else { res.setHeader('Content-Length', file.length); res.end(file); }
  } catch { res.writeHead(404); res.end('File not found. Run npm run build:pages first.'); }
}).listen(4173, '127.0.0.1');
