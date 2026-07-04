/** Render the print master to /downloads/forty-years-record.pdf (A4). */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png',
};
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(DIST, p);
    if (existsSync(f) && !path.extname(f)) f = path.join(f, 'index.html');
    if (!existsSync(f)) f = path.join(DIST, p + '.html');
    if (!existsSync(f)) {
      res.writeHead(404).end();
      return;
    }
    const body = await readFile(f);
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(4175, r));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.goto('http://localhost:4175/print-record', { waitUntil: 'networkidle' });
await mkdir('public/downloads', { recursive: true });
await page.pdf({
  path: 'public/downloads/forty-years-record.pdf',
  format: 'A4',
  printBackground: true,
});
await browser.close();
server.close();
console.log('PDF written → public/downloads/forty-years-record.pdf');
