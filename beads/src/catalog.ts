export const products = [
  { id: "portiere", name: "Portières", short: "Long strands for dramatic spaces.", detail: "20 handmade strands • 50–72 inches • $0.35 per inch per strand", icon: "curtain", prices: Object.fromEntries(Array.from({length:23},(_,i)=>{const n=i+50;return [String(n),n*20*35];})) },
  { id: "curtain", name: "Curtains", short: "For windows and walls.", detail: "20 handmade strands • 19–48 inches • $0.45 per inch per strand", icon: "curtain", prices: Object.fromEntries(Array.from({length:30},(_,i)=>{const n=i+19;return [String(n),n*20*45];})) },
  { id: "valance", name: "Valances", short: "A little light up top.", detail: "20 handmade strands • 12–18 inches • $0.50 per inch per strand", icon: "curtain", prices: Object.fromEntries(Array.from({length:7},(_,i)=>{const n=i+12;return [String(n),n*20*50];})) },
  { id: "suncatcher", name: "Sun Catchers", short: "Maximalism, miniaturized.", detail: "5 beaded strands • approximately 8 inches per hanging • pricing confirmed before payment", icon: "sun", prices: { "8": 0 } },
  { id: "strand", name: "Strands by the Inch", short: "Just one, or a whole bunch.", detail: "One handmade strand • $0.75 per inch", icon: "strand", prices: Object.fromEntries(Array.from({length:77},(_,i)=>{const n=i+8;return [String(n),n*75];})) },
  { id: "garland", name: "Garland + Table Runners", short: "Three strands, one lovely garland.", detail: "3 strands joined at both ends • 48–60 inches • $0.50 per inch per strand", icon: "garland", prices: Object.fromEntries(Array.from({length:13},(_,i)=>{const n=i+48;return [String(n),n*150];})) },
  { id: "plant", name: "Plant Charms", short: "A little something for your plants.", detail: "1 handmade beaded strand • 5 inches • a playful accent for your favorite greenery", icon: "sun", prices: { "5": 999 } },
  { id: "rearview", name: "Rearview Hangers", short: "A little sparkle for the ride.", detail: "2 handmade beaded strands • choose 3–5 inches • hangs from a rearview mirror", icon: "sun", prices: { "3": 1699, "4": 1699, "5": 1699 } },
  { id: "phone", name: "Phone Charms", short: "Your phone, but more you.", detail: "1 looped beaded strand • 8 inches total (4 inches on each side)", icon: "phone", prices: { "8": 1399 } },
  { id: "hair", name: "Hair Accessories", short: "Wear a little sparkle.", detail: "1 hanging clip-in beaded hair extension • choose 6–12 inches", icon: "hair", prices: { "6": 1499, "7": 1499, "8": 1499, "9": 1899, "10": 1899, "11": 1899, "12": 1899 } },
  { id: "wristlet", name: "Wristlets", short: "A little color to carry.", detail: "1–2 beaded strands • approximately 9 inches • wrist-sized loop", icon: "wristlet", prices: { "9": 1699 } },
  { id: "fan", name: "Fan Hangers", short: "A little charm in motion.", detail: "1 handmade beaded strand • 8 inches • decorative fan hanger", icon: "sun", prices: { "8": 1299 } },
  { id: "keychain", name: "Keychains", short: "A tiny piece of happy.", detail: "3 mini handmade beaded strands • 5 inches each", icon: "key", prices: { "5": 1199 } },
  { id: "ornament", name: "Ornaments", short: "Little keepsakes with personality.", detail: "1 handmade beaded ornament • 1 strand • 3 inches", icon: "sun", prices: { "3": 599 } },
  { id: "ornament-set", name: "Ornaments — Set of 10", short: "Ten little keepsakes, one happy set.", detail: "10 handmade beaded ornaments • 1 strand each • 3 inches per ornament", icon: "sun", prices: { "3": 3999 } },
  { id: "lanyard", name: "Lanyards", short: "Everyday things, a little brighter.", detail: "1 looped handmade beaded strand • 34 inches total", icon: "key", prices: { "34": 2499 } },
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
  return base + (["curtain", "portiere", "valance"].includes(productId) ? (extras.ribbons ? 500 : 0) + (extras.threads ? 500 : 0) + (extras.charms ? 1000 : 0) : 0);
}
export const FREE_SHIPPING_THRESHOLD_CENTS = 25000;
export const shippingRates: Record<string, number> = { curtain:1795, portiere:1795, valance:995, plant:595, rearview:695, fan:695, ornament:595, "ornament-set":695, lanyard:695, garland:995, strand:795, suncatcher:695, wristlet:695, keychain:595, phone:595, hair:595 };
export function totals(unit: number, quantity: number, delivery: string, shipping: number, taxBps: number, productId = "") {
  const subtotal = unit * quantity;
  const deliveryFee = delivery === "shipping" && subtotal < FREE_SHIPPING_THRESHOLD_CENTS ? (shippingRates[productId] ?? shipping) : 0;
  const tax = Math.round((subtotal + deliveryFee) * taxBps / 10000);
  return { subtotal, shipping: deliveryFee, tax, total: subtotal + deliveryFee + tax };
}
