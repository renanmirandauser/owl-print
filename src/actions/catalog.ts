"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { CatalogItem } from "@/models/CatalogItem";

export type CatalogKind = "category" | "color" | "leather" | "size" | "segment";

export interface CatalogItemDTO {
  id: string;
  kind: CatalogKind;
  name: string;
  hex?: string;
  order: number;
}

type Result = { ok: true } | { ok: false; error: string };

interface LeanCatalogItem {
  _id: unknown;
  kind: CatalogKind;
  name: string;
  hex?: string;
  order?: number;
}

export async function listCatalogItems(kind?: CatalogKind): Promise<CatalogItemDTO[]> {
  await dbConnect();
  const filter = kind ? { kind } : {};
  const docs = await CatalogItem.find(filter).sort({ order: 1, name: 1 }).lean<LeanCatalogItem[]>();
  return docs.map((d) => ({
    id: String(d._id),
    kind: d.kind,
    name: d.name,
    hex: d.hex || undefined,
    order: d.order ?? 0,
  }));
}

export async function createCatalogItem(input: {
  kind: CatalogKind;
  name: string;
  hex?: string;
}): Promise<Result> {
  try {
    await dbConnect();
    const name = (input.name ?? "").trim();
    if (name.length < 1) return { ok: false, error: "Informe um nome." };
    if (name.length > 60) return { ok: false, error: "Nome muito longo." };

    await CatalogItem.create({
      kind: input.kind,
      name,
      hex: input.kind === "color" ? (input.hex || "").trim() || undefined : undefined,
    });

    revalidatePath("/admin/catalogo");
    revalidatePath("/admin/portfolio");
    return { ok: true };
  } catch (err) {
    console.error("createCatalogItem:", err);
    return { ok: false, error: "Erro ao salvar." };
  }
}

export async function deleteCatalogItem(id: string): Promise<Result> {
  try {
    await dbConnect();
    await CatalogItem.findByIdAndDelete(id);
    revalidatePath("/admin/catalogo");
    return { ok: true };
  } catch (err) {
    console.error("deleteCatalogItem:", err);
    return { ok: false, error: "Erro ao excluir." };
  }
}

/* Opções já prontas para o formulário de produto */
export interface ProductFormOptions {
  categories: string[];
  colors: { name: string; hex?: string }[];
  leathers: string[];
  sizes: string[];
}

export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const [cats, colors, leathers, sizes] = await Promise.all([
    listCatalogItems("category"),
    listCatalogItems("color"),
    listCatalogItems("leather"),
    listCatalogItems("size"),
  ]);
  return {
    categories: cats.map((c) => c.name),
    colors: colors.map((c) => ({ name: c.name, hex: c.hex })),
    leathers: leathers.map((c) => c.name),
    sizes: sizes.map((c) => c.name),
  };
}

/* Lista de segmentos (para o Portfólio) */
export async function listSegments(): Promise<string[]> {
  const segs = await listCatalogItems("segment");
  return segs.map((s) => s.name);
}
