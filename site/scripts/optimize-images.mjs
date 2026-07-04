/**
 * ASSET PIPELINE — Forty Years of Transformation
 *
 * Renames every approved raw asset to convention, encodes AVIF(q50) +
 * WebP(q72) + progressive JPG at responsive widths, strips metadata,
 * emits a tiny LQIP per image, writes the manifest consumed by
 * <Pic/>, and generates the OG cover, favicon and touch icon.
 *
 * Run: npm run assets   (from /site)
 */
import sharp from 'sharp';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import path from 'node:path';

const RAW = path.resolve(process.cwd(), '../assets');
const OUT = path.resolve(process.cwd(), 'public/images');
const P = 'ChatGPT Image Jul 5, 2026, ';

const DESKTOP_W = [480, 960, 1440, 1920];
const MOBILE_W = [540, 1080];

/** category: bg | photos | graphics | social  ·  tw: desktop|mobile twin key */
const SOURCES = [
  // ——— Background plates (AI, cleared for illustrative use) ———
  { src: `${P}01_09_20 AM.png`, name: 'bg-hero-01-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Portrait of the President dissolving into a glowing gold topographic map of Uganda on deep navy' },
  { src: `${P}01_09_33 AM.png`, name: 'bg-hero-01-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-hero-01' },
  { src: `${P}01_10_24 AM.png`, name: 'bg-hero-02-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Golden dawn breaking over a dark plain, a winding river catching the first light' },
  { src: `${P}01_10_20 AM.png`, name: 'bg-hero-02-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-hero-02' },
  { src: `${P}01_11_31 AM.png`, name: 'bg-hero-03-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Aerial view at dawn: sun rising behind the Kampala skyline, a river winding through the city' },
  { src: `${P}01_09_42 AM.png`, name: 'bg-quiet-dark-01-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: '', decorative: true },
  { src: `${P}01_11_35 AM.png`, name: 'bg-quiet-dark-02-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: '', decorative: true },
  { src: `${P}01_11_40 AM.png`, name: 'bg-quiet-dark-02-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-quiet-dark-02' },
  { src: `${P}01_10_05 AM.png`, name: 'bg-quiet-dark-03-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: '', decorative: true },
  { src: `${P}01_10_03 AM.png`, name: 'bg-quiet-dark-03-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-quiet-dark-03' },
  { src: `${P}01_10_13 AM.png`, name: 'bg-active-dark-01-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Night relief map: gold-lit ridgelines, rivers and settlement lights around a dark lake' },
  { src: `${P}01_10_28 AM.png`, name: 'bg-active-dark-01-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-active-dark-01' },
  { src: `${P}01_10_41 AM.png`, name: 'bg-active-dark-02-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Night infrastructure: a cable-stayed bridge, highway light trails, pylons and cranes in gold' },
  { src: `${P}01_10_46 AM.png`, name: 'bg-active-dark-02-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-active-dark-02' },
  { src: `${P}01_11_21 AM.png`, name: 'bg-active-dark-03-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Transmission pylons on a dark horizon, a network of gold light arcing between hills' },
  { src: `${P}01_11_47 AM.png`, name: 'bg-active-dark-04-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Golden light-trails converging toward a bright point on a dark horizon' },
  { src: `${P}01_11_50 AM.png`, name: 'bg-active-dark-04-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-active-dark-04' },
  { src: `${P}01_10_35 AM.png`, name: 'bg-archive-deep-01-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: 'Translucent archival plates standing in mist under a low golden light' },
  { src: `${P}01_09_48 AM.png`, name: 'bg-ledger-paper-01-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: '', decorative: true },
  { src: `${P}01_09_51 AM.png`, name: 'bg-ledger-paper-01-mobile', cat: 'bg', widths: MOBILE_W, mobileOf: 'bg-ledger-paper-01' },
  { src: `${P}01_09_55 AM.png`, name: 'bg-close-ceremonial-01-desktop', cat: 'bg', widths: DESKTOP_W,
    alt: '', decorative: true },

  // ——— Graphics ———
  { src: `${P}01_09_38 AM.png`, name: 'gfx-map-contour-01-desktop', cat: 'graphics', widths: DESKTOP_W,
    alt: 'Gold contour-line map texture with glowing settlement nodes on deep navy' },
  { src: `${P}01_09_45 AM.png`, name: 'gfx-map-contour-01-mobile', cat: 'graphics', widths: MOBILE_W, mobileOf: 'gfx-map-contour-01' },
  { src: `${P}01_10_31 AM.png`, name: 'photo-voice-01', cat: 'photos', widths: MOBILE_W.concat(1440),
    alt: 'Engraved gold-line portrait of a Ugandan elder, shoulders dissolving into map contours' },

  // ——— Photography (real Uganda landscapes) ———
  { src: '13_queen_elizabeth_sunrise.jpg', name: 'photo-journey-1986-01', cat: 'photos', widths: DESKTOP_W,
    alt: 'Sunrise over Queen Elizabeth National Park: an orange sun in haze above silhouetted savanna' },
  { src: '03_rwenzori_mountains.jpg', name: 'photo-journey-1990s-01', cat: 'photos', widths: DESKTOP_W,
    alt: 'The Rwenzori foothills rising above a cultivated valley under an overcast sky' },
  { src: '10_uganda_terraced_hills.jpg', name: 'photo-journey-2000s-01', cat: 'photos', widths: [480, 960],
    alt: 'Terraced green hillsides in the Kigezi highlands, dotted with homesteads' },
  { src: '08_top_of_murchison_falls.jpg', name: 'photo-achv-energy-01', cat: 'photos', widths: DESKTOP_W,
    alt: 'The Nile in whitewater over rock at the top of Murchison Falls in golden light' },
  { src: '12_lake_victoria_jinja.jpg', name: 'photo-journey-2020s-01', cat: 'photos', widths: DESKTOP_W,
    alt: 'Lake Victoria at Jinja, cranes and lakeside works along the industrial shoreline' },
  { src: '04_bwindi_impenetrable_national_park.jpg', name: 'photo-journey-beyond-01', cat: 'photos', widths: DESKTOP_W,
    alt: 'Sunrise over the layered forest ridges of Bwindi, mist pooling in the valleys' },
  { src: '11_southwestern_uganda_hills.jpg', name: 'photo-achv-social-01', cat: 'photos', widths: [480, 960],
    alt: 'Homesteads and patchwork farm plots across the terraced hills of south-western Uganda' },
  { src: '09_vegetation_murchison_falls.jpg', name: 'photo-achv-regional-01', cat: 'photos', widths: DESKTOP_W,
    alt: 'Open savanna in Murchison Falls National Park, the Nile shimmering at the horizon' },
  { src: '07_river_nile_murchison_falls.jpg', name: 'photo-archive-05', cat: 'photos', widths: DESKTOP_W,
    alt: 'The Victoria Nile gorge below Murchison Falls, forested banks on both sides' },
  { src: '01_lake_bunyonyi.jpg', name: 'photo-archive-01', cat: 'photos', widths: [480, 802],
    alt: 'Lake Bunyonyi: still water reflecting forested points, terraced hills in mist' },
  // dense-foliage sources: capped at 1200 to hold the <90KB photo budget
  { src: '02_sipi_falls_eastern_uganda.jpg', name: 'photo-archive-02', cat: 'photos', widths: [480, 960, 1200],
    alt: 'Sipi Falls plunging over a cliff amphitheatre in the eastern highlands' },
  { src: '05_mount_elgon.jpg', name: 'photo-archive-03', cat: 'photos', widths: [480, 960, 1200],
    alt: 'High moorland and caldera valleys on Mount Elgon under a clear sky' },
  { src: '06_crater_lake_queen_elizabeth.jpg', name: 'photo-archive-04', cat: 'photos', widths: [480, 960],
    alt: 'A volcanic crater lake in Queen Elizabeth National Park reflecting the sky' },
];

/** Rejected at intake — see gap report in /ASSETS.md */
const REJECTED = [
  { src: `${P}01_11_44 AM.png`, reason: 'Country silhouette resembles Kenya (coastline, straight NE border) — geographically wrong for a national record of Uganda.' },
  { src: `${P}01_11_53 AM.png`, reason: 'Degenerate generation: shapeless grey noise blob, off-palette; unusable.' },
  { src: `${P}01_10_09 AM.png`, reason: 'Held in reserve (third near-black portrait plate; plates 01–03 cover every quiet-dark slot). Not encoded to keep the payload lean.' },
];

/** Section manifest aliases — same encoded files, additional semantic ids */
const ALIASES = {
  'photo-achv-economy-01': 'photo-journey-2000s-01',
  'photo-achv-stability-01': 'photo-journey-1986-01',
  'photo-journey-2010s-01': 'photo-achv-energy-01',
  'frame-01': 'photo-journey-1986-01',
  'frame-02': 'photo-archive-05',
  'frame-03': 'photo-journey-1990s-01',
  'frame-04': 'photo-archive-02',
  'frame-05': 'photo-journey-2000s-01',
  'frame-06': 'photo-archive-03',
  'frame-07': 'photo-achv-energy-01',
  'frame-08': 'photo-archive-04',
  'frame-09': 'photo-achv-regional-01',
  'frame-10': 'photo-archive-01',
  'frame-11': 'photo-achv-social-01',
  'frame-12': 'photo-journey-2020s-01',
  'frame-13': 'photo-journey-beyond-01',
};

const limit = (n) => {
  const q = [];
  let active = 0;
  const next = () => {
    if (active >= n || q.length === 0) return;
    active++;
    const { fn, res, rej } = q.shift();
    fn().then(res, rej).finally(() => { active--; next(); });
  };
  return (fn) => new Promise((res, rej) => { q.push({ fn, res, rej }); next(); });
};

const run = limit(Math.max(2, cpus().length - 1));
const manifest = {};
const inventory = [];

async function encodeOne(entry) {
  const input = path.join(RAW, entry.src);
  const img = sharp(input, { limitInputPixels: false });
  const meta = await img.metadata();
  let widths = entry.widths.filter((w) => w <= meta.width);
  if (!widths.length) widths = [meta.width];
  // encode native width when the source is narrower than the top breakpoint
  const maxRequested = Math.max(...entry.widths);
  if (Math.max(...widths) < meta.width && meta.width < maxRequested) widths.push(meta.width);
  const dir = path.join(OUT, entry.cat);
  await mkdir(dir, { recursive: true });

  const jobs = [];
  for (const w of widths) {
    const base = path.join(dir, `${entry.name}-${w}`);
    jobs.push(run(() => sharp(input).resize(w).avif({ quality: 50, effort: 3 }).toFile(`${base}.avif`)));
    jobs.push(run(() => sharp(input).resize(w).webp({ quality: 72 }).toFile(`${base}.webp`)));
    jobs.push(run(() => sharp(input).resize(w).jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(`${base}.jpg`)));
  }
  await Promise.all(jobs);

  const lqipBuf = await sharp(input).resize(24).webp({ quality: 20 }).toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`;

  const maxW = widths[widths.length - 1];
  const scaledH = Math.round((meta.height / meta.width) * maxW);
  const variant = {
    base: `/images/${entry.cat}/${entry.name}`,
    widths,
    width: maxW,
    height: scaledH,
  };

  inventory.push({
    src: entry.src,
    name: entry.name,
    dims: `${meta.width}×${meta.height}`,
    widths: widths.join('/'),
  });

  // group desktop/mobile twins under one manifest id
  const id = entry.mobileOf ?? entry.name.replace(/-desktop$/, '');
  manifest[id] ??= { lqip: '', alt: '', desktop: null, mobile: null };
  if (entry.mobileOf || entry.name.endsWith('-mobile')) {
    manifest[id].mobile = variant;
  } else {
    manifest[id].desktop = variant;
    manifest[id].lqip = lqip;
    manifest[id].alt = entry.alt ?? '';
  }
}

console.time('encode');
await Promise.all(SOURCES.map((e) => encodeOne(e)));

// standalone photos have no -desktop suffix: normalise ids
for (const [id, m] of Object.entries(manifest)) {
  if (!m.desktop && m.mobile) { m.desktop = m.mobile; m.mobile = null; }
}
for (const [alias, target] of Object.entries(ALIASES)) manifest[alias] = manifest[target];

// ——— OG base plate (1200×630) from the hero; scripts/make-og.mjs
//     composites the record typography over it → og-cover.jpg ———
await mkdir(path.join(OUT, 'social'), { recursive: true });
await sharp(path.join(RAW, `${P}01_09_20 AM.png`))
  .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
  .jpeg({ quality: 80, progressive: true, mozjpeg: true })
  .toFile(path.join(OUT, 'social', 'og-base.jpg'));

// ——— Favicon: ring of 40 gold ticks (one per year) on navy ———
const ticks = Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2 - Math.PI / 2;
  const long = i % 10 === 0;
  const r1 = long ? 17 : 20;
  const r2 = 26;
  const x1 = 32 + r1 * Math.cos(a), y1 = 32 + r1 * Math.sin(a);
  const x2 = 32 + r2 * Math.cos(a), y2 = 32 + r2 * Math.sin(a);
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#C9A227" stroke-width="${long ? 2.4 : 1.2}"/>`;
}).join('');
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0B0E14"/>${ticks}<circle cx="32" cy="32" r="5.5" fill="#C9A227"/></svg>`;
await writeFile(path.resolve('public/favicon.svg'), favicon);
await sharp(Buffer.from(favicon), { density: 300 }).resize(180, 180).png().toFile(path.resolve('public/apple-touch-icon.png'));

await writeFile(path.resolve('src/data/images.json'), JSON.stringify(manifest, null, 1));
console.timeEnd('encode');

// ——— Report ———
inventory.sort((a, b) => a.name.localeCompare(b.name));
console.table(inventory);
console.log(`Encoded ${inventory.length} sources → ${Object.keys(manifest).length} manifest ids (incl. aliases)`);
console.log('Rejected at intake:');
for (const r of REJECTED) console.log(` · ${r.src} — ${r.reason}`);
