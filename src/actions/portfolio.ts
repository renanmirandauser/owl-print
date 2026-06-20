"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Portfolio } from "@/models/Portfolio";
import { slugify } from "@/lib/utils";
import { type Segment, type CloudinaryImage } from "@/types";
import { portfolioSchema } from "@/lib/schemas";

export type PortfolioInput = z.infer<typeof portfolioSchema>;

export interface PortfolioDTO {
  id: string;
  title: string;
  clientName: string;
  segment: Segment;
  category: string;
  description: string;
  caseStudy: string;
  featured: boolean;
  images: CloudinaryImage[];
  slug: string;
}

type LeanItem = {
  _id: unknown;
  title: string;
  clientName: string;
  segment: Segment;
  category?: string;
  description?: string;
  caseStudy?: string;
  featured?: boolean;
  images?: CloudinaryImage[];
  slug: string;
};

function serialize(p: LeanItem): PortfolioDTO {
  return {
    id: String(p._id),
    title: p.title,
    clientName: p.clientName,
    segment: p.segment,
    category: p.category ?? "",
    description: p.description ?? "",
    caseStudy: p.caseStudy ?? "",
    featured: !!p.featured,
    images: (p.images ?? []).map((g) => ({ url: g.url, publicId: g.publicId, alt: g.alt })),
    slug: p.slug,
  };
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "case";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = await Portfolio.findOne({ slug }).select("_id").lean<{ _id: unknown }>();
    if (!found || (ignoreId && String(found._id) === ignoreId)) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

export async function listPortfolio(segment?: Segment | "all"): Promise<PortfolioDTO[]> {
  try {
    await dbConnect();
    const filter = segment && segment !== "all" ? { segment } : {};
    const docs = await Portfolio.find(filter).sort({ featured: -1, createdAt: -1 }).lean<LeanItem[]>();
    return docs.map(serialize);
  } catch (err) {
    console.error("listPortfolio:", err);
    return [];
  }
}

export async function getPortfolio(id: string): Promise<PortfolioDTO | null> {
  await dbConnect();
  const doc = await Portfolio.findById(id).lean<LeanItem>();
  return doc ? serialize(doc) : null;
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioDTO | null> {
  try {
    await dbConnect();
    const doc = await Portfolio.findOne({ slug }).lean<LeanItem>();
    return doc ? serialize(doc) : null;
  } catch (err) {
    console.error("getPortfolioBySlug:", err);
    return null;
  }
}

export async function createPortfolio(input: PortfolioInput): Promise<ActionResult<{ id: string }>> {
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await dbConnect();
    const d = parsed.data;
    const slug = await uniqueSlug(d.slug || d.title);
    const doc = await Portfolio.create({ ...d, slug });
    revalidatePath("/admin/portfolio");
    revalidatePath("/portfolio");
    return { ok: true, data: { id: String(doc._id) } };
  } catch (err) {
    console.error("createPortfolio:", err);
    return { ok: false, error: "Erro ao criar case." };
  }
}

export async function updatePortfolio(id: string, input: PortfolioInput): Promise<ActionResult> {
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await dbConnect();
    const d = parsed.data;
    const slug = await uniqueSlug(d.slug || d.title, id);
    await Portfolio.findByIdAndUpdate(id, { ...d, slug });
    revalidatePath("/admin/portfolio");
    revalidatePath(`/portfolio/${slug}`);
    revalidatePath("/portfolio");
    return { ok: true };
  } catch (err) {
    console.error("updatePortfolio:", err);
    return { ok: false, error: "Erro ao atualizar case." };
  }
}

export async function deletePortfolio(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Portfolio.findByIdAndDelete(id);
    revalidatePath("/admin/portfolio");
    revalidatePath("/portfolio");
    return { ok: true };
  } catch (err) {
    console.error("deletePortfolio:", err);
    return { ok: false, error: "Erro ao excluir case." };
  }
}
