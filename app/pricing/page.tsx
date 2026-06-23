"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NavAuth from "@/components/NavAuth";
import { useCreemCheckout } from "@/hooks/useCreemCheckout";
import {
  type BillingInterval,
  getSubscription,
  isDemoPro,
  isPro,
  openCustomerPortal,
  parseJsonResponse,
} from "@/lib/billing";

type PlanPriceInfo = {
  price: string;
  period: string;
  name: string;
};

const PRO_FEATURES = [
  "Unlimited generations",
  "Resume bullet generator",
  "Cover letter generator",
  "Advanced AI prompts",
  "Export to Word & PDF",
  "Job description keyword matching",
  "Ad-free experience",
  "Priority email support",
] as const;

const PRO_PLANS: {
  id: BillingInterval;
  name: string;
  price: string;
  period: string;
  note: string;
  badge?: string;
  cta: string;
}[] = [
  {
    id: "monthly",
    name: "Pro Monthly",
    price: "29.90",
    period: "per month",
    note: "7-day free trial • cancel anytime",
    badge: "Most Popular",
    cta: "Start 7-Day Free Trial",
  },
  {
    id: "quarterly",
    name: "Pro Quarterly",
    price: "79",
    period: "every 3 months",
    note: "Save vs monthly • billed every 3 months",
    badge: "Save More",
    cta: "Subscribe Quarterly",
  },
  {
    id: "yearly",
    name: "Pro Yearly",
    price: "199",
    period: "per year",
    note: "Best value • billed annually",
    badge: "Best Value",
    cta: "Subscribe Yearly",
  },
];

export default function PricingPage() {
  const [proActive, setProActive] = useState(false);
  const [demoPro, setDemoPro] = useState(false);
  const [planPrices, setPlanPrices] = useState<Partial<Record<BillingInterval, PlanPriceInfo>>>({});
  const { checkout, loadingBilling } = useCreemCheckout();

  useEffect(() => {
    const refresh = () => {
      setProActive(isPro());
      setDemoPro(isDemoPro());
    };
    refresh();
    window.addEventListener("resumeaipro:subscription", refresh);
    return () => window.removeEventListener("resumeaipro:subscription", refresh);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/pricing/plans");
        if (!res.ok) return;
        const data = await parseJsonResponse(res);
        if (data.plans && typeof data.plans === "object") {
          setPlanPrices(data.plans as Partial<Record<BillingInterval, PlanPriceInfo>>);
        }
      } catch {
        // Keep static fallback prices from PRO_PLANS
      }
    })();
  }, []);

  const sub = getSubscription();
  const showManage = proActive && !demoPro;

  function onCheckout(billing: BillingInterval) {
    void checkout({ billing });
  }

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
            {!showManage ? (
              <button
                type="button"
                className="nav-cta"
                onClick={() => onCheckout("monthly")}
                disabled={loadingBilling !== null}
              >
                {loadingBilling ? "Loading…" : "Get Pro →"}
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
        <div className="pricing-container pricing-container-wide">
          <div className="pricing-grid pricing-grid-four">
            <div className="pricing-card pricing-card-compact">
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

            {PRO_PLANS.map((plan) => {
              const isLoading = loadingBilling === plan.id;
              const livePrice = planPrices[plan.id];
              const displayPrice = livePrice?.price ?? plan.price;
              const displayPeriod = livePrice?.period ?? plan.period;

              return (
                <div className="pricing-card pro pricing-card-compact" key={plan.id}>
                  {plan.badge ? <div className="pricing-badge">{plan.badge}</div> : null}
                  <div className="pricing-header">
                    <div className="pricing-name">{plan.name}</div>
                    <p className="pricing-description">
                      For serious job seekers who want maximum results
                    </p>
                  </div>
                  <div className="pricing-price">
                    <div className="price-amount">
                      <span className="price-currency">$</span>
                      {displayPrice}
                    </div>
                    <div className="price-period">{displayPeriod}</div>
                    <div className="price-note">{plan.note}</div>
                  </div>
                  <ul className="pricing-features">
                    {PRO_FEATURES.map((feature) => (
                      <li key={feature}>
                        {feature === "Unlimited generations" ? (
                          <>
                            <strong>Unlimited</strong> generations
                          </>
                        ) : (
                          feature
                        )}
                      </li>
                    ))}
                  </ul>
                  {showManage ? (
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
                      onClick={() => onCheckout(plan.id)}
                      disabled={loadingBilling !== null}
                    >
                      {isLoading
                        ? "Redirecting…"
                        : demoPro
                          ? `Upgrade — ${plan.name.replace("Pro ", "")}`
                          : plan.cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
