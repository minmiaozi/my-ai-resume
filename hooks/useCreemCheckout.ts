"use client";

import { useCallback, useState } from "react";
import { type BillingInterval, startCheckout } from "@/lib/billing";

export function useCreemCheckout() {
  const [loadingBilling, setLoadingBilling] = useState<BillingInterval | null>(null);

  const checkout = useCallback(
    async (options?: { email?: string; billing?: BillingInterval; onSuccess?: () => void }) => {
      const billing = options?.billing || "monthly";
      setLoadingBilling(billing);
      try {
        await startCheckout({ ...options, billing });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Checkout failed");
      } finally {
        setLoadingBilling(null);
      }
    },
    []
  );

  return { checkout, loading: loadingBilling !== null, loadingBilling };
}
