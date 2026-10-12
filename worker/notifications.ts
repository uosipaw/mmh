import { env } from 'cloudflare:workers';

// Separate from checkout: provider failures never change an order or payment.
export async function notifyOwners() {
  const e = env as any;
  const channels = [
    ...(e.RESEND_API_KEY && e.ORDER_EMAIL_FROM && e.ORDER_NOTIFY_EMAIL ? ['email'] : []),
    ...(e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_FROM_NUMBER && e.ORDER_NOTIFY_PHONE ? ['sms'] : []),
  ];
  if (!e.DB || !channels.length || !e.NOTIFICATIONS_START_AT) return;
  try {
    await e.DB.prepare(`CREATE TABLE IF NOT EXISTS bead_notifications (
      order_id TEXT NOT NULL, event TEXT NOT NULL, channel TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT 0, provider_id TEXT,
      PRIMARY KEY(order_id,event,channel))`).run();
    for (const channel of channels) {
      await e.DB.prepare(`INSERT OR IGNORE INTO bead_notifications(order_id,event,channel)
        SELECT id,status,? FROM bead_orders WHERE created_at >= ?
        AND status IN ('awaiting_quote','paid')`).bind(channel,e.NOTIFICATIONS_START_AT).run();
    }
    const { results } = await e.DB.prepare(`SELECT n.*,o.details,o.total FROM bead_notifications n
      JOIN bead_orders o ON o.id=n.order_id WHERE n.state='pending' AND n.attempts<5
      AND n.updated_at < ? ORDER BY o.created_at LIMIT 20`).bind(Date.now()-300000).all();
    for (const item of results) {
      if (!channels.includes(item.channel)) continue;
      const claimed = await e.DB.prepare(`UPDATE bead_notifications SET state='sending',attempts=attempts+1,updated_at=?
        WHERE order_id=? AND event=? AND channel=? AND state='pending'`).bind(Date.now(),item.order_id,item.event,item.channel).run();
      if (!claimed.meta.changes) continue;
      try {
        const d = JSON.parse(item.details);
        const heading = item.event==='paid' ? 'Payment confirmed' : 'New order request - NOT PAID';
        const money = (v: number) => '$'+(Number(v||0)/100).toFixed(2);
        const text = [heading, 'Order: '+item.order_id, 'Customer: '+d.name,
          'Email: '+d.email,'Phone: '+(d.phone||'Not provided'),
          'Piece: '+d.productName,'Palette: '+d.paletteName,'Length: '+d.length+' inches',
          'Quantity: '+d.quantity,'Arrangement: '+d.style,
          'Extras: '+(Object.entries(d.extras||{}).filter(([,v])=>v).map(([k])=>k).join(', ')||'None'),
          'Delivery: '+d.delivery,
          ...(d.delivery==='shipping' ? ['Address: '+d.address, d.city+', '+d.state+' '+d.zip] : []),
          'Subtotal: '+money(d.subtotal),'Shipping: '+money(d.shipping),'Tax: '+money(d.tax),
          (item.event==='paid' ? 'Paid: ' : 'Estimated total (quote required): ')+money(item.total),
          'Notes: '+(d.notes||'None'),
          'Order Studio: https://beads.mherder1.workers.dev/beads/studio'].join('\n');
        let result: Response;
        if (item.channel==='email') {
          result = await fetch('https://api.resend.com/emails', {
            method:'POST', signal:AbortSignal.timeout(15000), headers:{
              Authorization:'Bearer '+e.RESEND_API_KEY,'Content-Type':'application/json',
              'Idempotency-Key':item.order_id+'/'+item.event+'/email'},
            body:JSON.stringify({from:e.ORDER_EMAIL_FROM,to:[e.ORDER_NOTIFY_EMAIL],
              subject:'MDSN Beads: '+heading+' / '+item.order_id.slice(0,8),text,reply_to:d.email}),
          });
        } else {
          result = await fetch('https://api.twilio.com/2010-04-01/Accounts/'+encodeURIComponent(e.TWILIO_ACCOUNT_SID)+'/Messages.json', {
            method:'POST', signal:AbortSignal.timeout(15000),headers:{
              Authorization:'Basic '+btoa(e.TWILIO_ACCOUNT_SID+':'+e.TWILIO_AUTH_TOKEN),
              'Content-Type':'application/x-www-form-urlencoded'},
            body:new URLSearchParams({To:e.ORDER_NOTIFY_PHONE,From:e.TWILIO_FROM_NUMBER,
              Body:'MDSN Beads: '+heading+'. '+String(d.productName).slice(0,60)+', '+String(d.paletteName).slice(0,40)+', qty '+d.quantity+'. '+(item.event==='paid'?'Paid ':'Estimate ')+money(item.total)+'. Ref '+item.order_id.slice(0,8)+'. Full details in your email / Order Studio.'}),
          });
        }
        // Retry explicit throttling. Ambiguous delivery is held for manual review
        // rather than risking duplicate SMS or repeated provider charges.
        const state = result.ok ? 'sent' : result.status===429 ? 'pending' : 'failed';
        const body = await result.json().catch(()=>({}));
        await e.DB.prepare(`UPDATE bead_notifications SET state=?,provider_id=?,updated_at=?
          WHERE order_id=? AND event=? AND channel=?`).bind(state,body.id||body.sid||null,Date.now(),item.order_id,item.event,item.channel).run();
        if (!result.ok) console.error('Owner notification rejected',item.channel,result.status);
      } catch {
        await e.DB.prepare(`UPDATE bead_notifications SET state='unknown' WHERE order_id=? AND event=? AND channel=?`)
          .bind(item.order_id,item.event,item.channel).run();
        console.error('Owner notification requires delivery review',item.channel);
      }
    }
  } catch { console.error('Owner notification processing unavailable'); }
}
