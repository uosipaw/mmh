import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare } from 'miniflare';
const script = readFileSync('.worker-test/index.js', 'utf8').replace(/\/\/# sourceMappingURL=.*/, '');
const password = 'test-only-owner-password-123';
test('order storage, session isolation, payment gating and private studio', async () => {
  const mf = new Miniflare({ modules: true, script, compatibilityDate: '2026-05-22', d1Databases: ['DB'], bindings: { STORE_READY:'false', PAYPAL_MODE:'sandbox', STUDIO_PASSWORD:password }, serviceBindings: { ASSETS: () => new Response('static') } });
  try {
    const db = await mf.getD1Database('DB');
    await db.exec('CREATE TABLE bead_orders(id TEXT PRIMARY KEY,session TEXT NOT NULL,created_at TEXT NOT NULL,status TEXT NOT NULL,details TEXT NOT NULL,total INTEGER NOT NULL,paypal_id TEXT UNIQUE,capture_id TEXT);');
    const send = (path, body, cookie = '', origin = 'https://shop.test') => mf.dispatchFetch('https://shop.test/beads/api/' + path, { method:'POST', headers: { 'Content-Type':'application/json', Origin:origin, Cookie:cookie }, body:JSON.stringify(body) });
    const config = await (await mf.dispatchFetch('https://shop.test/beads/api/config')).json();
    assert.equal(config.paypalReady, false); assert.equal(config.clientId, ''); assert.equal(config.ordersReady, true);
    const order = { requestId:crypto.randomUUID(),action:'request',product:'curtain',length:'24',palette:'honey',style:'varied',quantity:1,delivery:'pickup',notes:'<script>evil</script>',name:'Test Customer',email:'test@example.com',phone:'',address:'',city:'',state:'',zip:'',accepted:true,website:'',total:1 };
    assert.equal((await send('orders',order,'','https://other.test')).status,403);
    assert.equal((await send('orders',{...order,length:'999'})).status,400);
    const saved = await send('orders',order); assert.equal(saved.status,200);
    const cookie = saved.headers.get('set-cookie').split(';')[0];
    assert.match(saved.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);
    const data = await saved.json(); assert.equal(data.status,'awaiting_quote'); assert.equal(data.total,15500);
    const retry = await send('orders',{...order,quantity:3},cookie); assert.equal(retry.status,200); assert.equal((await retry.json()).total,15500);
    assert.equal((await send('orders',order)).status,409);
    assert.equal((await send('orders',{...order,requestId:crypto.randomUUID(),action:'pay'},cookie)).status,503);
    assert.equal((await send('capture',{id:order.requestId},cookie)).status,503);
    const count = await db.prepare('SELECT COUNT(*) AS n FROM bead_orders').first(); assert.equal(count.n,1);
    const hidden = await mf.dispatchFetch('https://shop.test/beads/studio'); assert.equal(hidden.status,401); assert.doesNotMatch(await hidden.text(),/test@example/);
    const visible = await mf.dispatchFetch('https://shop.test/beads/studio',{headers:{Authorization:'Basic '+btoa('admin:'+password)}}); assert.equal(visible.status,200); const html=await visible.text(); assert.match(html,/test@example/); assert.match(html,/&lt;script&gt;/); assert.doesNotMatch(html,/<script>evil/);
    assert.equal((await mf.dispatchFetch('https://shop.test/beads/api/orders')).status,405);
    assert.equal((await mf.dispatchFetch('https://shop.test/beads/api/unknown')).status,404);
    const large = await mf.dispatchFetch('https://shop.test/images/mwah.gif',{redirect:'manual'}); assert.equal(large.status,302); assert.match(large.headers.get('location'),/raw.githubusercontent.com/);
    assert.equal(await (await mf.dispatchFetch('https://shop.test/tarot')).text(),'static');
  } finally { await mf.dispose(); }
});
test('unconfigured shop exposes no owner studio or live payments', async () => {
  const mf = new Miniflare({ modules:true,script,compatibilityDate:'2026-05-22',serviceBindings:{ASSETS:()=>new Response('static')} });
  try {
    const config=await (await mf.dispatchFetch('https://shop.test/beads/api/config')).json(); assert.equal(config.ordersReady,false); assert.equal(config.paypalReady,false);
    assert.equal((await mf.dispatchFetch('https://shop.test/beads/studio')).status,503);
  } finally { await mf.dispose(); }
});
