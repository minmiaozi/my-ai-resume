export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-write-resume-bullet-points",
    title: "How to Write Resume Bullet Points That Get Interviews",
    excerpt:
      "Turn vague job duties into measurable achievements recruiters actually want to read.",
    date: "2026-05-01",
    readMinutes: 6,
    content: [
      "Strong resume bullets start with an action verb, describe what you did, and show impact with numbers whenever possible.",
      "Instead of writing \"Responsible for sales,\" try \"Increased regional revenue 18% by rebuilding the outbound pipeline and shortening follow-up cycles.\"",
      "Keep each bullet focused on one achievement. Recruiters scan quickly, so clarity beats length.",
      "Match your bullets to the job description. Mirror keywords naturally, but avoid stuffing unrelated terms.",
      "Use ResumeAIPro's bullet generator to turn rough notes into polished bullets in seconds, then edit the output to match your voice.",
    ],
  },
  {
    slug: "cover-letter-guide-for-job-seekers",
    title: "Cover Letter Guide: What to Write in 2026",
    excerpt:
      "A practical structure for cover letters that feel personal, professional, and easy to customize.",
    date: "2026-05-10",
    readMinutes: 5,
    content: [
      "Open with why you are interested in the company and role. One specific detail beats a generic compliment.",
      "In the middle paragraph, connect your strongest experience to the job's top requirements.",
      "Close with confidence: restate your fit, thank the reader, and invite next steps.",
      "Keep cover letters to one page. Hiring managers prefer concise, relevant writing over long summaries of your entire career.",
      "Generate a first draft with AI, then personalize examples so the letter sounds like you—not a template.",
    ],
  },
  {
    slug: "ats-resume-tips",
    title: "ATS Resume Tips: Pass Screening Without Sounding Robotic",
    excerpt:
      "Help applicant tracking systems read your resume while keeping it human for recruiters.",
    date: "2026-05-18",
    readMinutes: 7,
    content: [
      "Use standard section headings like Experience, Education, and Skills. Creative headings can confuse parsers.",
      "Avoid tables, text boxes, and graphics for core content. Simple formatting is more reliable.",
      "Include role-relevant keywords from the posting, especially tools, certifications, and domain terms.",
      "Quantify outcomes wherever you can. Numbers improve both ATS relevance signals and human readability.",
      "Pair ATS-friendly structure with strong bullet writing. Tools and keywords alone will not replace clear achievements.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
