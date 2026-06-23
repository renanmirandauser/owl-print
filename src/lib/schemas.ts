import { z } from "zod";

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

/* Lead vindo do site (público) — endurecido: trim + limites de tamanho */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120, "Nome muito longo"),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  instagram: z.string().trim().max(80).optional(),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(160)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(3000, "Mensagem muito longa").optional(),
  source: z.string().trim().max(40).optional(),
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
  category: z.string().min(1, "Informe a categoria"),
  description: z.string().optional(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  finishes: z.array(z.string()).default([]),
  leathers: z.array(z.string()).default([]),
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
  segment: z.string().min(1, "Informe o segmento"),
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

/* Briefing — solicitação de criação enviada pelo cliente (site) */
export const briefingSchema = z.object({
  // contato
  responsible: z.string().min(2, "Informe seu nome"),
  company: z.string().min(2, "Informe o nome do estabelecimento"),
  whatsapp: z.string().min(8, "Informe um WhatsApp para contato"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  instagram: z.string().optional(),
  city: z.string().optional(),
  // estabelecimento
  segment: z.string().optional(),
  style: z.string().optional(),
  audience: z.string().optional(),
  hasBranding: z.string().optional(),
  // projeto
  projectType: z.string().optional(),
  productTypes: z.array(z.string()).default([]),
  quantity: z.string().optional(),
  size: z.string().optional(),
  colorPreference: z.string().optional(),
  finishes: z.array(z.string()).default([]),
  logoPosition: z.string().optional(),
  pages: z.string().optional(),
  languages: z.string().optional(),
  contentReady: z.string().optional(),
  // referências e prazo
  references: z.string().optional(),
  deadline: z.string().optional(),
  budget: z.string().optional(),
  notes: z.string().optional(),
});
