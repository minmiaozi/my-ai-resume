import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { AI_MODEL_DISCLOSURE, pageMetadata, SUPPORT_EMAIL } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Terms of Service for Airesumely AI resume generator and cover letter tools (airesumely.com).",
  path: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <section className="content-section">
        <div className="content-container content-narrow legal-doc">
          <h1>Terms of Service</h1>
          <p className="content-meta">Last updated: June 10, 2026</p>

          <h2>1. Agreement</h2>
          <p>
            By using Airesumely at airesumely.com (including ResumeAIPro tools), you agree to
            these Terms. If you disagree, do not use the service.
          </p>

          <h2>2. Service</h2>
          <p>
            We provide AI-assisted resume bullet generation, cover letter creation, and related
            career content tools. Outputs are drafts for you to review; we do not guarantee
            interviews, offers, or ATS outcomes.
          </p>

          <h2>3. Accounts</h2>
          <p>
            You must provide accurate information and keep credentials secure. You are responsible
            for activity under your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>
            You may not misuse the platform, scrape at abusive rates, reverse-engineer systems,
            submit unlawful content, or impersonate others.
          </p>

          <h2>5. Subscriptions &amp; Refunds</h2>
          <p>
            Pro plans are billed at the price shown at checkout. You may cancel anytime via the billing portal. Refund requests within
            7 days of charge may be considered by contacting {SUPPORT_EMAIL}; see our FAQ for
            summary. Free tier limits apply as displayed on the Pricing page.
          </p>

          <h2>6. AI Disclaimer</h2>
          <p>{AI_MODEL_DISCLOSURE}</p>
          <p>
            AI-generated resume bullets and cover letters may contain errors. You are solely
            responsible for verifying accuracy and suitability before submitting materials to
            employers.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            You retain rights to content you input. You receive a license to use AI outputs for
            personal job-search purposes. Our brand, site, and software remain our property.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Airesumely is not liable for indirect,
            incidental, or consequential damages. Our total liability is limited to fees paid in
            the 12 months before the claim.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These terms are governed by applicable laws in our principal place of business, without
            regard to conflict-of-law rules. Disputes should first be raised at{" "}
            {SUPPORT_EMAIL}.
          </p>

          <h2>10. Changes</h2>
          <p>
            We may update these terms. Material changes will be posted on this page. Continued use
            after updates constitutes acceptance.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
