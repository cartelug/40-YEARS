/**
 * Subset TeX Gyre Heros OTFs to latin WOFF2 for self-hosting.
 * Charset: ASCII + Latin-1 supplement + typographic punctuation
 * + ŋ/Ŋ (Luganda) so the i18n slots ship without a font swap.
 */
import subsetFont from 'subset-font';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const range = (a, b) =>
  Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');

const CHARSET =
  range(0x20, 0x7e) + // ASCII
  range(0xa0, 0xff) + // Latin-1 (Swahili-complete)
  'ŊŋŒœŠšŽžƒ' +
  '‐‑‒–—‘’‚“”„' +
  '†‡•…‰′″‹›⁄' +
  '·−→←↑↓✕€';

const JOBS = [
  ['fonts-src/texgyreheros-regular.otf', 'public/fonts/heros-regular.woff2'],
  ['fonts-src/texgyreheros-bold.otf', 'public/fonts/heros-bold.woff2'],
  ['fonts-src/texgyreheros-italic.otf', 'public/fonts/heros-italic.woff2'],
  ['fonts-src/texgyreheroscn-regular.otf', 'public/fonts/heros-cn-regular.woff2'],
  ['fonts-src/texgyreheroscn-bold.otf', 'public/fonts/heros-cn-bold.woff2'],
];

await mkdir('public/fonts', { recursive: true });
for (const [src, out] of JOBS) {
  const buf = await readFile(src);
  const woff2 = await subsetFont(buf, CHARSET, { targetFormat: 'woff2' });
  await writeFile(out, woff2);
  console.log(`${out}  ${(woff2.length / 1024).toFixed(1)}KB`);
}
