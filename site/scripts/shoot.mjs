/**
 * Screenshot pass — serves dist/ and captures every chapter,
 * desktop (1440×900) + mobile (390×844), for the self-critique loop.
 * Usage: node scripts/shoot.mjs [outDir] [--page=/sources ...]
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'shots';
await mkdir(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
  '.pdf': 'application/pdf',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(DIST, p);
    if (existsSync(file) && !path.extname(file)) file = path.join(file, 'index.html');
    if (!existsSync(file)) file = path.join(DIST, p + '.html');
    if (!existsSync(file)) file = path.join(DIST, '404.html');
    const ext = path.extname(file);
    res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end('nf');
  }
});
await new Promise((r) => server.listen(4173, r));

const exe = existsSync('/opt/pw-browsers/chromium')
  ? undefined
  : undefined;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

const CHAPTERS = ['opening', 'inheritance', 'ledger', 'journey', 'achievements', 'regions', 'voices', 'pictures', 'next', 'close'];
const extraPages = process.argv.filter((a) => a.startsWith('--page=')).map((a) => a.slice(7));

for (const [label, vp] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  await page.addInitScript(() => localStorage.setItem('fy-consent', 'declined'));
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  for (const ch of CHAPTERS) {
    await page.evaluate((id) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, ch);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${OUT}/${label}-${ch}.png` });
  }
  // journey mid-state (pinned scrub)
  await page.evaluate(() => {
    const el = document.querySelector('.pin-spacer') ?? document.getElementById('journey-pin');
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + window.innerHeight * 2.2);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${label}-journey-mid.png` });

  for (const p of extraPages) {
    await page.goto(`http://localhost:4173${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${label}${p.replace(/\//g, '-') || '-home'}.png`, fullPage: p !== '/' });
  }
  await page.close();
}

await browser.close();
server.close();
console.log('done →', OUT);
