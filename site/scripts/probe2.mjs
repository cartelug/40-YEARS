import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
const DIST = path.resolve('dist');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2' };
const server = createServer(async (req,res)=>{ try{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); let f=path.join(DIST,p); if(existsSync(f)&&!path.extname(f)) f=path.join(f,'index.html'); if(!existsSync(f)) f=path.join(DIST,p+'.html'); if(!existsSync(f)){res.writeHead(404).end();return;} const b=await readFile(f); res.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'}); res.end(b); }catch{ try{res.writeHead(500).end()}catch{} } });
await new Promise(r=>server.listen(4176,r));
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:1440,height:900} });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.addInitScript(() => localStorage.setItem('fy-consent','declined'));
await page.goto('http://localhost:4176/', { waitUntil:'networkidle' });
await page.waitForTimeout(2500);
const d = await page.evaluate(() => {
  const sec = document.getElementById('journey');
  const pin = document.getElementById('journey-pin');
  const spacer = document.querySelector('.pin-spacer');
  return {
    sectionH: sec?.offsetHeight,
    pinH: pin?.offsetHeight,
    spacerH: spacer ? spacer.offsetHeight : null,
    docH: document.documentElement.scrollHeight,
  };
});
console.log(JSON.stringify(d));
await browser.close(); server.close();
