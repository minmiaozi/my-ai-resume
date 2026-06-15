import { SITE_URL } from "@/lib/site-metadata";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Airesumely",
    alternateName: "ResumeAIPro",
    url: SITE_URL,
    description:
      "AI resume generator and AI cover letter maker for ATS-friendly job application content.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Airesumely AI Resume & Cover Letter Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier with daily AI resume bullet and cover letter generations",
    },
    description:
      "Generate ATS-friendly resume bullets and tailored cover letters with AI for job seekers worldwide.",
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Airesumely",
    url: SITE_URL,
    email: "hello@airesumely.com",
    logo: `${SITE_URL}/favicon.ico`,
  };
}
