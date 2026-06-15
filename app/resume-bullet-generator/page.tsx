import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "AI Resume Bullet Generator",
  description:
    "Turn work experience into ATS-friendly resume bullet points in seconds. Free AI resume bullet generator for job seekers.",
  path: "/resume-bullet-generator",
});

export default function ResumeBulletGeneratorPage() {
  return (
    <PageShell>
      <section className="content-hero">
        <div className="content-container">
          <p className="content-eyebrow">Core Tool</p>
          <h1>AI Resume Bullet Generator</h1>
          <p className="content-lead">
            Turn rough job notes into professional, impact-driven resume bullets.
            Paste your experience, get recruiter-ready output in seconds.
          </p>
          <div className="content-cta-row">
            <Link href="/#tool-console" className="cta-btn-primary">
              Generate Bullets Free →
            </Link>
            <Link href="/blog/how-to-write-resume-bullet-points" className="cta-btn-secondary">
              Read Resume Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="content-container content-narrow">
          <h2>Why use an AI bullet generator?</h2>
          <ul className="content-list">
            <li>Start with strong action verbs and clear outcomes</li>
            <li>Save time editing the same experience for every application</li>
            <li>Keep bullets concise and ATS-friendly</li>
            <li>Match your target role without starting from a blank page</li>
          </ul>
          <h2>How it works</h2>
          <ol className="content-list">
            <li>Enter your target job title</li>
            <li>Paste responsibilities, projects, or rough notes</li>
            <li>Click generate and copy polished bullets instantly</li>
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
