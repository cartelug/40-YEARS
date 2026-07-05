/** Designed OG card: hero plate + record typography, rendered at 1200×630. */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:HerosCn;src:url(/fonts/heros-cn-bold.woff2) format('woff2');font-weight:700}
@font-face{font-family:Heros;src:url(/fonts/heros-bold.woff2) format('woff2');font-weight:700}
@font-face{font-family:Heros;src:url(/fonts/heros-regular.woff2) format('woff2');font-weight:400}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0B0E14 url(/images/social/og-base.jpg) center/cover no-repeat;font-family:Heros,Arial,sans-serif;position:relative}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,14,20,.92) 0%,rgba(11,14,20,.55) 46%,rgba(11,14,20,0) 72%)}
.inner{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:center}
.eyebrow{color:#C9A227;font-size:19px;letter-spacing:.18em;font-weight:700;text-transform:uppercase}
h1{font-family:HerosCn,Arial,sans-serif;color:#EFE7D6;font-size:104px;line-height:.95;text-transform:uppercase;letter-spacing:-.015em;margin:26px 0 30px;max-width:640px}
.rule{width:88px;height:3px;background:#C9A227;margin-bottom:26px}
.sub{color:#C3C9D2;font-size:25px;letter-spacing:.12em;text-transform:uppercase}
</style></head><body>
<div class="scrim"></div>
<div class="inner">
  <p class="eyebrow">The Official National Record</p>
  <h1>Forty Years of Transformation</h1>
  <div class="rule"></div>
  <p class="sub">Republic of Uganda · 1986–2026</p>
</div>
</body></html>`;

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/40-YEARS' || p.startsWith('/40-YEARS/')) p = p.slice('/40-YEARS'.length) || '/'; // base-prefixed
    if (p === '/og') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(html);
      return;
    }
    const f = path.join(DIST, p);
    if (!existsSync(f)) {
      res.writeHead(404).end();
      return;
    }
    const b = await readFile(f);
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
    res.end(b);
  } catch {
    try { res.writeHead(500).end(); } catch {}
  }
});
await new Promise((r) => server.listen(4179, r));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:4179/og', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const shot = await page.screenshot({ type: 'jpeg', quality: 82 });
await writeFile('public/images/social/og-cover.jpg', shot);
await browser.close();
server.close();
console.log(`og-cover.jpg written (${(shot.length / 1024).toFixed(0)}KB)`);
