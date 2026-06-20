import { z } from "zod";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  SEGMENTS,
  type Segment,
} from "@/types";

/* Imagem (Cloudinary) — usada por produtos e portfólio */
export const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

/* CRM — cliente/lead */
export const clientSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  company: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
  source: z.string().optional(),
});

/* Lead vindo do site (mesma forma do cliente) */
export const leadSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  company: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
  source: z.string().optional(),
});

/* Financeiro — lançamento */
export const entrySchema = z.object({
  kind: z.enum(["revenue", "expense"]),
  description: z.string().min(2, "Descreva o lançamento"),
  amount: z.coerce.number().min(0.01, "Valor inválido"),
  category: z.string().optional(),
  date: z.string().optional(), // yyyy-mm-dd
});

/* Produto */
export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  category: z
    .string()
    .refine((v) => PRODUCT_CATEGORIES.includes(v as ProductCategory), "Categoria inválida"),
  description: z.string().optional(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  finishes: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  gallery: z.array(imageSchema).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  slug: z.string().optional(),
});

/* Portfólio */
export const portfolioSchema = z.object({
  title: z.string().min(2, "Informe o título"),
  clientName: z.string().min(2, "Informe o cliente"),
  segment: z.string().refine((v) => SEGMENTS.includes(v as Segment), "Segmento inválido"),
  category: z.string().optional(),
  description: z.string().optional(),
  caseStudy: z.string().optional(),
  featured: z.boolean().default(false),
  images: z.array(imageSchema).default([]),
  slug: z.string().optional(),
});

/* Orçamento — item e documento */
const itemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1, "Informe o produto"),
  quantity: z.coerce.number().int().min(1, "Qtd mínima 1"),
  unitPrice: z.coerce.number().min(0, "Valor inválido"),
});

export const quoteSchema = z.object({
  clientName: z.string().min(2, "Informe o cliente"),
  clientId: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  validUntil: z.string().optional(), // ISO yyyy-mm-dd
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Adicione ao menos 1 produto"),
});
