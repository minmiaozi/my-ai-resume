import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy Policy for Airesumely AI resume generator and cover letter maker (airesumely.com).",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <section className="content-section">
        <div className="content-container content-narrow legal-doc">
          <h1>Privacy Policy</h1>
          <p className="content-meta">Last updated: June 10, 2026</p>

          <h2>1. Who We Are</h2>
          <p>
            Airesumely (&quot;we&quot;, &quot;us&quot;) operates airesumely.com and provides
            ResumeAIPro-branded AI tools including an AI resume generator, ATS-friendly resume
            bullet builder, and AI cover letter maker for job seekers worldwide.
          </p>

          <h2>2. Data We Collect</h2>
          <ul className="content-list">
            <li>
              <strong>Account data:</strong> email address, name (if provided), authentication
              identifiers via Supabase.
            </li>
            <li>
              <strong>Content you submit:</strong> work history, job titles, job descriptions,
              and text you paste into our generators to create resume bullets and cover letters.
            </li>
            <li>
              <strong>Payment data:</strong> processed by Stripe; we do not store full card
              numbers.
            </li>
            <li>
              <strong>Usage &amp; technical data:</strong> IP address, browser type, pages
              visited, generation counts, and logs needed for security and product improvement.
            </li>
            <li>
              <strong>Cookies:</strong> as described in our{" "}
              <a href="/cookie-policy">Cookie Policy</a>.
            </li>
          </ul>

          <h2>3. How We Use Data</h2>
          <p>We use personal data to:</p>
          <ul className="content-list">
            <li>Provide and improve our AI resume and cover letter generation services</li>
            <li>Process subscriptions and prevent abuse or fraud</li>
            <li>Send service-related emails (account, billing, support)</li>
            <li>Comply with legal obligations</li>
            <li>Show ads (with consent) through partners such as Google AdSense</li>
          </ul>
          <p>
            We do not sell your resume content to third parties. AI processing is used solely to
            generate your requested outputs.
          </p>

          <h2>4. Legal Bases (EEA/UK)</h2>
          <p>
            Where applicable, we rely on contract performance (providing the service), legitimate
            interests (security, improvement), consent (non-essential cookies/ads), and legal
            obligation.
          </p>

          <h2>5. International Transfers</h2>
          <p>
            We use providers that may process data in the United States and other countries
            (including Supabase, Stripe, Google, and Vercel). Transfers use appropriate safeguards
            such as Standard Contractual Clauses where required.
          </p>

          <h2>6. Retention</h2>
          <p>
            Account and billing records are kept while your account is active and as required for
            tax/legal purposes. Resume text submitted for generation is not used to train public
            models; retention follows operational needs and your deletion requests.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="content-list">
            <li>Access, correct, or delete your personal data</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent for non-essential cookies or marketing</li>
            <li>Object to or restrict certain processing</li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
          <p>
            To exercise rights, email{" "}
            <a href="mailto:hello@airesumely.com">hello@airesumely.com</a>. We respond within 30
            days where required by law.
          </p>

          <h2>8. Children</h2>
          <p>
            Our service is not directed to users under 16. We do not knowingly collect data from
            children.
          </p>

          <h2>9. Contact</h2>
          <p>
            Privacy inquiries: <a href="mailto:hello@airesumely.com">hello@airesumely.com</a>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
