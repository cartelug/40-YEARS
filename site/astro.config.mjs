import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// Site URL: production domain to be confirmed by State House digital team.
// Update here + README before launch; sitemap/OG/canonical all derive from it.
export default defineConfig({
  site: 'https://fortyyears.go.ug',
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
    inlineStylesheets: 'auto',
    // '_astro' (default) keeps hashed JS/CSS clear of the raw /assets
    // sources when the built site is published at the repo root.
    assets: '_astro',
  },
});
