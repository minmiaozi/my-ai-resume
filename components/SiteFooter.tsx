import Link from "next/link";
import { AI_MODEL_DISCLOSURE, SUPPORT_EMAIL } from "@/lib/site-metadata";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li>
                <Link href="/resume-bullet-generator">Resume Bullets</Link>
              </li>
              <li>
                <Link href="/cover-letter-generator">Cover Letter</Link>
              </li>
              <li>
                <Link href="/#features">Pro Features</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/blog/how-to-write-resume-bullet-points">Resume Guide</Link>
              </li>
              <li>
                <Link href="/blog/cover-letter-guide-for-job-seekers">Cover Letter Tips</Link>
              </li>
              <li>
                <Link href="/blog/ats-resume-tips">ATS Tips</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-of-service">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookie-policy">Cookie Policy</Link>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`}>Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <ul>
              <li>
                <a href="https://airesumely.com">Website</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Airesumely (ResumeAIPro). All rights reserved.</p>
          <p className="footer-ai-disclosure">{AI_MODEL_DISCLOSURE}</p>
          <p>
            Support: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
