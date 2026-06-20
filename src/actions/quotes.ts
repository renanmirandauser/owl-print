"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Quote } from "@/models/Quote";
import { QUOTE_STATUS, type QuoteStatus } from "@/types";
import { quoteSchema } from "@/lib/schemas";

export type QuoteInput = z.infer<typeof quoteSchema>;

/* ─── DTOs serializáveis (para Client Components) ───────── */

export interface QuoteItemDTO {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface QuoteDTO {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  status: QuoteStatus;
  total: number;
  items: QuoteItemDTO[];
  notes: string;
  validUntil: string | null;
  createdAt: string | null;
}

type LeanQuote = {
  _id: unknown;
  code: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  status: QuoteStatus;
  total: number;
  items?: { name: string; quantity: number; unitPrice: number }[];
  notes?: string;
  validUntil?: Date;
  createdAt?: Date;
};

function serialize(q: LeanQuote): QuoteDTO {
  return {
    id: String(q._id),
    code: q.code,
    clientName: q.clientName,
    clientPhone: q.clientPhone ?? "",
    clientEmail: q.clientEmail ?? "",
    status: q.status,
    total: q.total ?? 0,
    items: (q.items ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.quantity * i.unitPrice,
    })),
    notes: q.notes ?? "",
    validUntil: q.validUntil ? new Date(q.validUntil).toISOString() : null,
    createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : null,
  };
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

/* ─── Geração de código sequencial (ORC-00035) ──────────── */

async function nextCode(): Promise<string> {
  const last = await Quote.findOne().sort({ createdAt: -1 }).select("code").lean<{ code: string }>();
  const n = last?.code ? parseInt(last.code.replace(/\D/g, ""), 10) || 0 : 0;
  return `ORC-${String(n + 1).padStart(5, "0")}`;
}

/* ─── Leitura ───────────────────────────────────────────── */

export async function listQuotes(status?: QuoteStatus | "all"): Promise<QuoteDTO[]> {
  await dbConnect();
  const filter = status && status !== "all" ? { status } : {};
  const docs = await Quote.find(filter).sort({ createdAt: -1 }).lean<LeanQuote[]>();
  return docs.map(serialize);
}

export async function getQuote(id: string): Promise<QuoteDTO | null> {
  await dbConnect();
  const doc = await Quote.findById(id).lean<LeanQuote>();
  return doc ? serialize(doc) : null;
}

/* ─── Escrita ───────────────────────────────────────────── */

export async function createQuote(input: QuoteInput): Promise<ActionResult<{ id: string }>> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    await dbConnect();
    const d = parsed.data;
    const quote = await Quote.create({
      code: await nextCode(),
      clientName: d.clientName,
      client: d.clientId || undefined,
      clientPhone: d.clientPhone,
      clientEmail: d.clientEmail || undefined,
      items: d.items,
      status: "draft",
      validUntil: d.validUntil ? new Date(d.validUntil) : undefined,
      notes: d.notes,
    });
    revalidatePath("/admin/orcamentos");
    return { ok: true, data: { id: String(quote._id) } };
  } catch (err) {
    console.error("createQuote:", err);
    return { ok: false, error: "Erro ao criar orçamento." };
  }
}

export async function updateQuote(id: string, input: QuoteInput): Promise<ActionResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    await dbConnect();
    const d = parsed.data;
    const quote = await Quote.findById(id);
    if (!quote) return { ok: false, error: "Orçamento não encontrado." };
    quote.set({
      clientName: d.clientName,
      client: d.clientId || undefined,
      clientPhone: d.clientPhone,
      clientEmail: d.clientEmail || undefined,
      items: d.items,
      validUntil: d.validUntil ? new Date(d.validUntil) : undefined,
      notes: d.notes,
    });
    await quote.save(); // pre-save recalcula total
    revalidatePath(`/admin/orcamentos/${id}`);
    revalidatePath("/admin/orcamentos");
    return { ok: true };
  } catch (err) {
    console.error("updateQuote:", err);
    return { ok: false, error: "Erro ao atualizar orçamento." };
  }
}

