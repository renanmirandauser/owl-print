"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Template } from "@/models/Template";
import { Campaign } from "@/models/Campaign";
import { CommunicationLog } from "@/models/CommunicationLog";
import { enviarTexto, normalizarTelefone, zapiConfigurado } from "@/lib/zapi";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

/* ─── Helpers ──────────────────────────────────────────────── */

/** Substitui {{nome}}, {{empresa}}, {{numero}} no corpo do modelo. */
function render(body: string, vars: { nome?: string; empresa?: string; numero?: string }): string {
  return body
    .replace(/\{\{\s*nome\s*\}\}/gi, vars.nome ?? "")
    .replace(/\{\{\s*empresa\s*\}\}/gi, vars.empresa ?? "")
    .replace(/\{\{\s*numero\s*\}\}/gi, vars.numero ?? "");
}

/* ─── Templates (modelos) ──────────────────────────────────── */

export interface TemplateDTO {
  id: string;
  name: string;
  body: string;
  active: boolean;
}

export async function listTemplates(): Promise<TemplateDTO[]> {
  await dbConnect();
  const docs = await Template.find().sort({ createdAt: -1 }).lean();
  return docs.map((t) => ({
    id: String((t as { _id: unknown })._id),
    name: (t as { name: string }).name,
    body: (t as { body: string }).body,
    active: (t as { active?: boolean }).active ?? true,
  }));
}

export async function createTemplate(input: { name: string; body: string }): Promise<ActionResult> {
  if (!input.name?.trim() || !input.body?.trim()) {
    return { ok: false, error: "Informe nome e corpo do modelo." };
  }
  try {
    await dbConnect();
    await Template.create({ name: input.name.trim(), body: input.body.trim(), active: true });
    revalidatePath("/admin/comunicacoes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao salvar modelo." };
  }
}

/* ─── Envio individual (a partir da ficha do cliente) ──────── */

export async function sendWhatsAppToClient(
  clientId: string,
  templateId: string,
  numero?: string
): Promise<ActionResult> {
  if (!zapiConfigurado()) {
    return { ok: false, error: "Z-API não configurada. Preencha as variáveis ZAPI_* e tente de novo." };
  }
  try {
    await dbConnect();
    const client = await Client.findById(clientId).lean();
    if (!client) return { ok: false, error: "Cliente não encontrado." };

    const c = client as { name?: string; company?: string; whatsapp?: string; phone?: string };
    const destino = c.whatsapp || c.phone || "";
    if (!normalizarTelefone(destino)) {
      return { ok: false, error: "Este cliente não tem um WhatsApp válido cadastrado." };
    }

    const tpl = await Template.findById(templateId).lean();
    if (!tpl) return { ok: false, error: "Modelo não encontrado." };
    const body = (tpl as { body: string }).body;
    const templateName = (tpl as { name: string }).name;

    const message = render(body, { nome: c.name, empresa: c.company, numero });
    const result = await enviarTexto(destino, message);

    // Registra no log de comunicação.
    await CommunicationLog.create({
      clientId,
      templateName,
      phone: normalizarTelefone(destino),
      contactName: c.name,
      message,
      messageId: result.ok ? result.messageId : undefined,
      zaapId: result.ok ? result.zaapId : undefined,
      status: result.ok ? "sent" : "failed",
      error: result.ok ? undefined : result.error,
    });

    // Registra na timeline do cliente (tipo "whatsapp" já existe no schema).
    await Client.findByIdAndUpdate(clientId, {
      $push: {
        activities: {
          type: "whatsapp",
          content: result.ok
            ? `Enviado modelo "${templateName}"`
            : `Falha ao enviar "${templateName}": ${result.error}`,
          at: new Date(),
        },
      },
    });

    revalidatePath(`/admin/crm/${clientId}`);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao enviar." };
  }
}

/* ─── Campanha (envio em massa) ────────────────────────────── */

interface CampaignInput {
  name: string;
  templateId: string;
  targetStatus?: string; // envia para clientes com este status de lead
  manualPhones?: string[]; // OU lista de números avulsos
  delaySeconds?: number; // atraso entre envios (1–15), recomendado 2–4
}

