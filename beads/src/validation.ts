import { z } from "zod";
import { products, palettes, priceFor } from "./catalog";
export const orderSchema = z.object({
  product: z.string().refine(v => products.some(p => p.id === v)),
  length: z.string(), palette: z.string().refine(v => palettes.some(p => p.id === v)),
  style: z.enum(["varied", "even"]), quantity: z.number().int().min(1).max(10),
  notes: z.string().trim().max(1500), name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200), phone: z.string().trim().max(30),
  delivery: z.enum(["pickup", "shipping"]),
  address: z.string().trim().max(200), city: z.string().trim().max(100),
  state: z.string().trim().max(2), zip: z.string().trim().max(10),
  accepted: z.literal(true), website: z.string().max(0),
  requestId: z.string().uuid(), action: z.enum(["request", "pay"]),
}).superRefine((v, ctx) => {
  if (priceFor(v.product, v.length) === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a valid length.", path: ["length"] });
  if (v.palette === "custom" && v.notes.length < 3) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tell us your custom colors in the notes.", path: ["notes"] });
  if (v.delivery === "shipping" && (!v.address || !v.city || !/^[A-Z]{2}$/.test(v.state) || !/^\d{5}(-\d{4})?$/.test(v.zip))) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a complete US shipping address.", path: ["address"] });
});
