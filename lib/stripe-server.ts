import Stripe from "stripe";
import { getAppUrlFromRequest } from "@/lib/app-url";

export function stripeEnabled() {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeEnabled()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

export function getBaseUrl(req: Request): string {
  return getAppUrlFromRequest(req);
}
