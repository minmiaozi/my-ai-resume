"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NavAuth from "@/components/NavAuth";
import {
  getSubscription,
  isPro,
  openCustomerPortal,
  startCheckout,
} from "@/lib/billing";

export default function PricingPage() {
  const [proActive, setProActive] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const refresh = () => setProActive(isPro());
    refresh();
    window.addEventListener("resumeaipro:subscription", refresh);
    return () => window.removeEventListener("resumeaipro:subscription", refresh);
  }, []);

  async function onProCheckout() {
    setCheckoutLoading(true);
    try {
      await startCheckout();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const sub = getSubscription();

  return (
    <>
      <nav className="navbar scrolled">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            ResumeAIPro
          </Link>
          <div className="nav-links">
            <Link href="/#tool-console" className="nav-link">
              Tools
            </Link>
            <Link href="/pricing" className="nav-link">
              Pricing
            </Link>
            <NavAuth />
            {!proActive ? (
              <button
                type="button"
                className="nav-cta"
                onClick={() => void onProCheckout()}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? "Loading…" : "Get Pro →"}
              </button>
            ) : null}
          </div>
        </div>
      </nav>

      <section className="pricing-hero">
        <div className="hero-container">
          <h1>
            Simple, Transparent<br />
            <span className="highlight">Pricing</span>
          </h1>
          <p className="hero-subtitle">
            Start free, upgrade when you need more power. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      <section className="pricing-section">
        <div className="pricing-container">
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <div className="pricing-name">Free Forever</div>
                <p className="pricing-description">
                  Perfect for trying out the tools and occasional use
                </p>
              </div>
              <div className="pricing-price">
                <div className="price-amount">
                  <span className="price-currency">$</span>0
                </div>
                <div className="price-period">forever</div>
                <div className="price-note">No credit card required</div>
              </div>
              <ul className="pricing-features">
                <li>10 generations per day</li>
                <li>Resume bullet generator</li>
                <li>Cover letter generator</li>
                <li>Basic AI prompts</li>
                <li className="disabled">Export to Word/PDF</li>
                <li className="disabled">Job description matching</li>
                <li className="disabled">Ad-free experience</li>
              </ul>
              <Link href="/#tool-console" className="pricing-cta btn-free">
                Get Started Free
              </Link>
            </div>

            <div className="pricing-card pro">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <div className="pricing-name">Pro</div>
                <p className="pricing-description">
                  For serious job seekers who want maximum results
                </p>
              </div>
              <div className="pricing-price">
                <div className="price-amount">
                  <span className="price-currency">$</span>7.99
                </div>
                <div className="price-period">per month</div>
                <div className="price-note">Cancel anytime • 7-day free trial</div>
              </div>
              <ul className="pricing-features">
                <li>
                  <strong>Unlimited</strong> generations
                </li>
                <li>Resume bullet generator</li>
                <li>Cover letter generator</li>
                <li>Advanced AI prompts</li>
                <li>Export to Word &amp; PDF</li>
                <li>Job description keyword matching</li>
                <li>Ad-free experience</li>
                <li>Priority email support</li>
              </ul>
              {proActive ? (
                <>
                  <p className="price-note pro-status">
                    Pro active
                    {sub?.status ? ` (${sub.status})` : ""}
                  </p>
                  <button
                    type="button"
                    className="pricing-cta btn-free"
                    onClick={() => void openCustomerPortal()}
                  >
                    Manage subscription
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="pricing-cta btn-pro"
                  onClick={() => void onProCheckout()}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Redirecting…" : "Start 7-Day Free Trial"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
