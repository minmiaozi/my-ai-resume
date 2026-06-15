import { blogPosts } from "@/lib/blog-posts";
import { getAppUrl } from "@/lib/app-url";

export function siteBase() {
  return getAppUrl() || "https://www.airesumely.com";
}

export function sitemapIndexXml() {
  const base = siteBase();
  const items = [
    `${base}/sitemap-main.xml`,
    `${base}/sitemap-tools.xml`,
    `${base}/sitemap-blog.xml`,
  ];
  const body = items
    .map(
      (loc) =>
        `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}

function urlEntry(loc: string, priority: string, changefreq: string) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export function urlSetXml(
  entries: Array<{ path: string; priority: string; changefreq: string }>
) {
  const base = siteBase();
  const body = entries
    .map((e) => urlEntry(`${base}${e.path}`, e.priority, e.changefreq))
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export const mainSitemapEntries = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "/pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
];

export const toolsSitemapEntries = [
  { path: "/resume-bullet-generator", priority: "0.95", changefreq: "weekly" },
  { path: "/cover-letter-generator", priority: "0.95", changefreq: "weekly" },
];

export function blogSitemapEntries() {
  return [
    { path: "/blog", priority: "0.8", changefreq: "weekly" },
    ...blogPosts.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];
}

export function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
