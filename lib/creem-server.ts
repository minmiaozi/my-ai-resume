import { Creem } from "creem";

export type CreemBillingInterval = "monthly" | "quarterly" | "yearly";

const PLAN_ENV_KEYS: Record<CreemBillingInterval, string> = {
  monthly: "CREEM_PLAN_ID",
  quarterly: "CREEM_JPLAN_ID",
  yearly: "CREEM_YPLAN_ID",
};

export function parseCreemBillingInterval(value: unknown): CreemBillingInterval {
  if (value === "quarterly" || value === "yearly" || value === "monthly") {
    return value;
  }
  return "monthly";
}

export function getCreemProductId(interval: CreemBillingInterval = "monthly") {
  const key = PLAN_ENV_KEYS[interval];
  return process.env[key]?.trim() || null;
}

export function creemEnabled() {
  return Boolean(process.env.CREEM_API_KEY?.trim() && getCreemProductId("monthly"));
}

let creemClient: Creem | null = null;

export function getCreem() {
  if (!creemEnabled()) return null;
  if (!creemClient) {
    const apiKey = process.env.CREEM_API_KEY!;
    creemClient = new Creem({
      apiKey,
      serverIdx: apiKey.startsWith("creem_test_") ? 1 : 0,
    });
  }
  return creemClient;
}

export function getCreemSuccessUrl() {
  return (
    process.env.NEXT_PUBLIC_CREEM_SUCCESS_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success`
  );
}
