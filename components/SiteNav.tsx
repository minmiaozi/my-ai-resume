"use client";

import Link from "next/link";
import NavAuth from "@/components/NavAuth";

type SiteNavProps = {
  scrolled?: boolean;
};

export default function SiteNav({ scrolled = true }: SiteNavProps) {
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
          <Link href="/pricing" className="nav-cta">
            Get Pro →
          </Link>
        </div>
      </div>
    </nav>
  );
}
