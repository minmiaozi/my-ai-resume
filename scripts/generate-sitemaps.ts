/**
 * Dev helper — prints sitemap URLs (production uses app/sitemap.ts).
 * Run: npm run sitemap
 */

import { buildSitemapEntries } from "../lib/sitemap-entries";

const entries = buildSitemapEntries();

console.log(`[sitemap] ${entries.length} URL(s):`);
for (const entry of entries) {
  console.log(`  ${entry.url}`);
}
