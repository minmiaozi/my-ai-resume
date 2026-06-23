"use client";

import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import { useCreemCheckout } from "@/hooks/useCreemCheckout";

type SiteNavProps = {
  scrolled?: boolean;
};

export default function SiteNav({ scrolled = true }: SiteNavProps) {
  const { checkout, loading } = useCreemCheckout();

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">⚡</div>
          ResumeAIPro
        </Link>
        <div className="nav-links">
          <Link href="/resume-bullet-generator" className="nav-link">
            Resume Bullets
          </Link>
          <Link href="/cover-letter-generator" className="nav-link">
            Cover Letter
          </Link>
          <Link href="/pricing" className="nav-link">
            Pricing
          </Link>
          <Link href="/blog" className="nav-link">
            Blog
          </Link>
          <NavAuth />
          <button
            type="button"
            className="nav-cta"
            onClick={() => void checkout()}
            disabled={loading}
          >
            {loading ? "Loading…" : "Get Pro →"}
          </button>
        </div>
      </div>
    </nav>
  );
}
