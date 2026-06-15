import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { blogPosts } from "@/lib/blog-posts";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Career Blog — Resume & Cover Letter Guides",
  description:
    "Expert guides on resume bullets, cover letters, and ATS tips to help you land more interviews in 2026.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <PageShell>
      <section className="content-hero">
        <div className="content-container">
          <p className="content-eyebrow">Resources</p>
          <h1>Career Blog</h1>
          <p className="content-lead">
            Practical guides to help you write better resumes, cover letters, and
            job application materials.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="content-container">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article key={post.slug} className="blog-card">
                <p className="blog-meta">
                  {post.date} · {post.readMinutes} min read
                </p>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="blog-read-more">
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
