"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  return (
    <div className="auth-page">
      <AuthForm
        initialMode={initialMode}
        onClose={() => router.push("/")}
      />
    </div>
  );
}
