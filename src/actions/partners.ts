"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Partner } from "@/models/Partner";

export interface PartnerDTO {
  id: string;
  name: string;
  url: string;
  publicId?: string;
}

type Result = { ok: true } | { ok: false; error: string };

interface LeanPartner {
  _id: unknown;
  name?: string;
  url: string;
  publicId?: string;
  order?: number;
}

export async function listPartners(): Promise<PartnerDTO[]> {
  await dbConnect();
  const docs = await Partner.find().sort({ order: 1, createdAt: 1 }).lean<LeanPartner[]>();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name ?? "",
    url: d.url,
    publicId: d.publicId || undefined,
  }));
}

export async function createPartner(input: {
  name?: string;
  url: string;
  publicId?: string;
}): Promise<Result> {
  try {
    await dbConnect();
    if (!input.url) return { ok: false, error: "Imagem obrigatória." };
    await Partner.create({
      name: (input.name ?? "").trim(),
      url: input.url,
      publicId: input.publicId,
    });
    revalidatePath("/admin/parceiros");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("createPartner:", err);
    return { ok: false, error: "Erro ao salvar parceiro." };
  }
}

export async function deletePartner(id: string): Promise<Result> {
  try {
    await dbConnect();
    await Partner.findByIdAndDelete(id);
    revalidatePath("/admin/parceiros");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("deletePartner:", err);
    return { ok: false, error: "Erro ao excluir parceiro." };
  }
}
