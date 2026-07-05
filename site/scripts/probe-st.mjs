import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
const DIST = path.resolve('dist');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2' };
const server = createServer(async (req,res)=>{ try{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p==='/40-YEARS'||p.startsWith('/40-YEARS/')) p=p.slice('/40-YEARS'.length)||'/'; let f=path.join(DIST,p); if(existsSync(f)&&!path.extname(f)) f=path.join(f,'index.html'); if(!existsSync(f)) f=path.join(DIST,p+'.html'); if(!existsSync(f)){res.writeHead(404).end();return;} const b=await readFile(f); res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); res.end(b); }catch{ try{res.writeHead(500).end()}catch{} } });
await new Promise(r=>server.listen(4181,r));
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:1440,height:900} });
await page.addInitScript(() => { localStorage.setItem('fy-consent','declined'); try{sessionStorage.setItem('fy-seen','1')}catch{} });
await page.goto('http://localhost:4181/', { waitUntil:'networkidle' });
await page.waitForTimeout(2200);
const d = await page.evaluate(() => {
  const ST = window.__ST;
  const voices = document.getElementById('voices');
  const actualTop = voices.getBoundingClientRect().top + window.scrollY;
  const trig = ST.getAll().filter(t => t.trigger === voices).map(t => ({ start: Math.round(t.start), end: Math.round(t.end), pin: !!t.pin }));
  const pinT = ST.getAll().find(t => t.pin);
  return { actualVoicesTop: Math.round(actualTop), voicesTriggers: trig, pinStart: pinT ? Math.round(pinT.start) : null, total: ST.getAll().length };
});
console.log(JSON.stringify(d, null, 1));
// force refresh then re-measure
const d2 = await page.evaluate(() => {
  window.__ST.refresh();
  const voices = document.getElementById('voices');
  const trig = window.__ST.getAll().filter(t => t.trigger === voices).map(t => ({ start: Math.round(t.start), end: Math.round(t.end) }));
  return trig;
});
console.log('after manual refresh:', JSON.stringify(d2));
await browser.close(); server.close();
