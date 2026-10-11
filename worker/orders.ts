import { env } from "cloudflare:workers";
import { cookies } from "./cookies";
import { settings, sameOrigin, response, paypal } from "./shop";
import { orderSchema } from "../beads/src/validation";
import { priceFor, totals, products, palettes } from "../beads/src/catalog";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return response({ error: "Please submit from the order form." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 12000) return response({ error: "Request too large." }, 413);
  let parsed;
  try { const raw = await request.text(); if (raw.length > 12000) return response({ error: "Request too large." }, 413); parsed = orderSchema.safeParse(JSON.parse(raw)); }
  catch { return response({ error: "Please check the form and try again." }, 400); }
  if (!parsed.success) return response({ error: parsed.error.issues[0]?.message || "Please check the form." }, 400);
  const data = parsed.data;
  const config = settings();
  if (data.action === "pay" && !config.paypalReady) return response({ error: "PayPal checkout is not connected yet. You can send an order request." }, 503);
  if (!env.DB) return response({ error: "Orders are temporarily unavailable. Please try again later." }, 503);
  const cookieStore = cookies(request);
  const session = cookieStore.get("bead_session")?.value || crypto.randomUUID();
  const cookieHeader = { "Set-Cookie": "bead_session=" + session + "; Path=/beads; HttpOnly; Secure; SameSite=Lax; Max-Age=604800" };
  try {
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM bead_orders WHERE session = ? AND created_at > ?").bind(session, new Date(Date.now() - 3600000).toISOString()).first<{ n: number }>();
    const existing = await env.DB.prepare("SELECT * FROM bead_orders WHERE id = ?").bind(data.requestId).first<any>();
    if (existing && existing.session !== session) return response({ error: "Please start a fresh order." }, 409);
    if (!existing && (recent?.n || 0) >= 12) return response({ error: "Please wait before placing more requests." }, 429);
    const breakdown = totals(priceFor(data.product, data.length, data.extras)!, data.quantity, data.delivery, config.shipping, config.taxBps, data.product);
    if (!existing) {
      const details = { ...data, productName: products.find(p => p.id === data.product)!.name, paletteName: palettes.find(p => p.id === data.palette)!.name, ...breakdown, pricingApproved: config.pricingReady };
      await env.DB.prepare("INSERT INTO bead_orders (id, session, created_at, status, details, total) VALUES (?, ?, ?, ?, ?, ?)").bind(data.requestId, session, new Date().toISOString(), data.action === "request" ? "awaiting_quote" : "awaiting_payment", JSON.stringify(details), breakdown.total).run();
    }
    const saved = existing || await env.DB.prepare("SELECT * FROM bead_orders WHERE id = ?").bind(data.requestId).first<any>();
    const snapshot = JSON.parse(saved.details);
    if (snapshot.action !== data.action) return response({ error: "Please start a fresh order for a different checkout option." }, 409);
    if (data.action === "request") return response({ id: saved.id, status: saved.status, total: saved.total, details: snapshot }, 200, cookieHeader);
    if (saved.paypal_id) return response({ id: saved.id, paypalId: saved.paypal_id }, 200, cookieHeader);
    const product = products.find(p => p.id === snapshot.product)!;
    const paypalOrder = await paypal("/v2/checkout/orders", {
      intent: "CAPTURE", purchase_units: [{ reference_id: saved.id, custom_id: saved.id, description: product.name + " / " + snapshot.length + ' in / ' + snapshot.paletteName,
        amount: { currency_code: "USD", value: (saved.total / 100).toFixed(2) },
        ...(snapshot.delivery === "shipping" ? { shipping: { name: { full_name: snapshot.name }, address: { address_line_1: snapshot.address, admin_area_2: snapshot.city, admin_area_1: snapshot.state, postal_code: snapshot.zip, country_code: "US" } } } : {}),
      }], payment_source: { paypal: { experience_context: { brand_name: "MDSN Arts", shipping_preference: snapshot.delivery === "shipping" ? "SET_PROVIDED_ADDRESS" : "NO_SHIPPING", user_action: "PAY_NOW" } } },
    }, saved.id);
    await env.DB.prepare("UPDATE bead_orders SET paypal_id = ? WHERE id = ?").bind(paypalOrder.id, saved.id).run();
    return response({ id: saved.id, paypalId: paypalOrder.id }, 200, cookieHeader);
  } catch { return response({ error: "We couldn’t complete your order. Your request may have been saved; please retry with the same form." }, 502, cookieHeader); }
}
