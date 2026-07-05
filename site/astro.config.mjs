import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// Currently live at GitHub Pages (project page → subpath base).
// At official launch flip to: site 'https://fortyyears.go.ug', base '/'
// and update public/robots.txt + public/sitemap.xml hostnames (see README).
export default defineConfig({
  site: 'https://cartelug.github.io',
  base: '/40-YEARS',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: true,
  // React-compatible islands via preact/compat — identical JSX authoring,
  // ~4KB gz runtime instead of ~46KB, to hold the <90KB island-JS budget.
  integrations: [preact({ compat: true })],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // external stylesheet always: @font-face URLs are CSS-relative
    // (../fonts/…) so they resolve under any base without edits
    inlineStylesheets: 'never',
    // '_astro' (default) keeps hashed JS/CSS clear of the raw /assets
    // sources when the built site is published at the repo root.
    assets: '_astro',
  },
});
