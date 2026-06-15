import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "AI Cover Letter Generator",
  description:
    "Write tailored, ATS-friendly cover letters for any role and company. Free AI cover letter generator for job seekers.",
  path: "/cover-letter-generator",
});

export default function CoverLetterGeneratorPage() {
  return (
    <PageShell>
      <section className="content-hero">
        <div className="content-container">
          <p className="content-eyebrow">Core Tool</p>
          <h1>AI Cover Letter Generator</h1>
          <p className="content-lead">
            Write a personalized cover letter that connects your experience to the
            role. Enter company details and get a polished draft in seconds.
          </p>
          <div className="content-cta-row">
            <Link href="/#tool-console" className="cta-btn-primary">
              Generate Cover Letter Free →
            </Link>
            <Link href="/blog/cover-letter-guide-for-job-seekers" className="cta-btn-secondary">
              Cover Letter Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="content-container content-narrow">
          <h2>What makes a strong cover letter?</h2>
          <ul className="content-list">
            <li>Shows genuine interest in the company and position</li>
            <li>Highlights relevant achievements, not your entire resume</li>
            <li>Reads naturally and stays on one page</li>
            <li>Ends with a clear, confident call to action</li>
          </ul>
          <h2>How it works</h2>
          <ol className="content-list">
            <li>Add the company name and target position</li>
            <li>Describe your skills and relevant experience</li>
            <li>Generate, edit, and copy your cover letter</li>
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
