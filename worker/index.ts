import { env } from 'cloudflare:workers';
import { GET as config } from './config';
import { POST as orders } from './orders';
import { POST as capture } from './capture';
import { studio } from './studio';
import { response } from './shop';
const largeAssets: Record<string, string> = {
  '/images/mwah.gif': 'images/mwah.gif',
  '/images/Your paragraph text.zip': 'images/Your paragraph text.zip',
};
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    let path: string;
    try { path = decodeURIComponent(url.pathname); } catch { return response({ error: 'Invalid URL.' }, 400); }
    if (path === '/beads/api/config') return request.method === 'GET' ? config() : method('GET');
    if (path === '/beads/api/orders') return request.method === 'POST' ? orders(request) : method('POST');
    if (path === '/beads/api/capture') return request.method === 'POST' ? capture(request) : method('POST');
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
