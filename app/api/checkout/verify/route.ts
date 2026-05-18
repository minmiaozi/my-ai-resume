import { getStripe } from "@/lib/stripe-server";

export async function GET(req: Request) {
  try {
    const sessionId = new URL(req.url).searchParams.get("session_id");
    if (!sessionId) {
      return Response.json({ error: "session_id is required" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return Response.json({
        active: true,
        demo: true,
        status: "trialing",
        email: "demo@resumeaipro.pro",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      session.status === "open";

    let subscriptionStatus = "active";
    if (session.subscription) {
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      const sub = await stripe.subscriptions.retrieve(subId);
      subscriptionStatus = sub.status;
    }

    const active = paid && ["active", "trialing"].includes(subscriptionStatus);

    return Response.json({
      active,
      status: subscriptionStatus,
      email: session.customer_details?.email || session.customer_email || "",
      sessionId,
    });
  } catch (error) {
    console.error("Checkout verify error:", error);
    const message = error instanceof Error ? error.message : "Verification failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
