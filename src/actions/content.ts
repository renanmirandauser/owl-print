"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { SiteContent } from "@/models/SiteContent";

export interface LojaContent {
  eyebrow: string;
  title: string;
  description: string;
}

const LOJA_DEFAULT: LojaContent = {
  eyebrow: "Monte e envie em 1 minuto",
  title: "Loja",
  description:
    "Escolha os produtos, defina as opções e a quantidade. Ao finalizar, seu orçamento é enviado direto para o nosso WhatsApp — sem complicação.",
};

type Result = { ok: true } | { ok: false; error: string };

export async function getLojaContent(): Promise<LojaContent> {
  await dbConnect();
  const doc = await SiteContent.findOne({ key: "loja" }).lean<{ data?: Partial<LojaContent> }>();
  return { ...LOJA_DEFAULT, ...(doc?.data ?? {}) };
}

export async function saveLojaContent(data: LojaContent): Promise<Result> {
  try {
    await dbConnect();
    await SiteContent.findOneAndUpdate(
      { key: "loja" },
      {
        key: "loja",
        data: {
          eyebrow: (data.eyebrow ?? "").trim(),
          title: (data.title ?? "").trim() || "Loja",
          description: (data.description ?? "").trim(),
        },
      },
      { upsert: true }
    );
    revalidatePath("/loja");
    revalidatePath("/admin/loja");
    return { ok: true };
  } catch (err) {
    console.error("saveLojaContent:", err);
    return { ok: false, error: "Erro ao salvar." };
  }
}
