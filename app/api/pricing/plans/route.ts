import { getCreemPlanPrices } from "@/lib/creem-pricing";
import { creemEnabled } from "@/lib/creem-server";

export async function GET() {
  const plans = await getCreemPlanPrices();

  return Response.json({
    paymentsEnabled: creemEnabled(),
    plans,
  });
}
