import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
          Loading…
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
