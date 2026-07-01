import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { SITE_URL } from "@/lib/site-metadata";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/resume-bullet-generator", priority: 0.95, changeFrequency: "weekly" },
  { path: "/cover-letter-generator", priority: 0.95, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/payment/success", priority: 0.7, changeFrequency: "monthly" },
];

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const builtAt = new Date();

  const pages: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: builtAt,
    changeFrequency,
    priority,
  }));

  const posts: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...pages, ...posts];
}
