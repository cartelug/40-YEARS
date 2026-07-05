import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
const DIST = path.resolve('dist');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2' };
const server = createServer(async (req,res)=>{ try{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p==='/40-YEARS'||p.startsWith('/40-YEARS/')) p=p.slice('/40-YEARS'.length)||'/'; let f=path.join(DIST,p); if(existsSync(f)&&!path.extname(f)) f=path.join(f,'index.html'); if(!existsSync(f)) f=path.join(DIST,p+'.html'); if(!existsSync(f)){res.writeHead(404).end();return;} const b=await readFile(f); res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); res.end(b); }catch{ try{res.writeHead(500).end()}catch{} } });
await new Promise(r=>server.listen(4180,r));
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:1440,height:900} });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.addInitScript(() => localStorage.setItem('fy-consent','declined'));
// 1. preloader frame (fresh session)
await page.goto('http://localhost:4180/', { waitUntil:'domcontentloaded' });
await page.waitForTimeout(650);
await page.screenshot({ path: 'shots-v7/preloader.png' });
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1800);
// 2. boundary dissolve: halfway between inheritance end and ledger... use voices->pictures boundary (両dark)
const mid = await page.evaluate(() => {
  const a = document.getElementById('voices');
  const r = a.getBoundingClientRect();
  return r.top + window.scrollY + a.offsetHeight - innerHeight * 0.65;
});
await page.evaluate((y) => window.scrollTo(0, y), mid);
await page.waitForTimeout(900);
await page.screenshot({ path: 'shots-v7/boundary-voices-pictures.png' });
// 3. theatre state sanity
const state = await page.evaluate(() => {
  const on = document.documentElement.classList.contains('theatre-on');
  const plates = [...document.querySelectorAll('[data-plate]')].map(p => ({ ch: p.dataset.plate, d: getComputedStyle(p).display, o: (+getComputedStyle(p).opacity).toFixed(2) }));
  return { on, visible: plates.filter(p => p.d !== 'none') };
});
console.log(JSON.stringify(state, null, 1));
await browser.close(); server.close();
