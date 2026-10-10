import { env } from "cloudflare:workers";
export function settings() {
  const e = env as unknown as Record<string, string>;
  const validInt = (value: string | undefined, max: number) => value !== undefined && /^\d+$/.test(value) && Number(value) <= max;
  const pricingReady = e.STORE_READY === "true" && validInt(e.SHIPPING_CENTS, 50000) && validInt(e.TAX_BPS, 2500);
  const mode = e.PAYPAL_MODE === "live" ? "live" : "sandbox";
  return { pricingReady, paypalReady: pricingReady && !!e.PAYPAL_CLIENT_ID && !!e.PAYPAL_CLIENT_SECRET,
    clientId: e.PAYPAL_CLIENT_ID || "", mode,
    shipping: validInt(e.SHIPPING_CENTS, 50000) ? Number(e.SHIPPING_CENTS) : 900,
    taxBps: validInt(e.TAX_BPS, 2500) ? Number(e.TAX_BPS) : 0,
    terms: e.ORDER_TERMS || "Made to order. Your request is reviewed before production. Timing and any special requests will be confirmed with you.",
    ownerEmail: (e.STORE_OWNER_EMAIL || "").trim().toLowerCase(),
  };
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export function response(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
export async function paypal(path: string, body?: unknown, idempotency?: string) {
  const e = env as unknown as Record<string, string>;
  const base = settings().mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  const auth = await fetch(base + "/v1/oauth2/token", { method: "POST", headers: { Authorization: "Basic " + btoa(e.PAYPAL_CLIENT_ID + ":" + e.PAYPAL_CLIENT_SECRET), "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  if (!auth.ok) throw new Error("PayPal is unavailable. Please try again later or send an order request.");
  const token = await auth.json() as { access_token: string };
  const result = await fetch(base + path, { method: body === undefined ? "GET" : "POST", headers: { Authorization: "Bearer " + token.access_token, "Content-Type": "application/json", Prefer: "return=representation", ...(idempotency ? { "PayPal-Request-Id": idempotency } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  const data = await result.json() as any;
  if (!result.ok) throw new Error("PayPal could not complete this step. If you approved a payment, contact the shop before retrying.");
  return data;
}
