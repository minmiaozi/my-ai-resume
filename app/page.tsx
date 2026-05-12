"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { assistantTextFromPayload } from "@/lib/completion";

async function parseApiJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error(`服务器返回非 JSON（HTTP ${res.status}）`);
  }
}

function errorFromPayload(data: Record<string, unknown>): string | null {
  if (data.code != null && data.code !== 0 && typeof data.message === "string") {
    return data.message;
  }
  if (typeof data.error === "string") return data.error;
  return null;
}

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [bulletText, setBulletText] = useState("");
  const [bulletVisible, setBulletVisible] = useState(false);
  const [bulletMainLoading, setBulletMainLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [coverText, setCoverText] = useState("");
  const [coverVisible, setCoverVisible] = useState(false);
  const [coverMainLoading, setCoverMainLoading] = useState(false);

  const [copyHint, setCopyHint] = useState<"bullet" | "cover" | null>(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function generateBullets(mode: "primary" | "regenerate") {
    const job = jobTitle.trim();
    const content = workExperience.trim();
    if (!job || !content) {
      alert("Please fill in job title and your work experience");
      return;
    }

    setBulletVisible(true);
    setBulletText("Generating optimized bullets...");
    if (mode === "primary") setBulletMainLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "你是专业的简历优化师，把用户的经历改成专业、简洁、适合投递的简历要点。",
            },
            {
              role: "user",
              content: `求职岗位：${job}，经历：${content}`,
            },
          ],
        }),
      });

      const data = await parseApiJson(res);
      const err = errorFromPayload(data);
      if (err) throw new Error(err);
      if (!res.ok) throw new Error((data.error as string) || `请求失败 (${res.status})`);

      const text =
        (typeof data.result === "string" && data.result) || assistantTextFromPayload(data);
      if (!text) {
        console.error("Unexpected API payload:", data);
        throw new Error("模型未返回正文（响应格式异常）");
      }
      setBulletText(text);
    } catch (err) {
      console.error(err);
      setBulletText("错误：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      if (mode === "primary") setBulletMainLoading(false);
    }
  }

  async function generateCoverLetter(mode: "primary" | "regenerate") {
    const company = companyName.trim();
    const position = targetPosition.trim();
    const skills = userSkills.trim();
    if (!company || !position || !skills) {
      alert("Please fill in all required fields");
      return;
    }

    setCoverVisible(true);
    setCoverText("Generating your cover letter...");
    if (mode === "primary") setCoverMainLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a professional career writer who writes clear, compelling cover letters for international job applications.",
            },
            {
              role: "user",
              content: `Write a professional cover letter in English for the following:
Company: ${company}
Position: ${position}
Candidate background and fit: ${skills}`,
            },
          ],
        }),
      });

      const data = await parseApiJson(res);
      const err = errorFromPayload(data);
      if (err) throw new Error(err);
      if (!res.ok) throw new Error((data.error as string) || `请求失败 (${res.status})`);

      const text =
        (typeof data.result === "string" && data.result) || assistantTextFromPayload(data);
      if (!text) {
        console.error("Unexpected API payload:", data);
        throw new Error("模型未返回正文（响应格式异常）");
      }
      setCoverText(text);
    } catch (err) {
      console.error(err);
      setCoverText("错误：" + (err instanceof Error ? err.message : String(err)));
    } finally {
      if (mode === "primary") setCoverMainLoading(false);
    }
  }

  function copyText(text: string, which: "bullet" | "cover") {
    void navigator.clipboard.writeText(text).then(() => {
      setCopyHint(which);
      setTimeout(() => setCopyHint(null), 2000);
    });
  }

  return (
    <>
      <nav className={`navbar${navScrolled ? " scrolled" : ""}`} id="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            ResumeAIPro
          </Link>
          <div className="nav-links">
            <a href="#tools" className="nav-link">
              Tools
            </a>
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a href="#blog" className="nav-link">
              Blog
            </a>
            <a href="#pricing" className="nav-cta">
              Get Pro →
            </a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-container">
          <h1>
            Land Your Dream Job with<br />
            <span className="highlight">AI-Powered</span> Documents
          </h1>
          <p className="hero-subtitle">
            Generate professional cover letters and recruiter-approved resume bullets in seconds.
            No templates, no hassle—just instant results tailored to your experience.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">50K+</div>
              <div className="hero-stat-label">Job seekers helped</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">4.9/5</div>
              <div className="hero-stat-label">User satisfaction</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">&lt;10s</div>
              <div className="hero-stat-label">Average generation time</div>
            </div>
          </div>
        </div>
      </section>

      <section className="tools-section" id="tools">
        <div className="tools-container">
          <div className="tools-header">
            <h2>Start Creating in Seconds</h2>
            <p>
              Two powerful tools, zero learning curve. Just paste your details and let AI do the
              heavy lifting.
            </p>
          </div>

          <div className="tools-grid">
            <div className="tool-card">
              <div className="tool-card-header">
                <div className="tool-icon">📝</div>
                <div>
                  <h3>Resume Bullet Points</h3>
                  <div className="tool-card-subtitle">Transform experience into impact</div>
                </div>
              </div>

              <div className="input-group">
                <label>Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Sales Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Your Work Experience</label>
                <textarea
                  placeholder="Paste your job responsibilities, achievements, or rough notes here..."
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                />
              </div>

              <button
                type="button"
                className={`generate-btn${bulletMainLoading ? " loading" : ""}`}
                disabled={bulletMainLoading}
                onClick={() => void generateBullets("primary")}
              >
                Generate Professional Bullets ✨
              </button>

              <div className={`result-box${bulletVisible ? " visible" : ""}`} id="bulletResult">
                <div className="result-label">AI-Generated Bullet Points</div>
                <div className="result-content" id="bulletContent">
                  {bulletText}
                </div>
                <div className="result-actions">
                  <button
                    type="button"
                    className="result-action-btn primary"
                    onClick={() => copyText(bulletText, "bullet")}
                  >
                    {copyHint === "bullet" ? "✓ Copied!" : "📋 Copy All"}
                  </button>
                  <button
                    type="button"
                    className="result-action-btn"
                    onClick={() => void generateBullets("regenerate")}
                  >
                    🔄 Regenerate
                  </button>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-card-header">
                <div className="tool-icon">✉️</div>
                <div>
                  <h3>Cover Letter</h3>
                  <div className="tool-card-subtitle">Stand out from the stack</div>
                </div>
              </div>

              <div className="input-group">
                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Amazon"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Position</label>
                <input
                  type="text"
                  placeholder="e.g. Product Manager"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Your Skills &amp; Experience</label>
                <textarea
                  placeholder="Describe your relevant experience, key achievements, and why you're a great fit..."
                  value={userSkills}
                  onChange={(e) => setUserSkills(e.target.value)}
                />
              </div>

              <button
                type="button"
                className={`generate-btn${coverMainLoading ? " loading" : ""}`}
                disabled={coverMainLoading}
                onClick={() => void generateCoverLetter("primary")}
              >
                Generate Cover Letter ✨
              </button>

              <div className={`result-box${coverVisible ? " visible" : ""}`} id="coverResult">
                <div className="result-label">AI-Generated Cover Letter</div>
                <div className="result-content" id="coverContent">
                  {coverText}
                </div>
                <div className="result-actions">
                  <button
                    type="button"
                    className="result-action-btn primary"
                    onClick={() => copyText(coverText, "cover")}
                  >
                    {copyHint === "cover" ? "✓ Copied!" : "📋 Copy All"}
                  </button>
                  <button
                    type="button"
                    className="result-action-btn"
                    onClick={() => void generateCoverLetter("regenerate")}
                  >
                    🔄 Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="features-container">
          <div className="features-header">
            <h2>Why Job Seekers Love Us</h2>
            <p>
              Built by hiring experts, powered by advanced AI. Here&apos;s what makes us different.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>
                No waiting, no templates to fill. Just paste your details and get professional
                content in under 10 seconds.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>ATS-Optimized</h3>
              <p>
                Our bullets are crafted to pass Applicant Tracking Systems and catch recruiters&apos;
                attention in seconds.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>No Sign-Up Required</h3>
              <p>
                Start using immediately. No email, no password, no credit card. Just pure value,
                zero friction.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Recruiter-Approved</h3>
              <p>
                Our prompts are designed by hiring managers who&apos;ve reviewed 10,000+ resumes. We
                know what works.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>
                Optimized for US, UK, EU, and international job markets. Tailored for different
                industries and experience levels.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Always Improving</h3>
              <p>
                Our AI models are continuously updated based on the latest hiring trends and
                recruiter feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="pricing">
        <div className="cta-container">
          <h2>Ready to Land More Interviews?</h2>
          <p>
            Join 50,000+ job seekers who&apos;ve transformed their applications with AI-powered
            documents.
          </p>
          <div className="cta-buttons">
            <a href="#tools" className="cta-btn-primary">
              Start Free →
            </a>
            <a href="#pricing" className="cta-btn-secondary">
              View Pro Plans
            </a>
          </div>
        </div>
      </section>

      <footer className="footer" id="blog">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#tools">Resume Bullets</a>
                </li>
                <li>
                  <a href="#tools">Cover Letter</a>
                </li>
                <li>
                  <a href="#features">Pro Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#blog">Career Tips</a>
                </li>
                <li>
                  <a href="#blog">Resume Guide</a>
                </li>
                <li>
                  <a href="#blog">Interview Prep</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Disclaimer</a>
                </li>
                <li>
                  <a href="mailto:hello@resumeaipro.pro">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <ul>
                <li>
                  <a href="#">Twitter</a>
                </li>
                <li>
                  <a href="#">LinkedIn</a>
                </li>
                <li>
                  <a href="#">Reddit</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 ResumeAIPro. All rights reserved.</p>
            <div className="footer-social">
              <a href="#" title="Twitter">
                𝕏
              </a>
              <a href="#" title="LinkedIn">
                in
              </a>
              <a href="#" title="Reddit">
                ⟪
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
