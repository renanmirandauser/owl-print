"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Briefing } from "@/models/Briefing";
import { briefingSchema } from "@/lib/schemas";
import { BRIEFING_STATUS, type BriefingStatus } from "@/types";

export type BriefingInput = z.infer<typeof briefingSchema>;

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

export interface BriefingDTO {
  id: string;
  responsible: string;
  company: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  city?: string;
  segment?: string;
  style?: string;
  audience?: string;
  hasBranding?: string;
  projectType?: string;
  productTypes: string[];
  quantity?: string;
  size?: string;
  colorPreference?: string;
  finishes: string[];
  logoPosition?: string;
  pages?: string;
  languages?: string;
  contentReady?: string;
  references?: string;
  deadline?: string;
  budget?: string;
  notes?: string;
  status: BriefingStatus;
  createdAt: string;
}

interface LeanBriefing {
  _id: unknown;
  responsible: string;
  company: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  city?: string;
  segment?: string;
  style?: string;
  audience?: string;
  hasBranding?: string;
  projectType?: string;
  productTypes?: string[];
  quantity?: string;
  size?: string;
  colorPreference?: string;
  finishes?: string[];
  logoPosition?: string;
  pages?: string;
  languages?: string;
  contentReady?: string;
  references?: string;
  deadline?: string;
  budget?: string;
  notes?: string;
  status?: BriefingStatus;
  createdAt?: Date;
}

function serialize(b: LeanBriefing): BriefingDTO {
  return {
    id: String(b._id),
    responsible: b.responsible,
    company: b.company,
    whatsapp: b.whatsapp || undefined,
    email: b.email || undefined,
    instagram: b.instagram || undefined,
    city: b.city || undefined,
    segment: b.segment || undefined,
    style: b.style || undefined,
    audience: b.audience || undefined,
    hasBranding: b.hasBranding || undefined,
    projectType: b.projectType || undefined,
    productTypes: b.productTypes ?? [],
    quantity: b.quantity || undefined,
    size: b.size || undefined,
    colorPreference: b.colorPreference || undefined,
    finishes: b.finishes ?? [],
    logoPosition: b.logoPosition || undefined,
    pages: b.pages || undefined,
    languages: b.languages || undefined,
    contentReady: b.contentReady || undefined,
    references: b.references || undefined,
    deadline: b.deadline || undefined,
    budget: b.budget || undefined,
    notes: b.notes || undefined,
    status: b.status ?? "new",
    createdAt: (b.createdAt ?? new Date()).toISOString(),
  };
}

/* ─── PÚBLICO: envio do briefing pelo site ─────────────────── */
export async function createBriefing(
  input: BriefingInput & { website?: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    // honeypot anti-spam: bots costumam preencher o campo "website"
    if (input.website && input.website.trim()) {
      return { ok: true, data: { id: "" } };
    }

    const parsed = briefingSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Verifique os campos." };
    }

    await dbConnect();
    const doc = await Briefing.create({ ...parsed.data, status: "new" });
    revalidatePath("/admin/briefings");
    return { ok: true, data: { id: String(doc._id) } };
  } catch (err) {
    console.error("createBriefing:", err);
    return { ok: false, error: "Não foi possível enviar o briefing. Tente novamente." };
  }
}

/* ─── ADMIN ────────────────────────────────────────────────── */
export async function listBriefings(status?: BriefingStatus | "all"): Promise<BriefingDTO[]> {
  try {
    await dbConnect();
    const filter = status && status !== "all" ? { status } : {};
    const docs = await Briefing.find(filter).sort({ createdAt: -1 }).lean<LeanBriefing[]>();
    return docs.map(serialize);
  } catch (err) {
    console.error("listBriefings:", err);
    return [];
  }
}

export async function getBriefing(id: string): Promise<BriefingDTO | null> {
  try {
    await dbConnect();
    const doc = await Briefing.findById(id).lean<LeanBriefing | null>();
    return doc ? serialize(doc) : null;
  } catch (err) {
    console.error("getBriefing:", err);
    return null;
  }
}

export async function setBriefingStatus(id: string, status: BriefingStatus): Promise<ActionResult> {
  if (!BRIEFING_STATUS.includes(status)) return { ok: false, error: "Status inválido." };
  try {
    await dbConnect();
    await Briefing.findByIdAndUpdate(id, { status });
    revalidatePath("/admin/briefings");
    revalidatePath(`/admin/briefings/${id}`);
    return { ok: true };
  } catch (err) {
    console.error("setBriefingStatus:", err);
    return { ok: false, error: "Erro ao alterar status." };
  }
}

export async function deleteBriefing(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Briefing.findByIdAndDelete(id);
    revalidatePath("/admin/briefings");
    return { ok: true };
  } catch (err) {
    console.error("deleteBriefing:", err);
    return { ok: false, error: "Erro ao excluir briefing." };
  }
}
