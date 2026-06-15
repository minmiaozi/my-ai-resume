import type { Metadata } from "next";

export const SITE_NAME = "Airesumely";
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://www.airesumely.com";

export const DEFAULT_TITLE =
  "AI Resume & Cover Letter Generator | ATS-Friendly | Airesumely";
export const DEFAULT_DESCRIPTION =
  "Generate ATS-friendly resume bullets & cover letters in seconds. Free AI tools to help you land more interviews — no sign-up required.";

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  alternates: {
    canonical: "/",
  },
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
    },
    twitter: {
      title: fullTitle,
      description,
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
