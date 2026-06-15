import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import { pageMetadata } from "@/lib/site-metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Article Not Found" };
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <PageShell>
      <article className="content-section">
        <div className="content-container content-narrow">
          <p className="blog-meta">
            <Link href="/blog">← Back to Blog</Link>
          </p>
          <h1>{post.title}</h1>
          <p className="blog-meta">
            {post.date} · {post.readMinutes} min read
          </p>
          <p className="content-lead">{post.excerpt}</p>
          {post.content.map((paragraph) => (
            <p key={paragraph} className="content-paragraph">
              {paragraph}
            </p>
          ))}
          <div className="content-cta-row">
            <Link href="/#tool-console" className="cta-btn-primary">
              Try the Free AI Tools →
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