export async function setQuoteStatus(id: string, status: QuoteStatus): Promise<ActionResult> {
  if (!QUOTE_STATUS.includes(status)) return { ok: false, error: "Status inválido." };
  try {
    await dbConnect();
    await Quote.findByIdAndUpdate(id, { status });
    revalidatePath(`/admin/orcamentos/${id}`);
    revalidatePath("/admin/orcamentos");
    return { ok: true };
  } catch (err) {
    console.error("setQuoteStatus:", err);
    return { ok: false, error: "Erro ao alterar status." };
  }
}

export async function duplicateQuote(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await dbConnect();
    const src = await Quote.findById(id).lean<LeanQuote>();
    if (!src) return { ok: false, error: "Orçamento não encontrado." };
    const copy = await Quote.create({
      code: await nextCode(),
      clientName: src.clientName,
      clientPhone: src.clientPhone,
      clientEmail: src.clientEmail,
      items: src.items,
      status: "draft",
      notes: src.notes,
    });
    revalidatePath("/admin/orcamentos");
    return { ok: true, data: { id: String(copy._id) } };
  } catch (err) {
    console.error("duplicateQuote:", err);
    return { ok: false, error: "Erro ao duplicar." };
  }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Quote.findByIdAndDelete(id);
    revalidatePath("/admin/orcamentos");
    return { ok: true };
  } catch (err) {
    console.error("deleteQuote:", err);
    return { ok: false, error: "Erro ao excluir." };
  }
}

/* ─── Envio por e-mail (Resend REST, sem SDK) ───────────── */

export async function sendQuoteByEmail(id: string, to?: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const q = await Quote.findById(id).lean<LeanQuote>();
    if (!q) return { ok: false, error: "Orçamento não encontrado." };
    const recipient = to || q.clientEmail;
    if (!recipient) return { ok: false, error: "Cliente sem e-mail cadastrado." };

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? "OWL PRINT <orcamentos@owlprint.com.br>";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = `${appUrl}/orcamentos/${id}/imprimir`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#3D2B1F">
        <h2 style="color:#5C3D2E">Orçamento ${q.code} — OWL PRINT</h2>
        <p>Olá ${q.clientName}, segue seu orçamento personalizado.</p>
        <p><strong>Total: R$ ${(q.total ?? 0).toFixed(2).replace(".", ",")}</strong></p>
        <p><a href="${link}" style="color:#C9A876">Visualizar / baixar PDF</a></p>
      </div>`;

    if (apiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: recipient, subject: `Orçamento ${q.code} — OWL PRINT`, html }),
      });
      if (!res.ok) return { ok: false, error: "Falha no provedor de e-mail." };
    } else {
      console.warn("[email] RESEND_API_KEY ausente — envio simulado para", recipient);
    }

    await Quote.findByIdAndUpdate(id, { status: "sent" });
    revalidatePath(`/admin/orcamentos/${id}`);
    return { ok: true };
  } catch (err) {
    console.error("sendQuoteByEmail:", err);
    return { ok: false, error: "Erro ao enviar e-mail." };
  }
}

/* ─── Link de WhatsApp + marca como enviado ─────────────── */

export async function buildWhatsAppLink(id: string): Promise<ActionResult<{ url: string }>> {
  try {
    await dbConnect();
    const q = await Quote.findById(id).lean<LeanQuote>();
    if (!q) return { ok: false, error: "Orçamento não encontrado." };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = `${appUrl}/orcamentos/${id}/imprimir`;
    const total = (q.total ?? 0).toFixed(2).replace(".", ",");
    const msg = `Olá ${q.clientName}! Segue o orçamento ${q.code} da OWL PRINT.\nTotal: R$ ${total}\nDetalhes: ${link}`;
    const phone = (q.clientPhone ?? "").replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    await Quote.findByIdAndUpdate(id, { status: "sent" });
    revalidatePath(`/admin/orcamentos/${id}`);
    return { ok: true, data: { url } };
  } catch (err) {
    console.error("buildWhatsAppLink:", err);
    return { ok: false, error: "Erro ao gerar link." };
  }
}
