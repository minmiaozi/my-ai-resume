"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const WHY_CHOOSE_KEYS = ["item1", "item2", "item3", "item4"] as const;
const HOW_IT_WORKS_KEYS = ["step1", "step2", "step3"] as const;
const FAQ_KEYS = ["1", "2", "3", "4"] as const;

const TESTIMONIALS = [
  { quote: "sarahQuote", author: "sarahAuthor", role: "sarahRole" },
  { quote: "jamesQuote", author: "jamesAuthor", role: "jamesRole" },
  { quote: "priyaQuote", author: "priyaAuthor", role: "priyaRole" },
] as const;

export function LandingContent() {
  const t = useTranslations("homepage");

  return (
    <>
      <section className="home-section" id="about">
        <div className="home-section-inner">
          <h2>{t("about.title")}</h2>
          <p className="home-body-text">{t("about.body")}</p>
        </div>
      </section>

      <section className="home-section" id="features">
        <div className="home-section-inner">
          <h2>{t("whyChoose.title")}</h2>
          <div className="features-grid">
            {WHY_CHOOSE_KEYS.map((key) => (
              <article className="feature-card" key={key}>
                <p>{t(`whyChoose.${key}`)}</p>
              </article>
            ))}
          </div>
          <div className="stats-row" aria-label="Platform statistics">
            <div className="stat-item">
              <div className="stat-value">{t("stats.jobSeekersValue")}</div>
              <div className="stat-label">{t("stats.jobSeekersLabel")}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{t("stats.satisfactionValue")}</div>
              <div className="stat-label">{t("stats.satisfactionLabel")}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{t("stats.generationTimeValue")}</div>
              <div className="stat-label">{t("stats.generationTimeLabel")}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section" id="how-it-works">
        <div className="home-section-inner">
          <h2>{t("howItWorks.title")}</h2>
          <ol className="steps-grid">
            {HOW_IT_WORKS_KEYS.map((key, index) => (
              <li className="step-card" key={key}>
                <div className="step-num" aria-hidden="true">
                  {index + 1}
                </div>
                <p>{t(`howItWorks.${key}`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section" id="gallery">
        <div className="home-section-inner">
          <h2>{t("gallery.title")}</h2>
          <p className="home-section-lead">{t("gallery.body")}</p>

          <div className="compare-row">
            <div className="compare-card">
              <div className="compare-label before">{t("gallery.comparisonBeforeLabel")}</div>
              <pre>{t("gallery.comparisonBefore")}</pre>
            </div>
            <div className="compare-card after">
              <div className="compare-label after">{t("gallery.comparisonAfterLabel")}</div>
              <pre>{t("gallery.comparisonAfter")}</pre>
            </div>
          </div>

          <div className="cover-sample">
            <div className="compare-label after">{t("gallery.coverSampleLabel")}</div>
            <pre>{t("gallery.coverSampleText")}</pre>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((item) => (
              <blockquote className="testimonial-card" key={item.author}>
                <p className="testimonial-quote">
                  &ldquo;{t(`gallery.testimonials.${item.quote}`)}&rdquo;
                </p>
                <footer>
                  <div className="testimonial-author">
                    {t(`gallery.testimonials.${item.author}`)}
                  </div>
                  <div className="testimonial-role">
                    {t(`gallery.testimonials.${item.role}`)}
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" id="faq">
        <div className="home-section-inner">
          <h2>{t("faq.title")}</h2>
          <div className="faq-list">
            {FAQ_KEYS.map((n) => (
              <article className="faq-item" key={n}>
                <h3>{t(`faq.q${n}`)}</h3>
                <p>{t(`faq.a${n}`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <h2 className="home-serif">{t("cta.title")}</h2>
        <p>{t("cta.subtitle")}</p>
        <div className="home-cta-btns">
          <a href="#tool-console" className="home-cta-primary">
            {t("cta.primary")}
          </a>
          <Link href="/pricing" className="home-cta-secondary">
            {t("cta.secondary")}
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <nav className="home-footer-inner" aria-label="Footer">
          <a href="#faq">{t("footer.faq")}</a>
          <Link href="/privacy-policy">{t("footer.privacy")}</Link>
          <Link href="/terms-of-service">{t("footer.terms")}</Link>
          <Link href="/cookie-policy">{t("footer.cookie")}</Link>
          <a href="#faq">{t("footer.refund")}</a>
          <a href="mailto:hello@airesumely.com">{t("footer.contact")}</a>
          <Link href="/blog">{t("footer.blog")}</Link>
        </nav>
        <p className="home-footer-copy">{t("footer.copyright")}</p>
      </footer>
    </>
  );
}
