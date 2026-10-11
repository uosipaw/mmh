import { env } from "cloudflare:workers";
import { cookies } from "./cookies";
import { paypal, settings, sameOrigin, response } from "./shop";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return response({ error: "Invalid request origin." }, 403);
  if (!settings().paypalReady || !env.DB) return response({ error: "Checkout is unavailable." }, 503);
  const session = (cookies(request)).get("bead_session")?.value;
  if (!session) return response({ error: "Please return to your order form." }, 403);
  let id: string;
  try { const data = await request.json() as { id: string }; id = data.id; if (!/^[0-9a-f-]{36}$/i.test(id)) throw Error(); }
  catch { return response({ error: "Invalid order." }, 400); }
  try {
    const order = await env.DB.prepare("SELECT * FROM bead_orders WHERE id = ? AND session = ?").bind(id, session).first<any>();
    if (!order?.paypal_id) return response({ error: "Order not found." }, 404);
    if (order.status === "paid") return response({ id, status: "paid", total: order.total, details: JSON.parse(order.details) });
    // GET first so a successful payment can be reconciled after a lost response.
    let paid = await paypal("/v2/checkout/orders/" + order.paypal_id);
    if (paid.status !== "COMPLETED") paid = await paypal("/v2/checkout/orders/" + order.paypal_id + "/capture", {}, id + "-capture");
    const unit = paid.purchase_units?.find((u: any) => u.reference_id === id);
    const captures = unit?.payments?.captures || [];
    const capturedCents = captures.filter((c: any) => c.status === "COMPLETED" && c.amount?.currency_code === "USD").reduce((n: number, c: any) => n + Math.round(Number(c.amount.value) * 100), 0);
    if (paid.status !== "COMPLETED" || unit?.custom_id !== id || capturedCents !== order.total) return response({ error: "Payment is not confirmed. Please contact the shop before trying again." }, 409);
    await env.DB.prepare("UPDATE bead_orders SET status = 'paid', capture_id = ? WHERE id = ?").bind(captures[0].id, id).run();
    return response({ id, status: "paid", total: order.total, details: JSON.parse(order.details) });
  } catch { return response({ error: "We couldn’t confirm the payment. If you approved it, contact the shop before paying again." }, 502); }
}
