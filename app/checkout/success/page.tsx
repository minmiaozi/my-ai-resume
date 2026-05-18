"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyCheckoutSession } from "@/lib/billing";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("We couldn't verify your payment.");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const isDemo = searchParams.get("demo") === "1";

    (async () => {
      try {
        if (isDemo) {
          setState("success");
          return;
        }
        if (!sessionId) {
          setErrorMsg("Missing checkout session. Please try again from the pricing page.");
          setState("error");
          return;
        }
        await verifyCheckoutSession(sessionId);
        setState("success");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Verification failed.");
        setState("error");
      }
    })();
  }, [searchParams]);

  return (
    <div className="checkout-success-page">
      <div className="checkout-success-card">
        {state === "loading" ? (
          <>
            <div className="checkout-spinner" aria-hidden />
            <p className="checkout-status">Confirming your subscription…</p>
          </>
        ) : null}

        {state === "success" ? (
          <>
            <div className="checkout-icon">✓</div>
            <h1>You&apos;re on Pro!</h1>
            <p>
              Unlimited AI generations, exports, and priority support are now active on your
              account.
            </p>
            <div className="checkout-actions">
              <Link href="/#tools" className="checkout-btn checkout-btn-primary">
                Start creating
              </Link>
              <Link href="/pricing" className="checkout-btn checkout-btn-secondary">
                View plan details
              </Link>
            </div>
          </>
        ) : null}

        {state === "error" ? (
          <>
            <h1>Something went wrong</h1>
            <p className="checkout-status checkout-status-error">{errorMsg}</p>
            <div className="checkout-actions">
              <Link href="/pricing" className="checkout-btn checkout-btn-primary">
                Back to pricing
              </Link>
              <a href="mailto:hello@resumeaipro.pro" className="checkout-btn checkout-btn-secondary">
                Contact support
              </a>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="checkout-success-page">
          <div className="checkout-success-card">
            <div className="checkout-spinner" aria-hidden />
            <p className="checkout-status">Loading…</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
