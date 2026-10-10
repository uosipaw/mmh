import { env } from 'cloudflare:workers';
import { response } from './shop';
import { money } from '../beads/src/catalog';
const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export async function studio(request: Request) {
  const e = env as unknown as Record<string, any>;
  if (!e.STUDIO_PASSWORD || e.STUDIO_PASSWORD.length < 16) return response({ error: 'The owner order studio has not been configured.' }, 503);
  let actual = '';
  try { const header = request.headers.get('authorization') || ''; if (header.startsWith('Basic ')) actual = atob(header.slice(6)); } catch {}
  const hash = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const a = await hash(actual), b = await hash('admin:' + e.STUDIO_PASSWORD);
  let mismatch = 0; for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  if (mismatch) return new Response('Sign in to your order studio.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="MDSN Arts orders", charset="UTF-8"', 'Cache-Control': 'no-store' } });
  if (!e.DB) return response({ error: 'The order database has not been connected.' }, 503);
  try {
    const { results } = await e.DB.prepare('SELECT * FROM bead_orders ORDER BY created_at DESC LIMIT 1000').all();
    if (new URL(request.url).pathname.endsWith('/export')) {
      const cell = (v: unknown) => '"' + String(v ?? '').replace(/^[=+@-]/, '\t$&').replaceAll('"', '""') + '"';
      const rows = [['Reference','Created','Status','Name','Email','Phone','Product','Length','Quantity','Palette','Delivery','Address','City','State','ZIP','Notes','Total USD'], ...results.map((o: any) => { const d = JSON.parse(o.details); return [o.id,o.created_at,o.status,d.name,d.email,d.phone,d.productName,d.length,d.quantity,d.paletteName,d.delivery,d.address,d.city,d.state,d.zip,d.notes,(o.total/100).toFixed(2)]; })];
      return new Response('\ufeff' + rows.map(r => r.map(cell).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv;charset=utf-8', 'Content-Disposition': 'attachment; filename="MDSN-bead-orders.csv"', 'Cache-Control': 'no-store' } });
    }
    const cards = results.map((o: any) => { const d = JSON.parse(o.details); return `<article><small>${escape(o.status.replaceAll('_',' '))} · ${escape(o.created_at)}</small><h2>${escape(d.productName)} — ${escape(d.paletteName)}</h2><p>${escape(d.quantity)} × ${escape(d.length)} inches · ${escape(d.style)} · ${escape(d.delivery)} · ${escape(money(o.total))} ${o.status === 'paid' ? 'paid' : 'estimated'}</p><p>${escape(d.name)} · ${escape(d.email)} · ${escape(d.phone)}</p><p>${escape(d.address)} ${escape(d.city)} ${escape(d.state)} ${escape(d.zip)}</p><p>${escape(d.notes)}</p><small>Reference: ${escape(o.id)}</small></article>`; }).join('');
    return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MDSN Arts order studio</title><style>body{font:16px/1.6 system-ui;background:#faf7ef;color:#493342;max-width:900px;margin:40px auto;padding:0 20px}article{background:#fffdf8;padding:24px;border:1px solid #e5ded7;border-radius:8px;margin:20px 0}h1,h2{line-height:1.2}a{color:inherit}p{overflow-wrap:anywhere}small{color:#776b70}</style><a href="/beads/">← Bead orders</a><h1>Your order studio.</h1><p>Requests are unpaid until PayPal confirms payment. Contact customers to confirm custom details and timing. Showing up to 1,000 recent orders.</p><a href="/beads/studio/export">Download orders as CSV</a>${cards || '<p>No orders yet.</p>'}</html>`, { headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'" } });
  } catch { return response({ error: 'Could not load orders. Please check the database setup.' }, 503); }
}
