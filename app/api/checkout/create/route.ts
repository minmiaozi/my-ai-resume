import { getBaseUrl, getStripe, stripeEnabled } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return Response.json({ demo: true });
    }

    const body = (await req.json().catch(() => ({}))) as { email?: string };
    const base = getBaseUrl(req);
    const email = body.email ? String(body.email).trim() : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing?canceled=1`,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: process.env.STRIPE_TRIAL_DAYS
          ? parseInt(process.env.STRIPE_TRIAL_DAYS, 10)
          : 7,
      },
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout create error:", error);
    const message = error instanceof Error ? error.message : "Failed to start checkout";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    paymentsEnabled: stripeEnabled(),
    hint: "POST to create a checkout session",
  });
}
