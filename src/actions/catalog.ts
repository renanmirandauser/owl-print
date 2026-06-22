"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { CatalogItem } from "@/models/CatalogItem";

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
