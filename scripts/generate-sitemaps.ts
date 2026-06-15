/**
 * Phase 1 SEO Blueprint — post-build sitemap generator
 *
 * Run after `next build` (via npm `postbuild`):
 *   - public/sitemap.xml          → index
 *   - public/sitemap-pages.xml    → static App/Pages routes
 *   - public/sitemap-posts.xml    → blog posts (CMS API or local fallback)
 *
 * Env:
 *   NEXT_PUBLIC_APP_URL  Site origin, e.g. https://www.airesumely.com
 *   CMS_POSTS_API_URL    Optional CMS endpoint, e.g. https://cms.example.com/api/posts
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { blogPosts } from "../lib/blog-posts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const APP_DIR = path.join(PROJECT_ROOT, "app");
const PAGES_DIR = path.join(PROJECT_ROOT, "pages");

/** Canonical production domain */
const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.airesumely.com"
).replace(/\/$/, "");

/** CMS posts endpoint (override in production when a headless CMS is wired) */
const CMS_POSTS_API_URL = process.env.CMS_POSTS_API_URL?.trim() || "";

/** Legal / low-intent pages excluded from sitemap-pages.xml per SEO blueprint */
const EXCLUDED_PATHS = new Set([
  "/privacy-policy",
  "/terms-of-service",
  "/cookie-policy",
  "/refund-policy",
]);

/** App-router segments never indexed as static pages */
const EXCLUDED_DIR_NAMES = new Set([
  "api",
  "auth",
  "pay",
  "checkout",
  "create-order",
]);

const PAGE_FILE = /^page\.(tsx|ts|jsx|js)$/;

type UrlEntry = {
  loc: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: string;
};

type CmsPost = {
  slug: string;
  updatedAt?: string;
  date?: string;
};

/** Escape XML text nodes */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(input?: string): string {
  if (input) {
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

function urlEntryTag(entry: UrlEntry): string {
  return [
    "  <url>",
    `    <loc>${xmlEscape(entry.loc)}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function urlSetXml(entries: UrlEntry[]): string {
  const body = entries.map(urlEntryTag).join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
  ].join("\n");
}

function sitemapIndexXml(childNames: string[]): string {
  const lastmod = new Date().toISOString();
  const body = childNames
    .map(
      (name) =>
        [
          "  <sitemap>",
          `    <loc>${xmlEscape(`${SITE_URL}/${name}`)}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          "  </sitemap>",
        ].join("\n")
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</sitemapindex>",
  ].join("\n");
}

/** Convert `app/foo/page.tsx` → `/foo`, `app/page.tsx` → `/` */
function routePathFromPageFile(rootDir: string, pageFile: string): string {
  const dir = path.dirname(pageFile);
  const rel = path.relative(rootDir, dir).replace(/\\/g, "/");
  if (!rel || rel === ".") return "/";
  return `/${rel}`;
}

/** Recursively collect static `page.*` files (skips dynamic `[slug]` segments). */
async function collectPageFiles(dir: string, bucket: string[]): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name.startsWith("(")) continue;
      if (entry.name.includes("[") || entry.name.includes("]")) continue;
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      await collectPageFiles(fullPath, bucket);
      continue;
    }

    if (entry.isFile() && PAGE_FILE.test(entry.name)) {
      bucket.push(fullPath);
    }
  }
}

/** Scan Next.js `app/` and legacy `pages/` directories for static routes. */
async function discoverStaticPaths(): Promise<string[]> {
  const pageFiles: string[] = [];

  await collectPageFiles(APP_DIR, pageFiles);

  try {
    await fs.access(PAGES_DIR);
    await collectPageFiles(PAGES_DIR, pageFiles);
  } catch {
    // No Pages Router directory — App Router only (this project).
  }

  const paths = new Set<string>();

  for (const file of pageFiles) {
    const root = file.includes(`${path.sep}app${path.sep}`) ? APP_DIR : PAGES_DIR;
    const routePath = routePathFromPageFile(root, file);
    paths.add(routePath);
  }

  return [...paths]
    .filter((p) => !EXCLUDED_PATHS.has(p))
    .sort((a, b) => a.localeCompare(b));
}

