import { env } from 'cloudflare:workers';
import { GET as config } from './config';
import { POST as orders } from './orders';
import { POST as capture } from './capture';
import { studio } from './studio';
import { response } from './shop';
import { notifyOwners } from './notifications';
const largeAssets: Record<string, string> = {
  '/images/mwah.gif': 'images/mwah.gif',
  '/images/Your paragraph text.zip': 'images/Your paragraph text.zip',
};
export default {
  scheduled(_event: unknown, _env: unknown, ctx: ExecutionContext) { ctx.waitUntil(notifyOwners()); },
  async fetch(request: Request, _env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    let path: string;
    try { path = decodeURIComponent(url.pathname); } catch { return response({ error: 'Invalid URL.' }, 400); }
    if (path === '/beads/api/config') return request.method === 'GET' ? config() : method('GET');
    if (path === '/beads/api/orders' || path === '/beads/api/capture') {
      if (request.method !== 'POST') return method('POST');
      const result = await (path.endsWith('/orders') ? orders(request) : capture(request));
      if (result.ok) ctx.waitUntil(notifyOwners());
      return result;
    }
    if (path.startsWith('/beads/api/')) return response({ error: 'Not found.' }, 404);
    if (path === '/beads/studio' || path === '/beads/studio/export') return request.method === 'GET' ? studio(request) : method('GET');
    if (path.startsWith('/beads/studio')) return response({ error: 'Not found.' }, 404);
    if (largeAssets[path]) {
      const pinnedSource = 'https://raw.githubusercontent.com/uosipaw/mmh/e5ae31c6a50621460801c20a8c5c1a25582181da/';
      return Response.redirect(pinnedSource + largeAssets[path].split('/').map(encodeURIComponent).join('/'), 302);
    }
    return env.ASSETS.fetch(request);
  },
};
function method(allow: string) { return response({ error: 'Method not allowed.' }, 405, { Allow: allow }); }
