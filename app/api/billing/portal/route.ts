import { getBaseUrl, getStripe } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    if (!stripe) {
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

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return Response.json({ error: "No billing account found for this email" }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${getBaseUrl(req)}/pricing`,
    });

    return Response.json({ url: portal.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to open billing portal";
    return Response.json({ error: message }, { status: 500 });
  }
}
