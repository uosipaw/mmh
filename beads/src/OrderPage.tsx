import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, Check, Sparkles, Sun, KeyRound, Smartphone, ChevronDown, ShieldCheck, X, Download, LoaderCircle, Menu, CircleHelp } from "lucide-react";
import { products, palettes, money, priceFor, totals, type ProductId } from "./catalog";

type Config = { ordersReady: boolean; paypalReady: boolean; pricingReady: boolean; clientId: string; mode: string; shipping: number; taxBps: number; terms: string };
type Receipt = { id: string; status: string; total: number; details: any };
const icons: Record<string, typeof Sparkles> = { curtain: Sparkles, strand: Sparkles, garland: Sparkles, suncatcher: Sun, keychain: KeyRound, wristlet: KeyRound, phone: Smartphone, hair: Sparkles };
declare global { interface Window { paypal?: any } }
export default function OrderPage() {
  const [product, setProduct] = useState<ProductId>("curtain");
  const [length, setLength] = useState("24");
  const [palette, setPalette] = useState("honey");
  const [style, setStyle] = useState("varied");
  const [quantity, setQuantity] = useState(1);
  const [extras, setExtras] = useState({ribbons:false,threads:false,charms:false});
  const [delivery, setDelivery] = useState("pickup");
  const [notes, setNotes] = useState("");
  const [config, setConfig] = useState<Config | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [help, setHelp] = useState(false);
  const [menu, setMenu] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const requestId = useRef("");
  const paymentId = useRef("");
  const frozen = useRef<any>(null);
  const payRef = useRef<HTMLDivElement>(null);
  useEffect(() => { requestId.current = crypto.randomUUID(); fetch("/beads/api/config").then(async r => { if (!r.ok) throw new Error(); return await r.json() as Config; }).then(setConfig).catch(() => setError("The order service is unavailable. Please refresh to try again.")); }, []);
  const selected = products.find(p => p.id === product)!;
  const selectedPalette = palettes.find(p => p.id === palette)!;
  const breakdown = totals(priceFor(product, length, extras) || 0, quantity, delivery, config?.shipping ?? 900, config?.taxBps ?? 0, product);
  const choices = Object.keys(selected.prices);
  function choose(id: ProductId) {
    setProduct(id); const p = products.find(p => p.id === id)!;
    setLength(id === "curtain" ? "24" : Object.keys(p.prices)[0]); setExtras({ribbons:false,threads:false,charms:false});
    requestId.current = crypto.randomUUID();
  }
  function payload(action: "pay" | "request") {
    if (!form.current!.reportValidity()) return null;
    if (palette === "custom" && notes.trim().length < 3) { setError("Tell me which colors you’d like in the custom notes."); document.getElementById("notes")?.focus(); return null; }
    const fields = Object.fromEntries(new FormData(form.current!).entries());
    return { ...fields, product, length, palette, style, quantity, delivery, notes, extras: product === "curtain" ? extras : {ribbons:false,threads:false,charms:false}, accepted: fields.accepted === "on", state: String(fields.state || "").toUpperCase(), requestId: requestId.current, action };
  }
  async function call(path: string, body: any) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as any; if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again."); return result;
  }
  async function requestOrder(event: React.FormEvent) {
    event.preventDefault(); setError(""); const data = payload("request"); if (!data) return;
    setBusy(true);
    try { const saved = await call("/beads/api/orders", data); setReceipt(saved); requestId.current = crypto.randomUUID(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  function startPay() {
    setError(""); const data = payload("pay"); if (!data) return;
    // Freeze the form and the server-side order snapshot during checkout.
    frozen.current = data; setCheckoutOpen(true);
  }
  useEffect(() => {
    if (!checkoutOpen || !config?.paypalReady || !payRef.current) return;
    let cancelled = false; let buttons: any;
    async function load() {
      try {
        if (!window.paypal) await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(config!.clientId) + "&currency=USD&intent=capture&components=buttons&disable-funding=paylater,venmo";
          script.onload = () => resolve(); script.onerror = () => reject(new Error("PayPal did not load. Please check your connection or send an order request."));
          document.body.appendChild(script);
        });
        if (cancelled || !payRef.current) return;
        buttons = window.paypal.Buttons({
          style: { color: "gold", shape: "rect", layout: "vertical", label: "pay" },
          createOrder: async () => { const order = await call("/beads/api/orders", frozen.current); paymentId.current = order.id; return order.paypalId; },
          onApprove: async () => { setBusy(true); try { const paid = await call("/beads/api/capture", { id: paymentId.current }); setReceipt(paid); setCheckoutOpen(false); requestId.current = crypto.randomUUID(); } finally { setBusy(false); } },
          onCancel: () => setError("Payment cancelled. Nothing was confirmed; you can reopen checkout or send an order request."),
          onError: (err: Error) => setError(err.message || "PayPal couldn’t complete checkout. Please contact the shop if you approved a payment."),
        });
        await buttons.render(payRef.current);
      } catch (e) { setError((e as Error).message); }
    }
    void load(); return () => { cancelled = true; if (buttons) void buttons.close(); };
  }, [checkoutOpen, config]);
  function download() {
    if (!receipt) return;
    const d = receipt.details;
    const text = ["MDSN Arts — " + (receipt.status === "paid" ? "Paid order" : "Order request"), "Reference: " + receipt.id, "Status: " + receipt.status, "Name: " + d.name, "Email: " + d.email, "Product: " + d.productName, 'Length: ' + d.length + ' inches', "Quantity: " + d.quantity, "Extras: " + JSON.stringify(d.extras || {}), "Palette: " + d.paletteName, "Strand style: " + d.style, "Delivery: " + d.delivery, "Notes: " + d.notes, (receipt.status === "paid" ? "Paid total: " : "Estimated total: ") + money(receipt.total), ...(receipt.status !== "paid" ? ["No payment collected. Final price, shipping, tax and timing require confirmation."] : [])].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" })); const a = document.createElement("a"); a.href = url; a.download = "MDSN-order-" + receipt.id.slice(0,8) + ".txt"; a.click(); URL.revokeObjectURL(url);
  }
  return <>
    <div className="topline">VERY NICE, VERY COOL <span>✦</span> NEVER BORING</div>
    <header className="header"><a className="brand" href="/">mdsn <span>beads</span><i>✳</i></a><nav aria-label="Main navigation" className={menu ? "nav open" : "nav"}><a href="#order" onClick={() => setMenu(false)}>Build your beads <ArrowUpRight size={14}/></a><button onClick={() => {setHelp(true); setMenu(false);}}>How it works</button></nav><button className="menubtn" aria-label="Toggle menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu/></button></header>
    <main>
      <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="little-star">✦</span> MADE BY HAND. MADE FOR YOU.</span><h1>1 of 1,<br/><em>just like you.</em></h1><p>Pieces as unique as you are.</p><a href="#order" className="hero-link">Let’s make something yours <ArrowRight size={19}/></a></div><div className="hero-image" role="img" aria-label="Artistic inspiration of amber, rose and olive bead strands catching window light"><div className="image-caption">a little color. a lot of character.</div><span className="floating-star">✧</span></div><div className="hero-foot"><span><Check size={14}/> Handmade to order</span><span><Check size={14}/> Choose your own colors</span><span><Check size={14}/> One of a kind, every time</span></div></section>
      <section id="order" className="order-intro"><div><span className="eyebrow">YOUR LIGHT, YOUR SPACE</span><h2>Strung together.</h2></div><p>Pick a piece, find your colors,<br/>catch a vibe.</p></section>
      {!config?.pricingReady && <div className="preview-note"><CircleHelp size={17}/><span><strong>Design preview</strong> · Prices are draft estimates. {config?.ordersReady ? "Order requests can be saved; payment is not active yet." : "Ordering and payment are not open yet."}</span></div>}
      <form ref={form} onSubmit={requestOrder} className="order-layout">
        <fieldset className="form-panels" disabled={checkoutOpen || busy}>
          <section className="panel"><div className="section-heading"><span className="step">01</span><div><h3>Pick your piece</h3><p>Small joy or a whole doorway of it.</p></div></div><div className="product-grid">{products.map(p => { const Icon = icons[p.id] || Sparkles; return <button key={p.id} type="button" className={product === p.id ? "product selected" : "product"} onClick={() => choose(p.id)} aria-pressed={product === p.id}><span className="product-icon"><Icon size={24} strokeWidth={1.35}/></span><span className="product-name">{p.name}</span><span className="product-description">{p.short}</span>{product === p.id && <span className="selected-check"><Check size={12}/></span>}</button>; })}</div><p className="product-detail">{selected.detail}</p>{product === "curtain" && <p className="field-hint">Longer-length savings: 30% off each inch beyond 24 inches, on all 15 strands.</p>}<div className="two-fields"><label>Length<div className="select-wrap"><select value={length} onChange={e => setLength(e.target.value)}>{choices.map(n => <option key={n} value={n}>{n} inches{product === "curtain" && Number(n)>24 ? " · longer-length savings" : ""}</option>)}</select><ChevronDown size={15}/></div></label><label>Quantity<div className="quantity"><button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity(quantity-1)}>−</button><span aria-live="polite">{quantity}</span><button type="button" aria-label="Increase quantity" disabled={quantity === 10} onClick={() => setQuantity(quantity+1)}>+</button></div></label></div>{product === "curtain" && <div className="curtain-extras"><p className="field-label">Optional curtain extras</p>{([["ribbons","Add 5 ribbons (+$5)"],["threads","Add 5 decorative threads (+$5)"],["charms","Add charms (+$10)"]] as const).map(([key,label])=><label key={key} style={{display:"block",margin:"10px 0"}}><input type="checkbox" checked={extras[key]} onChange={e=>setExtras(v=>({...v,[key]:e.target.checked}))}/> {label}</label>)}</div>}</section>
          <section className="panel"><div className="section-heading"><span className="step">02</span><div><h3>Find your colors</h3><p>A starting point, never a rule.</p></div></div><div className="palette-grid">{palettes.map(p => <button type="button" key={p.id} onClick={() => setPalette(p.id)} aria-pressed={palette === p.id} className={palette === p.id ? "palette selected" : "palette"}><span className="swatches">{p.colors.map((c,i) => <i key={i} style={{background:c}}/>)}</span><span>{p.name}</span>{palette === p.id && <Check size={14}/>}</button>)}</div><p className="palette-detail">{selectedPalette.description}</p>{product === "curtain" && <><label className="field-label">Strand arrangement</label><div className="style-options"><button type="button" aria-pressed={style === "varied"} onClick={() => setStyle("varied")} className={style === "varied" ? "style-option active" : "style-option"}><span className="strand-illustration varied">{[45,32,50,38,46,30].map((n,i) => <i key={i} style={{height:n}}/>)}</span><span><strong>Playfully varied</strong><small>Mixed lengths, organic feel</small></span></button><button type="button" aria-pressed={style === "even"} onClick={() => setStyle("even")} className={style === "even" ? "style-option active" : "style-option"}><span className="strand-illustration">{[40,40,40,40,40,40].map((n,i) => <i key={i} style={{height:n}}/>)}</span><span><strong>Even & easy</strong><small>All strands the same length</small></span></button></div></>}<label className="notes-label" htmlFor="notes">Make it yours <span>{palette === "custom" ? "required for custom colors" : "optional"}</span></label><textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} maxLength={1500} placeholder="Favorite colors? A certain vibe? Bead shapes you love? Tell me everything." rows={3}/><p className="field-hint">Every piece uses an eclectic assortment of beads. Special requests are confirmed before making.</p></section>
          <section className="panel"><div className="section-heading"><span className="step">03</span><div><h3>Where’s the happy going?</h3><p>Your details, so we can make it happen.</p></div></div><div className="two-fields"><label htmlFor="name">Your name<input name="name" id="name" autoComplete="name" placeholder="First & last name" required minLength={2} maxLength={100}/></label><label htmlFor="email">Email address<input type="email" name="email" id="email" autoComplete="email" placeholder="you@example.com" required maxLength={200}/></label></div><label htmlFor="phone" className="phone-label">Phone <span>optional</span><input type="tel" id="phone" name="phone" autoComplete="tel" placeholder="For order questions only" maxLength={30}/></label><label className="field-label">Delivery</label><div className="delivery-options"><button type="button" aria-pressed={delivery === "pickup"} className={delivery === "pickup" ? "delivery active" : "delivery"} onClick={() => setDelivery("pickup")}><strong>Local pickup</strong><span>Tampa Bay · by arrangement</span><small>No delivery charge</small></button><button type="button" aria-pressed={delivery === "shipping"} className={delivery === "shipping" ? "delivery active" : "delivery"} onClick={() => setDelivery("shipping")}><strong>Ship to me</strong><span>United States</span><small>{breakdown.shipping === 0 ? "Free on $250+ orders" : money(breakdown.shipping)}</small></button></div>{delivery === "shipping" ? <div className="address-fields"><label htmlFor="address">Street address<input id="address" name="address" autoComplete="street-address" placeholder="Street, apartment or unit" required maxLength={200}/></label><div className="address-row"><label htmlFor="city">City<input id="city" name="city" autoComplete="address-level2" required maxLength={100}/></label><label htmlFor="state">State<input id="state" name="state" autoComplete="address-level1" required pattern="[a-zA-Z]{2}" placeholder="FL" maxLength={2}/></label><label htmlFor="zip">ZIP code<input id="zip" name="zip" autoComplete="postal-code" required pattern="[0-9]{5}(-[0-9]{4})?" maxLength={10}/></label></div><input type="hidden" name="country" value="US"/></div> : <><input type="hidden" name="address" value=""/><input type="hidden" name="city" value=""/><input type="hidden" name="state" value=""/><input type="hidden" name="zip" value=""/></>}<div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="terms"><input type="checkbox" name="accepted" required/><span>{config?.terms || "Made to order. Your request is reviewed before production. Timing and special requests will be confirmed with you."}</span></label><p className="field-hint">Your details are used to fulfill and discuss your order. They are not added to a marketing list.</p></section>
        </fieldset>
        <aside className="summary"><div className="summary-top"><span className="eyebrow">A LITTLE SOMETHING FOR YOU</span><h3>Your happy mail.</h3><span className="summary-star">✳</span></div><div className="summary-piece"><span className="summary-orb" style={{background: selectedPalette.colors[0]}}>✧</span><div><strong>{selected.name}</strong><span>{product === "curtain" ? "15 strands" : product === "garland" || product === "suncatcher" || product === "keychain" ? "3 strands" : "1 piece"} · {length}″ · Qty {quantity}</span><span>{selectedPalette.name}</span>{product === "curtain" && (extras.ribbons || extras.threads || extras.charms) && <span>{[extras.ribbons && "5 ribbons", extras.threads && "5 threads", extras.charms && "charms"].filter(Boolean).join(" · ")}</span>}{product === "curtain" && <span>{style === "varied" ? "Varied strand lengths" : "Even strand lengths"}</span>}</div></div><div className="summary-lines"><div><span>{config?.pricingReady ? "Subtotal" : "Estimated subtotal"}</span><span>{money(breakdown.subtotal)}</span></div><div><span>{delivery === "pickup" ? "Local pickup" : "Shipping"}</span><span>{delivery === "pickup" ? "Free" : breakdown.shipping === 0 ? "Free" : money(breakdown.shipping)}</span></div><div><span>Tax</span><span>{config?.pricingReady ? money(breakdown.tax) : "To be confirmed"}</span></div></div><div className="total"><span>{config?.pricingReady ? "Total" : "Estimated item total"}</span><strong aria-live="polite">{money(config?.pricingReady ? breakdown.total : breakdown.subtotal)}</strong></div><p className="field-hint">Free U.S. shipping on orders of $250 or more before tax. Local pickup is always free.</p><p className="total-note">{config?.pricingReady ? "USD · Your price is confirmed before payment." : "Draft pricing. Shipping and applicable tax are confirmed after review."}</p><button type="button" className="paypal-button" disabled={!config?.paypalReady || busy || checkoutOpen} onClick={startPay}>Pay with <b><i>Pay<span>Pal</span></i></b><ArrowUpRight size={17}/></button><p className="payment-note">{config?.paypalReady ? config.mode === "sandbox" ? "Test checkout · no real payments" : "Secure checkout with PayPal" : "PayPal checkout is awaiting connection"}</p><span className="or">or</span><button type="submit" className="request-button" disabled={!config?.ordersReady || busy || checkoutOpen}>{busy ? <LoaderCircle className="spin" size={17}/> : null}Send order request <ArrowRight size={16}/></button><p className="request-note">{config?.ordersReady ? "No payment required. Your preferences are saved for review before making." : "Order requests will open once the shop is connected."}</p><div className="trust"><ShieldCheck size={17}/><span>Thoughtfully made.<br/>Securely paid.</span></div>{error && !checkoutOpen && <p className="error" role="alert">{error}</p>}</aside>
      </form>
      <section className="closing"><span>✦</span><p>A little imperfect.<br/><em>A little like you.</em></p><small>No two pieces are exactly alike.<br/>That’s the lovely part.</small></section>
    </main>
    <footer><a className="brand" href="/">mdsn <span>arts</span></a><p>Handmade in Tampa Bay, Florida.</p><a href="/beads/studio">Order studio <ArrowUpRight size={13}/></a></footer>
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()}><button className="close" aria-label="Close" onClick={() => setHelp(false)} autoFocus><X/></button><span className="eyebrow">FROM AN IDEA TO YOUR DOOR</span><h2 id="help-title">A little made-to-order magic.</h2><ol><li><strong>Choose your piece.</strong><p>Pick your product, length, palette and quantity. Curtain sets include 15 strands; the selected length is the longest strand for varied sets.</p></li><li><strong>Tell me the details.</strong><p>Add your custom ideas and select local pickup or US shipping.</p></li><li><strong>Request or pay.</strong><p>Send a request for review, or use PayPal once checkout is active. Production timing and special requests are confirmed with you.</p></li></ol><p className="field-hint">The banner artwork is color and style inspiration. Each handmade piece has its own bead assortment.</p><button className="request-button" onClick={() => {setHelp(false); document.getElementById("order")?.scrollIntoView({behavior:"smooth"});}}>Let’s make mine <ArrowRight size={16}/></button></section></div>}
    {checkoutOpen && <div className="modal-backdrop"><section className="modal checkout-modal" role="dialog" aria-modal="true" aria-labelledby="pay-title"><button className="close" aria-label="Close checkout" disabled={busy} onClick={() => {setCheckoutOpen(false); requestId.current = crypto.randomUUID();}} autoFocus><X/></button><span className="eyebrow">{config?.mode === "sandbox" ? "SANDBOX · TEST PAYMENT" : "SECURE CHECKOUT"}</span><h2 id="pay-title">A little joy is on its way.</h2><p>{selected.name} · {selectedPalette.name} · {quantity} × {length}″</p><strong className="checkout-total">{money(breakdown.total)}</strong><div ref={payRef} className="paypal-mount"/><p className="field-hint">Your selections are held while you pay. You’ll see a confirmation here when the payment is verified.</p>{error && <p role="alert" className="error">{error}</p>}</section></div>}
    {receipt && <div className="modal-backdrop"><section className="modal receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title"><button className="close" aria-label="Close confirmation" onClick={() => setReceipt(null)} autoFocus><X/></button><span className="receipt-icon"><Check size={27}/></span><span className="eyebrow">{receipt.status === "paid" ? "PAYMENT VERIFIED" : "REQUEST SAVED"}</span><h2 id="receipt-title">{receipt.status === "paid" ? "Your beads are booked." : "Your idea is in."}</h2><p>{receipt.status === "paid" ? "Your order and PayPal payment have been confirmed. Keep this reference for your records." : "Your order request is saved for review. No payment was collected. Final pricing and timing still need confirmation."}</p><div className="receipt-details"><span>{receipt.details.productName} · {receipt.details.paletteName}</span><span>{receipt.details.quantity} × {receipt.details.length}″</span><strong>{receipt.status === "paid" ? "Paid " : "Estimated "}{money(receipt.status === "paid" ? receipt.total : receipt.details.subtotal)}</strong><small>Reference: {receipt.id}</small></div><button className="request-button" onClick={download}><Download size={16}/> Save confirmation</button><p className="field-hint">Keep a copy of your request. An email confirmation is not sent automatically.</p></section></div>}
  </>;
}
