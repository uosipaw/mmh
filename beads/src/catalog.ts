export const products = [
  { id: "portiere", name: "Portières", short: "Long strands for dramatic spaces.", detail: "20 handmade strands • 50–72 inches • $0.35 per inch per strand", icon: "curtain", prices: Object.fromEntries(Array.from({length:23},(_,i)=>{const n=i+50;return [String(n),n*20*35];})) },
  { id: "curtain", name: "Curtains", short: "For windows and walls.", detail: "20 handmade strands • 19–48 inches • $0.45 per inch per strand", icon: "curtain", prices: Object.fromEntries(Array.from({length:30},(_,i)=>{const n=i+19;return [String(n),n*20*45];})) },
  { id: "valance", name: "Valances", short: "A little light up top.", detail: "20 handmade strands • 12–18 inches • $0.50 per inch per strand", icon: "curtain", prices: Object.fromEntries(Array.from({length:7},(_,i)=>{const n=i+12;return [String(n),n*20*50];})) },
  { id: "suncatcher", name: "Suncatchers", short: "Maximalism, miniaturized.", detail: "5 beaded strands • approximately 8 inches per hanging • pricing confirmed before payment", icon: "sun", prices: { "8": 0 } },
  { id: "strand", name: "Strands by the Inch", short: "Just one, or a whole bunch.", detail: "One handmade strand • $0.75 per inch", icon: "strand", prices: Object.fromEntries(Array.from({length:77},(_,i)=>{const n=i+8;return [String(n),n*75];})) },
  { id: "garland", name: "Garland + Table Runners", short: "Three strands, one lovely garland.", detail: "3 strands joined at both ends • 48–60 inches • $0.50 per inch per strand", icon: "garland", prices: Object.fromEntries(Array.from({length:13},(_,i)=>{const n=i+48;return [String(n),n*150];})) },
  { id: "plant", name: "Plant Charms", short: "A little something for your plants.", detail: "1 handmade beaded strand • 5 inches • decorative plant charm", icon: "sun", prices: { "5": 999 } },
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
  { id: "aries", name: "Aries", group: "zodiac", colors: ["#C9273C","#E9544C","#E88A3B","#D9B46B","#F3EEE5"], description: "Cherry, coral, flame orange, gold and clear crystal" },
  { id: "taurus", name: "Taurus", group: "zodiac", colors: ["#638163","#686442","#B89367","#E8BBA5","#F0E4CF"], description: "Moss, olive, warm wood, dusty peach and shell cream" },
  { id: "gemini", name: "Gemini", group: "zodiac", colors: ["#EFC65A","#83BEB8","#DE91AD","#949FCF","#F5EEE0"], description: "Lemon, turquoise, pink, periwinkle and cream" },
  { id: "cancer", name: "Cancer", group: "zodiac", colors: ["#F0E4CF","#ACCADF","#E9BAC8","#89C7BA","#D2D3D9"], description: "Shell cream, soft blue, blush, seafoam and silver" },
  { id: "leo", name: "Leo", group: "zodiac", colors: ["#BA9146","#EFC65A","#E17335","#E8BBA5","#F3EEE5"], description: "Amber gold, sunshine, orange, peach and crystal" },
  { id: "virgo", name: "Virgo", group: "zodiac", colors: ["#EDDBBB","#CFBC99","#92AA79","#A58B65","#F4E9D4"], description: "Pale wood, sand, sage, driftwood and ivory" },
  { id: "libra", name: "Libra", group: "zodiac", colors: ["#DE91AD","#ECC4CB","#4AA6A4","#B98E45","#F5EEE0"], description: "Rose, blush, turquoise, warm gold and cream" },
  { id: "scorpio", name: "Scorpio", group: "zodiac", colors: ["#24232F","#A9324A","#5D396B","#8B64AC","#C4C5CE"], description: "Ink, garnet red, plum, violet and silver" },
  { id: "sagittarius", name: "Sagittarius", group: "zodiac", colors: ["#58456E","#246B8C","#6FADB0","#D9B46B","#ED9E8E"], description: "Plum, deep blue, weathered turquoise, gold and coral" },
  { id: "capricorn", name: "Capricorn", group: "zodiac", colors: ["#51362B","#76503B","#986B4C","#686442","#BA9146"], description: "Walnut, cocoa, chestnut, olive and antique gold" },
  { id: "aquarius", name: "Aquarius", group: "zodiac", colors: ["#246B8C","#58AABD","#949FCF","#89C7BA","#D2D3D9"], description: "Deep blue, aqua, periwinkle, mint and silver" },
  { id: "pisces", name: "Pisces", group: "zodiac", colors: ["#BEA9D3","#81ACD0","#89C7BA","#DAD7EA","#F4F0E8"], description: "Lavender, watery blue, seafoam, pale lilac and crystal" },
  { id: "sun", name: "Sun", group: "celestial", colors: ["#EFC65A","#D9B46B","#E17335","#F3BD78","#F0E4CF"], description: "Sunshine, honey gold, orange, apricot and cream" },
  { id: "moon", name: "Moon", group: "celestial", colors: ["#F4F0E8","#D2D3D9","#DAD7EA","#ACCADF","#E8D7DF"], description: "Pearl white, silver, pale lilac, mist blue and blush" },
  { id: "mercury", name: "Mercury", group: "celestial", colors: ["#3C929F","#87AF62","#F1C94F","#C4C5CE","#F3EEE5"], description: "Teal, leaf green, yellow, silver and crystal" },
  { id: "venus", name: "Venus", group: "celestial", colors: ["#DE91AD","#ED9E8E","#B98E45","#6FADB0","#ECC4CB"], description: "Rose, peach, gold, turquoise and blush" },
  { id: "earth", name: "Earth", group: "celestial", colors: ["#34574A","#72846B","#A58B65","#6FADB0","#F0E4CF"], description: "Forest, moss, driftwood, weathered turquoise and shell cream" },
  { id: "mars", name: "Mars", group: "celestial", colors: ["#C9273C","#DC3F31","#B65030","#E88A3B","#D9B46B"], description: "Ruby red, tomato, burnt orange, flame orange and gold" },
  { id: "jupiter", name: "Jupiter", group: "celestial", colors: ["#246B8C","#58456E","#BA9146","#B59AAE","#F0E4CF"], description: "Deep blue, plum, antique gold, dusty lavender and ivory" },
  { id: "saturn", name: "Saturn", group: "celestial", colors: ["#686442","#A58B65","#B89367","#C4C5CE","#2F2925"], description: "Smoky olive, driftwood, oak, silver and charcoal" },
  { id: "uranus", name: "Uranus", group: "celestial", colors: ["#58AABD","#89C7BA","#CEE0AE","#DAD7EA","#F4F0E8"], description: "Electric aqua, mint, pale lime, lilac and clear white" },
  { id: "neptune", name: "Neptune", group: "celestial", colors: ["#246B8C","#46778F","#4AA6A4","#8994B4","#D2D3D9"], description: "Ocean blue, deep teal, turquoise, smoky periwinkle and silver" },
  { id: "pluto", name: "Pluto", group: "celestial", colors: ["#24232F","#51362B","#A9324A","#5D396B","#C4C5CE"], description: "Ink, dark cocoa, garnet, plum and silver" },
  { id: "custom", name: "My own palette", group: "custom", colors: ["#D5A678","#A6B6A0","#B79DBB","#DED2C1","#7C8D96"], description: "Your own colors, your own combination. Describe it in the notes below." },
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

