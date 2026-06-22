"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { slugify } from "@/lib/utils";
import { type ProductCategory, type CloudinaryImage } from "@/types";
import { productSchema } from "@/lib/schemas";

export type ProductInput = z.infer<typeof productSchema>;

/* ─── DTO ───────────────────────────────────────────────── */

export interface ProductDTO {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  sizes: string[];
  colors: string[];
  finishes: string[];
  leathers: string[];
  featured: boolean;
  active: boolean;
  gallery: CloudinaryImage[];
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

type LeanProduct = {
  _id: unknown;
  name: string;
  category: ProductCategory;
  description?: string;
  sizes?: string[];
  colors?: string[];
  finishes?: string[];
  leathers?: string[];
  featured?: boolean;
  active?: boolean;
  gallery?: CloudinaryImage[];
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
};

function serialize(p: LeanProduct): ProductDTO {
  return {
    id: String(p._id),
    name: p.name,
    category: p.category,
    description: p.description ?? "",
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    finishes: p.finishes ?? [],
    leathers: p.leathers ?? [],
    featured: !!p.featured,
    active: p.active !== false,
    gallery: (p.gallery ?? []).map((g) => ({ url: g.url, publicId: g.publicId, alt: g.alt })),
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    slug: p.slug,
  };
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "produto";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await Product.findOne({ slug }).select("_id").lean<{ _id: unknown }>();
    if (!found || (ignoreId && String(found._id) === ignoreId)) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

/* ─── Leitura ───────────────────────────────────────────── */

export async function listProducts(): Promise<ProductDTO[]> {
  try {
    await dbConnect();
    const docs = await Product.find().sort({ createdAt: -1 }).lean<LeanProduct[]>();
    return docs.map(serialize);
  } catch (err) {
    console.error("listProducts:", err);
    return [];
  }
}

export async function getProduct(id: string): Promise<ProductDTO | null> {
  await dbConnect();
  const doc = await Product.findById(id).lean<LeanProduct>();
  return doc ? serialize(doc) : null;
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  try {
    await dbConnect();
    const doc = await Product.findOne({ slug, active: { $ne: false } }).lean<LeanProduct>();
    return doc ? serialize(doc) : null;
  } catch (err) {
    console.error("getProductBySlug:", err);
    return null;
  }
}

export async function listCatalog(): Promise<ProductDTO[]> {
  try {
    await dbConnect();
    const docs = await Product.find({ active: { $ne: false } }).sort({ featured: -1, name: 1 }).lean<LeanProduct[]>();
    return docs.map(serialize);
  } catch (err) {
    console.error("listCatalog:", err);
    return [];
  }
}

export async function listProductOptions(): Promise<string[]> {
  try {
    await dbConnect();
    const docs = await Product.find({ active: { $ne: false } }).select("name").sort({ name: 1 }).lean<{ name: string }[]>();
    return docs.map((d) => d.name);
  } catch (err) {
    console.error("listProductOptions:", err);
    return [];
  }
}

/* ─── Escrita ───────────────────────────────────────────── */

export async function createProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await dbConnect();
    const d = parsed.data;
    const slug = await uniqueSlug(d.slug || d.name);
    const p = await Product.create({ ...d, slug });
    revalidatePath("/admin/produtos");
    revalidatePath("/produtos");
    return { ok: true, data: { id: String(p._id) } };
  } catch (err) {
    console.error("createProduct:", err);
    return { ok: false, error: "Erro ao criar produto." };
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await dbConnect();
    const d = parsed.data;
    const slug = await uniqueSlug(d.slug || d.name, id);
    await Product.findByIdAndUpdate(id, { ...d, slug });
    revalidatePath("/admin/produtos");
    revalidatePath(`/produtos/${slug}`);
    revalidatePath("/produtos");
    return { ok: true };
  } catch (err) {
    console.error("updateProduct:", err);
    return { ok: false, error: "Erro ao atualizar produto." };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/admin/produtos");
    revalidatePath("/produtos");
    return { ok: true };
  } catch (err) {
    console.error("deleteProduct:", err);
    return { ok: false, error: "Erro ao excluir produto." };
  }
}
