export function cleanReading(r: any) {
  const str=(v:any,n:number)=>typeof v==='string' && v.length<=n;
  if(!r || !str(r.spread,120)||!str(r.deck,80)||!str(r.date,50)||!Number.isFinite(Date.parse(r.date))||!Array.isArray(r.cards)||!r.cards.length||r.cards.length>10||!Array.isArray(r.positions)||r.positions.length!==r.cards.length||!r.positions.every((x:any)=>str(x,180))) throw Error('Invalid reading');
  const cards=r.cards.map((c:any)=>{
    if(!c || typeof c.reversed!=='boolean'||typeof c.id!=='string'||!(/^(major-(?:[0-9]|1[0-9]|2[01])|(?:wands|cups|swords|pentacles)-(?:[1-9]|1[0-4]))$/).test(c.id))throw Error('Invalid card');
    return {id:c.id,reversed:c.reversed};
  });
  return {spread:r.spread,deck:r.deck,date:r.date,positions:r.positions,cards};
}
export function canUseShare(share:any,uid:string,ai=false){return !!share && (share.owner_id===uid || ((share.recipient_id===null||share.recipient_id===uid)&&(!ai||share.allow_ai===true)));}
export function paidSession(s:any,order:any){return s.id===order.stripe_session && s.mode==='payment' && s.status==='complete' && s.payment_status==='paid' && s.client_reference_id===order.id && s.metadata?.owner_id===order.owner_id && s.amount_total===order.amount && s.currency===order.currency && s.payment_intent?.status==='succeeded' && !!s.payment_intent.latest_charge && !s.payment_intent.latest_charge.refunded && !s.payment_intent.latest_charge.disputed && s.payment_intent.latest_charge.amount_refunded===0;}
export function responseText(response:any){return (response.output||[]).flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('\n');}
