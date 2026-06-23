import { creemEnabled, getCreem } from "@/lib/creem-server";

export async function POST(req: Request) {
  try {
    const creem = getCreem();
    if (!creem) {
      return Response.json({ demo: true });
    }

    const body = (await req.json().catch(() => ({}))) as { email?: string };
    const email = body.email ? String(body.email).trim() : "";
    if (!email) {
      return Response.json(
        { error: "Email is required to open the billing portal" },
        { status: 400 }
      );
    }

    const customer = await creem.customers.retrieve(undefined, email);
    const portal = await creem.customers.generateBillingLinks({
      customerId: customer.id,
    });

    const url = portal.customerPortalLink;
    if (!url) {
      throw new Error("Creem did not return a customer portal link");
    }

    return Response.json({ url, customerPortalLink: url });
  } catch (error) {
    console.error("Billing portal error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to open billing portal";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    paymentsEnabled: creemEnabled(),
    provider: "creem",
    hint: "POST with { email } to open the Creem customer portal",
  });
}