export async function createAndSendCampaign(input: CampaignInput): Promise<ActionResult<{ campaignId: string; sent: number; failed: number }>> {
  if (!zapiConfigurado()) {
    return { ok: false, error: "Z-API não configurada. Preencha as variáveis ZAPI_* primeiro." };
  }
  if (!input.name?.trim() || !input.templateId) {
    return { ok: false, error: "Informe o nome da campanha e o modelo." };
  }

  try {
    await dbConnect();
    const tpl = await Template.findById(input.templateId).lean();
    if (!tpl) return { ok: false, error: "Modelo não encontrado." };
    const body = (tpl as { body: string }).body;
    const templateName = (tpl as { name: string }).name;

    // Monta a lista de destinatários.
    type Alvo = { id?: string; nome?: string; empresa?: string; phone: string };
    let alvos: Alvo[] = [];

    if (input.targetStatus) {
      const clients = await Client.find({ status: input.targetStatus }).lean();
      alvos = (clients as Array<{ _id: unknown; name?: string; company?: string; whatsapp?: string; phone?: string }>)
        .map((c) => ({ id: String(c._id), nome: c.name, empresa: c.company, phone: c.whatsapp || c.phone || "" }))
        .filter((a) => normalizarTelefone(a.phone));
    } else if (input.manualPhones?.length) {
      alvos = input.manualPhones
        .map((p) => ({ phone: p }))
        .filter((a) => normalizarTelefone(a.phone));
    }

    if (alvos.length === 0) {
      return { ok: false, error: "Nenhum destinatário com WhatsApp válido foi encontrado." };
    }

    const campaign = await Campaign.create({
      name: input.name.trim(),
      templateId: input.templateId,
      templateName,
      targetStatus: input.targetStatus,
      manualPhones: input.manualPhones,
      total: alvos.length,
      status: "sending",
    });

    let sent = 0;
    let failed = 0;
    const delay = input.delaySeconds && input.delaySeconds >= 1 && input.delaySeconds <= 15 ? input.delaySeconds : 2;

    // Envia em sequência. (Para listas grandes, ver nota sobre fila/cron no manual.)
    for (const a of alvos) {
      const message = render(body, { nome: a.nome, empresa: a.empresa });
      const r = await enviarTexto(a.phone, message, delay);
      await CommunicationLog.create({
        clientId: a.id,
        campaignId: campaign._id,
        templateName,
        phone: normalizarTelefone(a.phone),
        contactName: a.nome,
        message,
        messageId: r.ok ? r.messageId : undefined,
        zaapId: r.ok ? r.zaapId : undefined,
        status: r.ok ? "sent" : "failed",
        error: r.ok ? undefined : r.error,
      });
      if (r.ok) sent++;
      else failed++;
    }

    await Campaign.findByIdAndUpdate(campaign._id, {
      sent,
      failed,
      status: failed === alvos.length ? "failed" : "done",
    });

    revalidatePath("/admin/comunicacoes/campanhas");
    return { ok: true, data: { campaignId: String(campaign._id), sent, failed } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao criar campanha." };
  }
}

/* ─── Leitura (para as telas) ──────────────────────────────── */

export interface CampaignDTO {
  id: string;
  name: string;
  templateName: string;
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  status: string;
  createdAt: string | null;
}

export async function listCampaigns(): Promise<CampaignDTO[]> {
  await dbConnect();
  const docs = await Campaign.find().sort({ createdAt: -1 }).lean();
  return (docs as Array<Record<string, unknown>>).map((c) => ({
    id: String(c._id),
    name: String(c.name ?? ""),
    templateName: String(c.templateName ?? ""),
    total: Number(c.total ?? 0),
    sent: Number(c.sent ?? 0),
    delivered: Number(c.delivered ?? 0),
    read: Number(c.read ?? 0),
    failed: Number(c.failed ?? 0),
    status: String(c.status ?? "draft"),
    createdAt: c.createdAt ? new Date(c.createdAt as Date).toISOString() : null,
  }));
}
