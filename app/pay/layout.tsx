import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Payment",
  description: "Complete your Airesumely payment.",
  path: "/pay",
  index: false,
});

export default function PayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
