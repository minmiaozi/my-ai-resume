"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import NavAuth from "@/components/NavAuth";
import { useCreemCheckout } from "@/hooks/useCreemCheckout";

export function HomeNav() {
  const t = useTranslations("homepage.nav");
  const { checkout, loading } = useCreemCheckout();

  return (
    <nav className="home-nav" aria-label="Main navigation">
      <div className="home-nav-inner">
        <Link href="/" className="home-logo" aria-label={`${t("brand")} home`}>
          <span className="home-logo-mark" aria-hidden="true">
            ✦
          </span>
          {t("brand")}
        </Link>
        <div className="home-nav-links">
          <a href="#tool-console" className="home-nav-link">
            {t("tools")}
          </a>
          <a href="#features" className="home-nav-link">
            {t("features")}
          </a>
          <Link href="/pricing" className="home-nav-link">
            {t("pricing")}
          </Link>
          <Link href="/blog" className="home-nav-link hide-mobile">
            {t("blog")}
          </Link>
          <div className="home-nav-actions">
            <NavAuth />
            <button
              type="button"
              className="home-get-pro"
              onClick={() => void checkout()}
              disabled={loading}
            >
              {loading ? "Loading…" : t("getPro")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
