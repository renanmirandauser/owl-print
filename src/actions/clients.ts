"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { LEAD_STATUS, type LeadStatus, LEAD_STATUS_LABEL } from "@/types";
import { clientSchema } from "@/lib/schemas";

export type ClientInput = z.infer<typeof clientSchema>;

/* ─── DTOs ──────────────────────────────────────────────── */

export interface ActivityDTO {
  type: string;
  content: string;
  at: string;
}
export interface ClientDTO {
  id: string;
  name: string;
  company: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  notes: string;
  status: LeadStatus;
  source: string;
  activities: ActivityDTO[];
  createdAt: string | null;
}
export interface ClientOption {
  id: string;
  name: string;
  phone: string;
  email: string;
}

type LeanClient = {
  _id: unknown;
  name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  notes?: string;
  status: LeadStatus;
  source?: string;
  activities?: { type?: string; content?: string; at?: Date }[];
  createdAt?: Date;
};

function serialize(c: LeanClient): ClientDTO {
  return {
    id: String(c._id),
    name: c.name,
    company: c.company ?? "",
    phone: c.phone ?? "",
    whatsapp: c.whatsapp ?? "",
    instagram: c.instagram ?? "",
    email: c.email ?? "",
    notes: c.notes ?? "",
    status: c.status,
    source: c.source ?? "",
    activities: (c.activities ?? [])
      .map((a) => ({
        type: a.type ?? "note",
        content: a.content ?? "",
        at: a.at ? new Date(a.at).toISOString() : new Date().toISOString(),
      }))
      .sort((a, b) => +new Date(b.at) - +new Date(a.at)),
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
  };
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

/* ─── Leitura ───────────────────────────────────────────── */

export async function listClients(opts?: {
  status?: LeadStatus | "all";
  q?: string;
}): Promise<ClientDTO[]> {
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (opts?.status && opts.status !== "all") filter.status = opts.status;
  if (opts?.q) {
    const rx = new RegExp(opts.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }];
  }
  const docs = await Client.find(filter).sort({ updatedAt: -1 }).lean<LeanClient[]>();
  return docs.map(serialize);
}

export async function getClient(id: string): Promise<ClientDTO | null> {
  await dbConnect();
  const doc = await Client.findById(id).lean<LeanClient>();
  return doc ? serialize(doc) : null;
}

export async function listClientOptions(): Promise<ClientOption[]> {
  await dbConnect();
  const docs = await Client.find()
    .select("name phone whatsapp email")
    .sort({ name: 1 })
    .lean<{ _id: unknown; name: string; phone?: string; whatsapp?: string; email?: string }[]>();
  return docs.map((c) => ({
    id: String(c._id),
    name: c.name,
    phone: c.phone ?? c.whatsapp ?? "",
    email: c.email ?? "",
  }));
}

/* ─── Escrita ───────────────────────────────────────────── */

export async function createClient(input: ClientInput): Promise<ActionResult<{ id: string }>> {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await dbConnect();
    const c = await Client.create({
      ...parsed.data,
      status: "new",
      activities: [{ type: "status", content: "Lead criado", at: new Date() }],
    });
    revalidatePath("/admin/crm");
    return { ok: true, data: { id: String(c._id) } };
  } catch (err) {
    console.error("createClient:", err);
    return { ok: false, error: "Erro ao criar lead." };
  }
}

export async function updateClient(id: string, input: ClientInput): Promise<ActionResult> {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await dbConnect();
    await Client.findByIdAndUpdate(id, parsed.data);
    revalidatePath(`/admin/crm/${id}`);
    revalidatePath("/admin/crm");
    return { ok: true };
  } catch (err) {
    console.error("updateClient:", err);
    return { ok: false, error: "Erro ao atualizar lead." };
  }
}

export async function setClientStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  if (!LEAD_STATUS.includes(status)) return { ok: false, error: "Status inválido." };
  try {
    await dbConnect();
    await Client.findByIdAndUpdate(id, {
      status,
      $push: {
        activities: {
          type: "status",
          content: `Status alterado para "${LEAD_STATUS_LABEL[status]}"`,
          at: new Date(),
        },
      },
    });
    revalidatePath(`/admin/crm/${id}`);
    revalidatePath("/admin/crm");
    return { ok: true };
  } catch (err) {
    console.error("setClientStatus:", err);
    return { ok: false, error: "Erro ao alterar status." };
  }
}

export async function addActivity(
  id: string,
  content: string,
  type = "note"
): Promise<ActionResult> {
  if (!content.trim()) return { ok: false, error: "Escreva algo." };
  try {
    await dbConnect();
    await Client.findByIdAndUpdate(id, {
      $push: { activities: { type, content: content.trim(), at: new Date() } },
    });
    revalidatePath(`/admin/crm/${id}`);
    return { ok: true };
  } catch (err) {
    console.error("addActivity:", err);
    return { ok: false, error: "Erro ao registrar atividade." };
  }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Client.findByIdAndDelete(id);
    revalidatePath("/admin/crm");
    return { ok: true };
  } catch (err) {
    console.error("deleteClient:", err);
    return { ok: false, error: "Erro ao excluir lead." };
  }
}

/* ─── Importação em massa (planilha Excel/CSV) ─────────────── */
export interface ImportLeadRow {
  name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  notes?: string;
}

export async function importLeads(
  rows: ImportLeadRow[]
): Promise<{ ok: true; created: number; skipped: number } | { ok: false; error: string }> {
  try {
    await dbConnect();

    const clean = (v?: string) => {
      const t = (v ?? "").toString().trim();
      return t.length ? t : undefined;
    };

    const docs: Record<string, unknown>[] = [];
    let skipped = 0;

    for (const r of rows) {
      const name = clean(r.name);
      if (!name) {
        skipped++;
        continue;
      }
      docs.push({
        name,
        company: clean(r.company),
        phone: clean(r.phone),
        whatsapp: clean(r.whatsapp),
        instagram: clean(r.instagram),
        email: clean(r.email)?.toLowerCase(),
        notes: clean(r.notes),
        status: "new" as LeadStatus,
        source: "Importação Excel",
        activities: [{ type: "status", content: "Importado da planilha", at: new Date() }],
      });
    }

    if (docs.length === 0) {
      return {
        ok: false,
        error: "Nenhum lead válido encontrado. Verifique se há uma coluna com o nome.",
      };
    }

    await Client.insertMany(docs, { ordered: false });
    revalidatePath("/admin/crm");
    return { ok: true, created: docs.length, skipped };
  } catch (err) {
    console.error("importLeads:", err);
    return { ok: false, error: "Erro ao importar os leads. Tente novamente." };
  }
}

/* ─── Excluir todos os leads ────────────────────────────────── */
export async function deleteAllClients(): Promise<ActionResult<{ deleted: number }>> {
  try {
    await dbConnect();
    const result = await Client.deleteMany({});
    revalidatePath("/admin/crm");
    return { ok: true, data: { deleted: result.deletedCount } };
  } catch (err) {
    console.error("deleteAllClients:", err);
    return { ok: false, error: "Erro ao excluir os leads." };
  }
}
