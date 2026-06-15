import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Pricing — Free & Pro Plans",
  description:
    "Start free with 10 AI generations per day. Upgrade to Pro for unlimited resume bullets, cover letters, and ATS keyword matching from $7.99/month.",
  path: "/pricing",
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
