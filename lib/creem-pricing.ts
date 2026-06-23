import type { CreemBillingInterval } from "@/lib/creem-server";
import { getCreem, getCreemProductId } from "@/lib/creem-server";

export type PlanPrice = {
  price: string;
  period: string;
  name: string;
  note?: string;
};

const PERIOD_LABELS: Record<string, string> = {
  "every-month": "per month",
  "every-three-months": "every 3 months",
  "every-six-months": "every 6 months",
  "every-year": "per year",
  once: "one-time",
};

const ENV_PRICE_KEYS: Record<CreemBillingInterval, string> = {
  monthly: "CREEM_MONTHLY_PRICE",
  quarterly: "CREEM_QUARTERLY_PRICE",
  yearly: "CREEM_YEARLY_PRICE",
};

const DEFAULT_PRICES: Record<CreemBillingInterval, string> = {
  monthly: "29.90",
  quarterly: "79",
  yearly: "199",
};

export function formatCreemPrice(cents: number) {
  const value = cents / 100;
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

function priceFromEnv(interval: CreemBillingInterval) {
  const key = ENV_PRICE_KEYS[interval];
  const raw = process.env[key]?.trim();
  if (!raw) return DEFAULT_PRICES[interval];
  return raw.replace(/^\$/, "");
}

function periodForInterval(interval: CreemBillingInterval, billingPeriod?: string) {
  if (billingPeriod && billingPeriod !== "once" && PERIOD_LABELS[billingPeriod]) {
    return PERIOD_LABELS[billingPeriod];
  }
  if (interval === "monthly") return "per month";
  if (interval === "quarterly") return "every 3 months";
  return "per year";
}

export async function getCreemPlanPrices(): Promise<Record<CreemBillingInterval, PlanPrice>> {
  const intervals: CreemBillingInterval[] = ["monthly", "quarterly", "yearly"];
  const creem = getCreem();

  const results = await Promise.all(
    intervals.map(async (interval) => {
      const productId = getCreemProductId(interval);
      const fallbackPrice = priceFromEnv(interval);

      if (!creem || !productId) {
        return [
          interval,
          {
            price: fallbackPrice,
            period: periodForInterval(interval),
            name: interval === "monthly" ? "Pro Monthly" : interval === "quarterly" ? "Pro Quarterly" : "Pro Yearly",
          },
        ] as const;
      }

      try {
        const product = await creem.products.get(productId);
        return [
          interval,
          {
            price: formatCreemPrice(product.price),
            period: periodForInterval(interval, product.billingPeriod),
            name: product.name || `Pro ${interval}`,
          },
        ] as const;
      } catch (error) {
        console.error(`Failed to load Creem product ${productId}:`, error);
        return [
          interval,
          {
            price: fallbackPrice,
            period: periodForInterval(interval),
            name: interval === "monthly" ? "Pro Monthly" : interval === "quarterly" ? "Pro Quarterly" : "Pro Yearly",
          },
        ] as const;
      }
    })
  );

  return Object.fromEntries(results) as Record<CreemBillingInterval, PlanPrice>;
}
