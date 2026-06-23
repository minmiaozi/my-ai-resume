import {
  creemEnabled,
  getCreem,
  getCreemProductId,
  getCreemSuccessUrl,
  parseCreemBillingInterval,
} from "@/lib/creem-server";

export async function POST(req: Request) {
  try {
    const creem = getCreem();
    if (!creem) {
      return Response.json({ demo: true });
    }

    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      billing?: string;
    };
    const email = body.email ? String(body.email).trim() : undefined;
    const billing = parseCreemBillingInterval(body.billing);
    const productId = getCreemProductId(billing);

    if (!productId) {
      return Response.json(
        { error: `Creem product ID is not configured for ${billing} billing` },
        { status: 400 }
      );
    }

    const checkout = await creem.checkouts.create({
      productId,
      customer: email ? { email } : undefined,
      successUrl: getCreemSuccessUrl(),
      metadata: {
        billing,
      },
    });

    const checkoutUrl = checkout.checkoutUrl;
    if (!checkoutUrl) {
      throw new Error("Creem did not return a checkout URL");
    }

    return Response.json({
      checkoutUrl,
      url: checkoutUrl,
      checkoutId: checkout.id,
      billing,
      productId,
    });
  } catch (error) {
    console.error("Checkout create error:", error);
    const message = error instanceof Error ? error.message : "Failed to start checkout";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    paymentsEnabled: creemEnabled(),
    provider: "creem",
    plans: {
      monthly: getCreemProductId("monthly"),
      quarterly: getCreemProductId("quarterly"),
      yearly: getCreemProductId("yearly"),
    },
    hint: "POST { email?, billing?: monthly|quarterly|yearly } to create a Creem checkout session",
  });
}
