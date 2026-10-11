export const products = [
  { id: "portiere", name: "Portières", short: "Long strands for dramatic spaces.", detail: "Made to order • 50–72 inches • pricing confirmed before payment", icon: "curtain", prices: Object.fromEntries(Array.from({length:23},(_,i)=>[String(i+50),0])) },
  { id: "curtain", name: "Curtains", short: "A whole doorway of light.", detail: "15 handmade strands • 19–48 inches • first 24 inches at $0.50/inch, additional inches at $0.35/inch", icon: "curtain", prices: Object.fromEntries(Array.from({length:30},(_,i)=>{const n=i+19;return [String(n),15*(Math.min(n,24)*50+Math.max(0,n-24)*35)];})) },
  { id: "valance", name: "Valances", short: "A little light up top.", detail: "12–18 inches • made to order • pricing confirmed before payment", icon: "curtain", prices: Object.fromEntries(Array.from({length:7},(_,i)=>[String(i+12),0])) },
  { id: "suncatcher", name: "Sun Catchers", short: "Five strands to catch the light.", detail: "5 beaded strands • approximately 8 inches per hanging • pricing confirmed before payment", icon: "sun", prices: { "8": 0 } },
  { id: "strand", name: "Strands by the Inch", short: "Just one, or a whole bunch.", detail: "One handmade strand • $0.50 per inch", icon: "strand", prices: Object.fromEntries(Array.from({length:77},(_,i)=>{const n=i+8;return [String(n),n*50];})) },
  { id: "garland", name: "Garland + Table Runners", short: "Three strands, one lovely garland.", detail: "3 strands joined at both ends • 48–60 inches • $0.50 per inch per strand", icon: "garland", prices: Object.fromEntries(Array.from({length:13},(_,i)=>{const n=i+48;return [String(n),n*150];})) },
  { id: "plant", name: "Plant Charms", short: "A little something for your plants.", detail: "Custom handmade plant charm • pricing confirmed before payment", icon: "sun", prices: { "8": 0 } },
  { id: "rearview", name: "Rearview Hangers", short: "A little sparkle for the ride.", detail: "Custom rearview mirror hanger • pricing confirmed before payment", icon: "sun", prices: { "8": 0 } },
  { id: "phone", name: "Phone Charms", short: "Your phone, but more you.", detail: "Handmade dangling phone charm", icon: "phone", prices: { "8": 1399 } },
  { id: "hair", name: "Hair Accessories", short: "Wear a little sparkle.", detail: "Hanging clip-in beaded hair extension", icon: "hair", prices: { "18": 1899 } },
  { id: "wristlet", name: "Wristlets", short: "A little color to carry.", detail: "Handmade wristlet accessory", icon: "wristlet", prices: { "8": 1399 } },
  { id: "fan", name: "Fan Hangers", short: "A little charm in motion.", detail: "Custom hanging fan accessory • pricing confirmed before payment", icon: "sun", prices: { "8": 0 } },
  { id: "keychain", name: "Keychains", short: "A tiny piece of happy.", detail: "3 mini bead strands", icon: "key", prices: { "6": 999 } },
  { id: "ornament", name: "Ornaments", short: "Little keepsakes with personality.", detail: "Custom handmade ornament • pricing confirmed before payment", icon: "sun", prices: { "8": 0 } },
  { id: "lanyard", name: "Lanyards", short: "Everyday things, a little brighter.", detail: "Custom handmade lanyard • pricing confirmed before payment", icon: "key", prices: { "18": 0 } },
] as const;
export const palettes = [
  { id: "honey", name: "Honey glow", colors: ["#dba540", "#9c5626", "#e8d4ac", "#eddcb4"], description: "Amber, caramel & warm clear glass" },
  { id: "garden", name: "Secret garden", colors: ["#718263", "#be879c", "#bbb482", "#e6d8c9"], description: "Olive, blush & soft earthy greens" },
  { id: "cosmic", name: "Cosmic candy", colors: ["#997eb2", "#e18daf", "#76a8a0", "#ddd3ee"], description: "Lilac, pink & sea-glass teal" },
  { id: "mixed", name: "Happy accident", colors: ["#c56239", "#bda94c", "#78a897", "#b580a5"], description: "An eclectic assortment of colors" },
  { id: "custom", name: "My own palette", colors: ["#eadbd2", "#e8d7df", "#d6dfd4", "#ded6ec"], description: "Tell me your colors in the notes" },
] as const;
export type ProductId = typeof products[number]["id"];
export const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
export function priceFor(productId: string, length: string, extras: {ribbons?:boolean;threads?:boolean;charms?:boolean} = {}) {
  const product = products.find(p => p.id === productId);
  const base = product ? (product.prices as Record<string, number>)[length] : undefined;
  if (base === undefined) return undefined;
  return base + (productId === "curtain" ? (extras.ribbons ? 500 : 0) + (extras.threads ? 500 : 0) + (extras.charms ? 1000 : 0) : 0);
}
export const FREE_SHIPPING_THRESHOLD_CENTS = 25000;
export const shippingRates: Record<string, number> = { curtain:1795, portiere:1795, valance:995, plant:595, rearview:695, fan:695, ornament:595, lanyard:695, garland:995, strand:795, suncatcher:695, wristlet:695, keychain:595, phone:595, hair:595 };
export function totals(unit: number, quantity: number, delivery: string, shipping: number, taxBps: number, productId = "") {
  const subtotal = unit * quantity;
  const deliveryFee = delivery === "shipping" && subtotal < FREE_SHIPPING_THRESHOLD_CENTS ? (shippingRates[productId] ?? shipping) : 0;
  const tax = Math.round((subtotal + deliveryFee) * taxBps / 10000);
  return { subtotal, shipping: deliveryFee, tax, total: subtotal + deliveryFee + tax };
}
