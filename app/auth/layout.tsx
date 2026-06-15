import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sign In or Sign Up",
  description: "Sign in or create your Airesumely account.",
  path: "/auth",
  index: false,
});
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
