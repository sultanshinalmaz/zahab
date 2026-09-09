/* Локальный просмотр сайта: node dev-server.js  →  http://localhost:8140
   Никаких зависимостей — только встроенный http-модуль Node. */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8140;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg':  'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg':  'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4':  'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff'
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';

  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Не найдено: ' + rel);
  }

  const ext = path.extname(file).toLowerCase();
  const stat = fs.statSync(file);

  // видео отдаём кусками — иначе перемотка в браузере не работает
  if (ext === '.mp4' && req.headers.range){
    const [s, e] = req.headers.range.replace('bytes=', '').split('-');
    const start = parseInt(s, 10);
    const end = e ? parseInt(e, 10) : stat.size - 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': TYPES[ext]
    });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }

  res.writeHead(200, {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log('Сайт ZAHAB открыт: http://localhost:' + PORT);
});
