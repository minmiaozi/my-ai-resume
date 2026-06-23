import { getSession } from "./auth";

export type BillingInterval = "monthly" | "quarterly" | "yearly";

export const SUBSCRIPTION_KEY = "resumeaipro_subscription";
export const USAGE_KEY = "resumeaipro_usage";
export const FREE_DAILY_LIMIT = 10;

export type Subscription = {
  plan: "pro";
  status: string;
  email?: string;
  source?: string;
  sessionId?: string | null;
  expiresAt?: number | null;
  updatedAt?: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageAvailable() {
  return typeof window !== "undefined";
}

export function getSubscription(): Subscription | null {
  if (!storageAvailable()) return null;
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    return raw ? (JSON.parse(raw) as Subscription) : null;
  } catch {
    return null;
  }
}

export function setSubscription(sub: Subscription | null) {
  if (!storageAvailable()) return;
  if (sub) localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  else localStorage.removeItem(SUBSCRIPTION_KEY);
  window.dispatchEvent(new CustomEvent("resumeaipro:subscription", { detail: sub }));
}

export function isPro() {
  const sub = getSubscription();
  if (!sub || sub.plan !== "pro") return false;
  if (sub.status === "active" || sub.status === "trialing") return true;
  if (sub.expiresAt && Date.now() < sub.expiresAt) return true;
  return false;
}

export function isDemoPro() {
  const sub = getSubscription();
  return Boolean(sub && sub.plan === "pro" && sub.source === "demo");
}

export function getUsage() {
  if (!storageAvailable()) return { date: todayKey(), count: 0 };
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (data.date !== todayKey()) return { date: todayKey(), count: 0 };
    return data as { date: string; count: number };
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

export function incrementUsage() {
  const usage = getUsage();
  usage.count += 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  return usage.count;
}

export function canGenerate(): { ok: true } | { ok: false; message: string } {
  if (isPro()) return { ok: true };
  const usage = getUsage();
  if (usage.count >= FREE_DAILY_LIMIT) {
    return {
      ok: false,
      message: `Free plan limit reached (${FREE_DAILY_LIMIT}/day). Upgrade to Pro for unlimited generations.`,
    };
  }
  return { ok: true };
}

export function getSessionEmail() {
  const session = getSession();
  if (!session) return "";
  if (session.type === "email" || session.type === "google") return session.identifier;
  return "";
}

export async function parseJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    if (text.trim().startsWith("<")) {
      throw new Error(
        "API returned HTML instead of JSON. Restart `npm run dev` in the my-ai-resume folder."
      );
    }
    throw new Error(text.slice(0, 160) || "Invalid server response");
  }
}

export async function fetchPublicConfig() {
  const res = await fetch("/api/config");
  if (!res.ok) return {};
  return parseJsonResponse(res);
}

export function activatePro(payload: {
  status?: string;
  email?: string;
  source?: string;
  sessionId?: string | null;
  expiresAt?: number | null;
}) {
  setSubscription({
    plan: "pro",
    status: payload.status || "active",
    email: payload.email || "",
    source: payload.source || "creem",
    sessionId: payload.sessionId ?? null,
    expiresAt: payload.expiresAt ?? null,
    updatedAt: Date.now(),
  });
}

export async function startCheckout(options?: {
  email?: string;
  billing?: BillingInterval;
  onSuccess?: () => void;
}) {
  const email = options?.email || getSessionEmail();
  const billing = options?.billing || "monthly";
  const res = await fetch("/api/checkout/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email || undefined, billing }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error((data.error as string) || "Checkout failed");

  if (data.demo) {
    const ok = confirm(
      "Demo mode: simulate a successful Pro subscription?\n\nFor local dev, set CREEM_API_KEY and CREEM_PLAN_ID in .env.local."
    );
    if (!ok) return;
    activatePro({
      status: "trialing",
      source: "demo",
      email: email || "demo@resumeaipro.pro",
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    if (options?.onSuccess) options.onSuccess();
    else window.location.href = "/checkout/success?demo=1";
    return;
  }

  if (typeof data.checkoutUrl === "string") {
    window.location.href = data.checkoutUrl;
    return;
  }

  if (typeof data.url === "string") {
    window.location.href = data.url;
    return;
  }
  throw new Error("No checkout URL returned");
}

export async function verifyCheckoutSession(checkoutId: string) {
  const res = await fetch(
    `/api/checkout/verify?checkout_id=${encodeURIComponent(checkoutId)}`
  );
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error((data.error as string) || "Verification failed");
  if (data.active) {
    activatePro({
      status: (data.status as string) || "active",
      email: (data.email as string) || "",
      source: data.demo ? "demo" : "creem",
      sessionId: checkoutId,
      expiresAt: (data.expiresAt as number) || null,
    });
  }
  return data;
}

export async function openCustomerPortal() {
  const sub = getSubscription();
  const email = sub?.email || getSessionEmail();
  const res = await fetch("/api/billing/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email || undefined }),
  });
  const data = await parseJsonResponse(res);
  if (data.demo) {
    alert("Demo mode: complete a real checkout first to manage billing in Creem.");
    return;
  }
  if (!res.ok) {
    alert((data.error as string) || "Failed to open billing portal");
    return;
  }
  const url =
    typeof data.customerPortalLink === "string"
      ? data.customerPortalLink
      : typeof data.url === "string"
        ? data.url
        : null;
  if (url) window.location.href = url;
  else if (data.error) alert(data.error as string);
}
