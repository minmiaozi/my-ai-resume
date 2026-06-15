"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "airesumely:cookie-consent";

export type CookieConsent = "all" | "essential" | null;

export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "all" || value === "essential") return value;
  return null;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  function save(choice: CookieConsent) {
    if (!choice) return;
    localStorage.setItem(CONSENT_KEY, choice);
    window.dispatchEvent(new CustomEvent("airesumely:cookie-consent", { detail: choice }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner-inner">
        <p>
          We use essential cookies to run our AI resume generator and optional cookies for
          analytics and ads (e.g. Google AdSense). See our{" "}
          <Link href="/cookie-policy">Cookie Policy</Link> and{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
        <div className="cookie-banner-actions">
          <button type="button" className="cookie-btn cookie-btn-secondary" onClick={() => save("essential")}>
            Reject Non-Essential
          </button>
          <button type="button" className="cookie-btn cookie-btn-primary" onClick={() => save("all")}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
