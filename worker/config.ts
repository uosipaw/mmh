import { env } from "cloudflare:workers";
import { settings, response } from "./shop";
export const dynamic = "force-dynamic";
export async function GET() {
  const { ownerEmail, ...config } = settings();
  let ordersReady = false;
  if (env.DB) {
    try {
      await env.DB.prepare('SELECT id FROM bead_orders LIMIT 1').first();
      ordersReady = true;
    } catch { /* Database provisioned but schema not migrated yet. */ }
  }
  const paypalReady = config.paypalReady && ordersReady;
  return response({ ...config, ordersReady, paypalReady, clientId: paypalReady ? config.clientId : "" });
}
