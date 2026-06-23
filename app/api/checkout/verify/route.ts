import { creemEnabled, getCreem } from "@/lib/creem-server";
import type { CheckoutEntity } from "creem/models/components";

function customerEmail(checkout: CheckoutEntity) {
  if (checkout.customer && typeof checkout.customer === "object" && "email" in checkout.customer) {
    return String(checkout.customer.email || "");
  }
  return "";
}

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const checkoutId = params.get("checkout_id") || params.get("session_id");
    if (!checkoutId) {
      return Response.json({ error: "checkout_id is required" }, { status: 400 });
    }

    const creem = getCreem();
    if (!creem) {
      return Response.json({
        active: true,
        demo: true,
        status: "trialing",
        email: "demo@resumeaipro.pro",
      });
    }

    const checkout = await creem.checkouts.retrieve(checkoutId);
    const status = String(checkout.status || "").toLowerCase();
    const active = status === "completed" || Boolean(checkout.order);

    return Response.json({
      active,
      status: checkout.status || (active ? "active" : "pending"),
      email: customerEmail(checkout),
      checkoutId,
      orderId: checkout.order?.id || null,
      subscriptionId:
        typeof checkout.subscription === "string"
          ? checkout.subscription
          : checkout.subscription?.id || null,
    });
  } catch (error) {
    console.error("Checkout verify error:", error);
    const message = error instanceof Error ? error.message : "Verification failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
