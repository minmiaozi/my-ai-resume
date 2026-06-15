import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description:
    "How Airesumely (airesumely.com) uses cookies for our AI resume generator and cover letter tools.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <PageShell>
      <section className="content-section">
        <div className="content-container content-narrow legal-doc">
          <h1>Cookie Policy</h1>
          <p className="content-meta">Last updated: June 10, 2026</p>

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you use Airesumely
            (airesumely.com), our AI resume generator and AI cover letter maker. They help the
            site function, remember preferences, and—only with your consent—support analytics and
            advertising.
          </p>

          <h2>2. Types of Cookies We Use</h2>
          <h3>Strictly necessary (always on)</h3>
          <p>
            Required to operate the service: session/authentication (Supabase), security, cookie
            consent choice, and basic load balancing. These cannot be disabled while using the
            site.
          </p>
          <h3>Functional</h3>
          <p>
            Remember settings such as recent generations stored locally and UI preferences. Used
            only to improve your experience with our ATS-friendly resume tools.
          </p>
          <h3>Analytics (optional)</h3>
          <p>
            Help us understand traffic and feature usage so we can improve the AI resume
            generator. Loaded only if you click &quot;Accept All&quot; in our cookie banner.
          </p>
          <h3>Advertising (optional)</h3>
          <p>
            Partners such as Google AdSense may set cookies to show relevant ads and measure ad
            performance. Loaded only with your consent via &quot;Accept All.&quot;
          </p>

          <h2>3. Your Choices</h2>
          <p>
            When you first visit, our banner lets you <strong>Accept All</strong> cookies or{" "}
            <strong>Reject Non-Essential</strong> (essential cookies only). You can change your
            mind by clearing site data in your browser or contacting hello@airesumely.com.
          </p>

          <h2>4. Third-Party Cookies</h2>
          <p>
            Third parties that may set cookies when consented or when using their features
            include Google (AdSense/Analytics), Stripe (payments), Supabase (auth), and Vercel
            (hosting). Their policies govern their use of data.
          </p>

          <h2>5. Contact</h2>
          <p>
            Questions about cookies: <a href="mailto:hello@airesumely.com">hello@airesumely.com</a>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
