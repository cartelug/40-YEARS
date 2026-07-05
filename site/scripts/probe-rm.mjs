import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
const DIST = path.resolve('dist');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2' };
const server = createServer(async (req,res)=>{ try{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p==='/40-YEARS'||p.startsWith('/40-YEARS/')) p=p.slice('/40-YEARS'.length)||'/'; // base-prefixed let f=path.join(DIST,p); if(existsSync(f)&&!path.extname(f)) f=path.join(f,'index.html'); if(!existsSync(f)) f=path.join(DIST,p+'.html'); if(!existsSync(f)){res.writeHead(404).end();return;} const b=await readFile(f); res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); res.end(b); }catch{ try{res.writeHead(500).end()}catch{} } });
await new Promise(r=>server.listen(4178,r));
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });

const ctx1 = await browser.newContext({ viewport:{width:1440,height:900}, reducedMotion:'reduce' });
const p1 = await ctx1.newPage();
await p1.addInitScript(() => localStorage.setItem('fy-consent','declined'));
await p1.goto('http://localhost:4178/', { waitUntil:'networkidle' });
await p1.waitForTimeout(1200);
const rm = await p1.evaluate(() => ({
  spineScale: getComputedStyle(document.getElementById('spine-progress')).transform,
  ledgerValue: document.querySelector('[data-count]')?.textContent,
  panelPos: getComputedStyle(document.querySelector('.journey-panel')).position,
  heroWordTransform: getComputedStyle(document.querySelector('.hero-word')).transform,
  pinSpacer: !!document.querySelector('.pin-spacer'),
}));
console.log('REDUCED MOTION:', JSON.stringify(rm));
await ctx1.close();

const ctx2 = await browser.newContext({ viewport:{width:1440,height:900}, javaScriptEnabled:false });
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:4178/', { waitUntil:'load' });
const nojs = await p2.evaluate(() => ({
  panelsVisible: Array.from(document.querySelectorAll('.journey-panel')).map(e => getComputedStyle(e).position + '/' + getComputedStyle(e).opacity),
  spine: getComputedStyle(document.getElementById('spine-progress')).transform,
  ledger: document.querySelector('[data-count]')?.textContent?.trim(),
}));
console.log('NO-JS:', JSON.stringify(nojs));
await p2.screenshot({ path: 'shots-v4/nojs-top.png' });
await ctx2.close();
await browser.close(); server.close();
