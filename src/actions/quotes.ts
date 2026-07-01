"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Quote } from "@/models/Quote";
import { QUOTE_STATUS, type QuoteStatus } from "@/types";
import { quoteSchema } from "@/lib/schemas";
import { sendMail } from "@/lib/email";
import { uploadImage } from "@/lib/cloudinary";
import type { OsVendas } from "@/lib/vendas-options";

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
  vendas: OsVendas | null; // OS do Sistema de Vendas OWL PRINT
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
  vendas?: OsVendas;
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
    vendas: q.vendas ? (JSON.parse(JSON.stringify(q.vendas)) as OsVendas) : null,
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
      vendas: d.vendas ?? undefined,
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
      vendas: d.vendas ?? undefined,
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
      vendas: src.vendas ?? undefined, // copia a OS completa (Sistema de Vendas)
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

/* ─── Envio por e-mail (SMTP — HostGator) ───────────────── */

export async function sendQuoteByEmail(id: string, to?: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const q = await Quote.findById(id).lean<LeanQuote>();
    if (!q) return { ok: false, error: "Orçamento não encontrado." };
    const recipient = to || q.clientEmail;
    if (!recipient) return { ok: false, error: "Cliente sem e-mail cadastrado." };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = `${appUrl}/orcamentos/${id}/imprimir`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#3D2B1F">
        <h2 style="color:#5C3D2E">Orçamento ${q.code} — OWL PRINT</h2>
        <p>Olá ${q.clientName}, segue seu orçamento personalizado.</p>
        <p><strong>Total: R$ ${(q.total ?? 0).toFixed(2).replace(".", ",")}</strong></p>
        <p><a href="${link}" style="color:#C9A876">Visualizar / baixar PDF</a></p>
      </div>`;

    const sent = await sendMail({
      to: recipient,
      subject: `Orçamento ${q.code} — OWL PRINT`,
      html,
    });
    if (!sent.ok) return { ok: false, error: sent.error };

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

/* ══════════════════════════════════════════════════════════════════
   SISTEMA DE VENDAS OWL PRINT — actions da OS
   ══════════════════════════════════════════════════════════════════ */

/* ─── Upload de mockup (Cloudinary) ──────────────────────────
   Substitui o "uploadMockup" do Google Apps Script do HTML.
   Segurança: aceita apenas data-URLs de imagem (png/jpeg/webp),
   com limite de ~4MB por arquivo e chave validada. */

const MOCKUP_KEY_RE = /^(c|i|j|p|d)[12]$/;
const DATAURL_RE = /^data:image\/(png|jpe?g|webp);base64,/i;
const MAX_MOCKUP_BASE64 = 4.5 * 1024 * 1024; // ~4,5MB codificado

export async function uploadOsMockup(
  key: string,
  dataUrl: string
): Promise<ActionResult<{ key: string; url: string; publicId: string }>> {
  if (!MOCKUP_KEY_RE.test(key)) return { ok: false, error: "Chave de mockup inválida." };
  if (!DATAURL_RE.test(dataUrl)) return { ok: false, error: "Formato de imagem não permitido." };
  if (dataUrl.length > MAX_MOCKUP_BASE64)
    return { ok: false, error: "Imagem muito grande (máx. ~3MB). Reduza e tente novamente." };

  try {
    const up = await uploadImage(dataUrl, "owl-print/os-mockups");
    return { ok: true, data: { key, url: up.url, publicId: up.publicId } };
  } catch (err) {
    console.error("uploadOsMockup:", err);
    return { ok: false, error: "Erro ao enviar imagem." };
  }
}

/* ─── Busca de histórico do cliente ──────────────────────────
   Substitui (e melhora) o "buscarHistorico" do HTML: em vez de um
   POST no-cors sem retorno, aqui a busca é real — retorna a última
   OS salva para o mesmo nome de cliente, pronta para pré-preencher. */

export async function getClientOsHistory(clientName: string): Promise<
  ActionResult<{
    found: boolean;
    code?: string;
    createdAt?: string;
    vendas?: OsVendas;
    items?: QuoteItemDTO[];
  }>
> {
  const name = String(clientName ?? "").trim();
  if (name.length < 2) return { ok: true, data: { found: false } };

  try {
    await dbConnect();
    // Escapa caracteres de regex para busca segura por nome (case-insensitive)
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const doc = await Quote.findOne({
      clientName: { $regex: `^${escaped}$`, $options: "i" },
      vendas: { $exists: true },
    })
      .sort({ createdAt: -1 })
      .lean<LeanQuote>();

    if (!doc) return { ok: true, data: { found: false } };
    const dto = serialize(doc);
    return {
      ok: true,
      data: {
        found: true,
        code: dto.code,
        createdAt: dto.createdAt ?? undefined,
        vendas: dto.vendas ?? undefined,
        items: dto.items,
      },
    };
  } catch (err) {
    console.error("getClientOsHistory:", err);
    return { ok: false, error: "Erro ao buscar histórico." };
  }
}
