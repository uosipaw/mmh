import { env } from "cloudflare:workers";
import { settings, response } from "./shop";
export const dynamic = "force-dynamic";
export async function GET() {
  const { ownerEmail, ...config } = settings();
  const ordersReady = !!env.DB;
  const paypalReady = config.paypalReady && ordersReady;
  return response({ ...config, ordersReady, paypalReady, clientId: paypalReady ? config.clientId : "" });
}
