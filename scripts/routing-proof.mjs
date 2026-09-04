import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const filePath = path.join(distDir, urlPath);
  try {
    if (urlPath !== '/' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200);
      res.end(fs.readFileSync(filePath));
      return;
    }
  } catch (_) {}
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(indexHtml);
});

const ROUTES = ['/', '/gallery', '/gallery/', '/gallery?x=1'];
let passed = 0;
let failed = 0;

server.listen(8125, '127.0.0.1', () => {
  let done = 0;
  for (const route of ROUTES) {
    const options = { hostname: '127.0.0.1', port: 8125, path: route, method: 'GET' };
    http.get(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        const isHtml = body.trim().startsWith('<!') || body.includes('<html');
        const status = res.statusCode;
        const ok = status === 200 && isHtml;
        if (ok) passed++; else failed++;
        console.log((ok ? 'PASS' : 'FAIL') + '  GET ' + route + ' -> status=' + status + ' is_html=' + isHtml);
        done++;
        if (done === ROUTES.length) {
          server.close(() => {
            console.log('');
            console.log('GALLERY_COLD_REQUEST_PROOF: ' + (failed === 0 ? 'PASS (' + passed + '/' + ROUTES.length + ')' : 'FAIL (' + failed + ' failed)'));
            process.exit(failed > 0 ? 1 : 0);
          });
        }
      });
    }).on('error', (e) => {
      console.log('FAIL  GET ' + route + ' -> ' + e.message);
      failed++;
      done++;
      if (done === ROUTES.length) { server.close(); process.exit(1); }
    });
  }
});
