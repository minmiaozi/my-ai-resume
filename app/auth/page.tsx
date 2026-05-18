import { Suspense } from "react";
import AuthPageClient from "./AuthPageClient";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
          Loading…
        </div>
      }
    >
      <AuthPageClient />
    </Suspense>
  );
}
