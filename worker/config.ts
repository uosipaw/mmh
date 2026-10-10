import { env } from "cloudflare:workers";
import { settings, response } from "./shop";
export const dynamic = "force-dynamic";
export async function GET() {
  const { ownerEmail, ...config } = settings();
  return response({ ...config, ordersReady: !!env.DB, clientId: config.paypalReady ? config.clientId : "" });
}
