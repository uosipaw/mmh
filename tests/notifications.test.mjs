import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Miniflare } from 'miniflare';
const script = readFileSync('.worker-test/index.js','utf8').replace(/\/\/# sourceMappingURL=.*/,'');
for (const failSms of [false,true]) test('owner alerts preserve checkout and prevent duplicates (SMS failure: '+failSms+')', async () => {
  const messages=[];
  const mf=new Miniflare({modules:true,script,compatibilityDate:'2026-05-22',d1Databases:['DB'],
    bindings:{NOTIFICATIONS_START_AT:'2026-01-01T00:00:00Z',RESEND_API_KEY:'test',ORDER_EMAIL_FROM:'shop@example.com',ORDER_NOTIFY_EMAIL:'owner@example.com',TWILIO_ACCOUNT_SID:'ACtest',TWILIO_AUTH_TOKEN:'test',TWILIO_FROM_NUMBER:'+15555550101',ORDER_NOTIFY_PHONE:'+15555550102'},
    outboundService:async request=>{messages.push({url:request.url,body:await request.text()});return Response.json({id:'email-test',sid:'sms-test'},{status:failSms && request.url.includes('twilio')?500:200});},
    serviceBindings:{ASSETS:()=>new Response('static')}});
  try {
    const db=await mf.getD1Database('DB');
    await db.exec('CREATE TABLE bead_orders(id TEXT PRIMARY KEY,session TEXT,created_at TEXT,status TEXT,details TEXT,total INTEGER,paypal_id TEXT,capture_id TEXT);');
    const order={requestId:crypto.randomUUID(),action:'request',product:'curtain',length:'24',palette:'aries',style:'varied',quantity:1,delivery:'shipping',notes:'Special request',name:'Test Customer',email:'customer@example.com',phone:'555-0100',address:'123 Test Lane',city:'Tampa',state:'FL',zip:'33601',accepted:true,website:''};
    const send=cookie=>mf.dispatchFetch('https://shop.test/beads/api/orders',{method:'POST',headers:{Origin:'https://shop.test',Cookie:cookie||''},body:JSON.stringify(order)});
    const first=await send();assert.equal(first.status,200);const cookie=first.headers.get('set-cookie').split(';')[0];
    for(let i=0;i<100 && messages.length<2;i++) await new Promise(r=>setTimeout(r,20));
    assert.equal(messages.length,2);
    const email=JSON.parse(messages.find(m=>m.url.includes('resend')).body);
    assert.deepEqual(email.to,['owner@example.com']);assert.match(email.text,/NOT PAID/);assert.match(email.text,/123 Test Lane/);assert.match(email.text,/Special request/);assert.equal(email.reply_to,'customer@example.com');
    const sms=new URLSearchParams(messages.find(m=>m.url.includes('twilio')).body);
    assert.equal(sms.get('To'),'+15555550102');assert.match(sms.get('Body'),/NOT PAID/);assert.doesNotMatch(sms.get('Body'),/123 Test Lane/);
    await send(cookie);await new Promise(r=>setTimeout(r,100));assert.equal(messages.length,2);
    await db.prepare("UPDATE bead_orders SET status='paid',paypal_id='test' WHERE id=?").bind(order.requestId).run();
    await send(cookie);
    for(let i=0;i<100 && messages.length<4;i++) await new Promise(r=>setTimeout(r,20));
    assert.equal(messages.length,4);assert.match(JSON.parse(messages[2].body).text,/Payment confirmed/);
    await send(cookie);await new Promise(r=>setTimeout(r,100));assert.equal(messages.length,4);
    const states=await db.prepare("SELECT state FROM bead_notifications WHERE channel='sms'").all();
    assert.ok(states.results.every(r=>r.state===(failSms?'failed':'sent')));
  } finally {await mf.dispose();}
});
