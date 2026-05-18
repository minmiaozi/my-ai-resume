import { stripeEnabled } from "@/lib/stripe-server";

export async function GET() {
  return Response.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    paymentsEnabled: stripeEnabled(),
    proPriceLabel: "$7.99/month",
  });
}
