import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in or sign up · ResumeAIPro",
  description: "Sign in or create a ResumeAIPro account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
