import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Checkout Complete",
  description: "Your Airesumely subscription checkout is complete.",
  path: "/checkout/success",
  index: false,
});

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