function priorityForPath(routePath: string): UrlEntry["priority"] {
  if (routePath === "/") return "1.0";
  if (
    routePath === "/resume-bullet-generator" ||
    routePath === "/cover-letter-generator"
  ) {
    return "0.95";
  }
  if (routePath === "/pricing") return "0.9";
  if (routePath === "/blog") return "0.8";
  return "0.7";
}

function changefreqForPath(routePath: string): UrlEntry["changefreq"] {
  if (routePath === "/") return "daily";
  if (routePath === "/blog") return "weekly";
  return "weekly";
}

function buildPageEntries(paths: string[]): UrlEntry[] {
  const lastmod = new Date().toISOString();
  return paths.map((routePath) => ({
    loc: `${SITE_URL}${routePath === "/" ? "" : routePath}`,
    lastmod,
    changefreq: changefreqForPath(routePath),
    priority: priorityForPath(routePath),
  }));
}

/** Normalize common CMS JSON shapes into `{ slug, updatedAt? }[]` */
function normalizeCmsPosts(payload: unknown): CmsPost[] {
  const list = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        ("posts" in payload || "data" in payload)
      ? ((payload as { posts?: unknown; data?: unknown }).posts ??
        (payload as { data?: unknown }).data)
      : null;

  if (!Array.isArray(list)) return [];

  const posts: CmsPost[] = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const slug =
      typeof row.slug === "string"
        ? row.slug
        : typeof row.id === "string"
          ? row.id
          : null;
    if (!slug) continue;
    posts.push({
      slug,
      updatedAt:
        typeof row.updatedAt === "string"
          ? row.updatedAt
          : typeof row.updated_at === "string"
            ? row.updated_at
            : typeof row.date === "string"
              ? row.date
              : undefined,
    });
  }

  return posts;
}

/** Fetch blog slugs from CMS; fall back to local `lib/blog-posts.ts` when unset or failing. */
async function loadBlogPosts(): Promise<CmsPost[]> {
  if (!CMS_POSTS_API_URL) {
    console.log("[sitemap] CMS_POSTS_API_URL not set — using local blogPosts fallback.");
    return blogPosts.map((p) => ({ slug: p.slug, updatedAt: p.date }));
  }

  try {
    const res = await fetch(CMS_POSTS_API_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      throw new Error(`CMS responded with HTTP ${res.status}`);
    }

    const json: unknown = await res.json();
    const posts = normalizeCmsPosts(json);

    if (posts.length === 0) {
      throw new Error("CMS returned zero posts");
    }

    console.log(`[sitemap] Loaded ${posts.length} posts from CMS.`);
    return posts;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[sitemap] CMS fetch failed (${message}) — using local blogPosts fallback.`);
    return blogPosts.map((p) => ({ slug: p.slug, updatedAt: p.date }));
  }
}

function buildPostEntries(posts: CmsPost[]): UrlEntry[] {
  return posts.map((post) => ({
    loc: `${SITE_URL}/blog/${post.slug}`,
    lastmod: isoDate(post.updatedAt ?? post.date),
    changefreq: "monthly" as const,
    priority: "0.7",
  }));
}

async function writePublicFile(filename: string, contents: string): Promise<void> {
  const target = path.join(PUBLIC_DIR, filename);
  await fs.writeFile(target, contents, "utf8");
  console.log(`[sitemap] Wrote ${target}`);
}

async function main(): Promise<void> {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  const staticPaths = await discoverStaticPaths();
  console.log(`[sitemap] Discovered ${staticPaths.length} static page(s):`, staticPaths.join(", "));

  const pageEntries = buildPageEntries(staticPaths);
  const posts = await loadBlogPosts();
  const postEntries = buildPostEntries(posts);

  await writePublicFile("sitemap-pages.xml", urlSetXml(pageEntries));
  await writePublicFile("sitemap-posts.xml", urlSetXml(postEntries));
  await writePublicFile(
    "sitemap.xml",
    sitemapIndexXml(["sitemap-pages.xml", "sitemap-posts.xml"])
  );

  console.log("[sitemap] Done.");
}

main().catch((error) => {
  console.error("[sitemap] Fatal error:", error);
  process.exit(1);
});
