export const products = [
  { id: "curtain", name: "Beaded curtain", short: "A little everyday magic.", detail: "15 individually beaded strands • custom length", icon: "curtain", prices: { "12": 10000, "24": 15500, "48": 27500, "55": 32500 } },
  { id: "suncatcher", name: "Mini suncatcher", short: "Let the sunshine in.", detail: '3 beaded strands • approximately 8 inches', icon: "sun", prices: { "8": 2400 } },
  { id: "keychain", name: "Beaded keychain", short: "A tiny piece of happy.", detail: '1 beaded strand • approximately 6 inches', icon: "key", prices: { "6": 1600 } },
  { id: "phone", name: "Phone charm", short: "Your phone, but more you.", detail: '1 beaded loop • approximately 8 inches', icon: "phone", prices: { "8": 2000 } },
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
export function priceFor(productId: string, length: string) {
  const product = products.find(p => p.id === productId);
  return product ? (product.prices as Record<string, number>)[length] : undefined;
}
export function totals(unit: number, quantity: number, delivery: string, shipping: number, taxBps: number) {
  const subtotal = unit * quantity;
  const deliveryFee = delivery === "shipping" ? shipping : 0;
  const tax = Math.round((subtotal + deliveryFee) * taxBps / 10000);
  return { subtotal, shipping: deliveryFee, tax, total: subtotal + deliveryFee + tax };
}
