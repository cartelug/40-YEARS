#!/usr/bin/env bash
# Publish the built site to the repository root (the live-site branch layout).
# Run from /site:  bash scripts/publish-root.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
node scripts/make-pdf.mjs
node scripts/make-og.mjs
npm run build

ROOT=..
# remove previously published output (never touches site/, assets/, content-notion/)
rm -rf "$ROOT/_astro" "$ROOT/accessibility" "$ROOT/downloads" "$ROOT/fonts" \
       "$ROOT/images" "$ROOT/print-record" "$ROOT/sources"
rm -f "$ROOT/index.html" "$ROOT/404.html" "$ROOT/_headers" "$ROOT/robots.txt" \
      "$ROOT/sitemap.xml" "$ROOT/favicon.svg" "$ROOT/apple-touch-icon.png" "$ROOT/.nojekyll"

cp -r dist/. "$ROOT/"
touch "$ROOT/.nojekyll"
echo "Published dist/ → repository root."
