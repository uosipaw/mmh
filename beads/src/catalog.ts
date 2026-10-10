export const products = [
  { id: "curtain", name: "Beaded curtain", short: "A whole doorway of light.", detail: "15 handmade strands • first 24 inches at $0.50/inch, additional inches at $0.35/inch", icon: "curtain", prices: Object.fromEntries(Array.from({length:73},(_,i)=>{const n=i+12;return [String(n),15*(Math.min(n,24)*50+Math.max(0,n-24)*35)];})) },
  { id: "strand", name: "Individual bead strand", short: "Just one, or a whole bunch.", detail: "One handmade strand • $0.50 per inch", icon: "strand", prices: Object.fromEntries(Array.from({length:77},(_,i)=>{const n=i+8;return [String(n),n*50];})) },
  { id: "garland", name: "Beaded garland", short: "Three strands, one lovely garland.", detail: "3 strands joined at both ends • 48-inch minimum • $0.50 per inch per strand", icon: "garland", prices: Object.fromEntries(Array.from({length:97},(_,i)=>{const n=i+48;return [String(n),n*150];})) },
  { id: "suncatcher", name: "Mini suncatcher", short: "Let the sunshine in.", detail: "3 beaded strands • approximately 8 inches", icon: "sun", prices: { "8": 1200 } },
  { id: "keychain", name: "Mini bead keychain", short: "A tiny piece of happy.", detail: "3 mini bead strands", icon: "key", prices: { "6": 999 } },
  { id: "wristlet", name: "Beaded wristlet", short: "A little color to carry.", detail: "Handmade wristlet accessory", icon: "wristlet", prices: { "8": 1399 } },
  { id: "phone", name: "Phone charm", short: "Your phone, but more you.", detail: "Handmade dangling phone charm", icon: "phone", prices: { "8": 1399 } },
  { id: "hair", name: "Beaded hair strand", short: "Wear a little sparkle.", detail: "Hanging clip-in beaded hair extension • not a decorative barrette", icon: "hair", prices: { "18": 1899 } },
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
export function totals(unit: number, quantity: number, delivery: string, shipping: number, taxBps: number) {
  const subtotal = unit * quantity;
  const deliveryFee = delivery === "shipping" ? shipping : 0;
  const tax = Math.round((subtotal + deliveryFee) * taxBps / 10000);
  return { subtotal, shipping: deliveryFee, tax, total: subtotal + deliveryFee + tax };
}
