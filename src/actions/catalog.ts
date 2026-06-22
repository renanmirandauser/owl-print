"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { CatalogItem } from "@/models/CatalogItem";
import { PRODUCT_CATEGORIES, CATEGORY_LABEL } from "@/types";

export type CatalogKind = "category" | "color" | "leather" | "size";

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

/* Importa as 7 categorias padrão para a lista editável (sem duplicar) */
export async function seedDefaultCategories(): Promise<
  { ok: true; added: number } | { ok: false; error: string }
> {
  try {
    await dbConnect();
    const existing = new Set(
      (await listCatalogItems("category")).map((c) => c.name.toLowerCase())
    );
    let added = 0;
    for (const c of PRODUCT_CATEGORIES) {
      const label = CATEGORY_LABEL[c];
      if (!existing.has(label.toLowerCase())) {
        await CatalogItem.create({ kind: "category", name: label });
        added++;
      }
    }
    revalidatePath("/admin/catalogo");
    revalidatePath("/");
    revalidatePath("/produtos");
    return { ok: true, added };
  } catch (err) {
    console.error("seedDefaultCategories:", err);
    return { ok: false, error: "Erro ao importar." };
  }
}

/* Lista unificada de categorias para exibição (padrões + cadastradas, sem repetir) */
export async function listDisplayCategories(): Promise<{ value: string; label: string }[]> {
  const managed = await listCatalogItems("category");
  const defaults = PRODUCT_CATEGORIES.map((c) => ({ value: c as string, label: CATEGORY_LABEL[c] }));
  const managedMapped = managed.map((m) => ({ value: m.name, label: m.name }));
  const all = [...defaults, ...managedMapped];
  return all.filter((c, i, arr) => arr.findIndex((x) => x.label === c.label) === i);
}
