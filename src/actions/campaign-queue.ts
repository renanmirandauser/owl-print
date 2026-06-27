"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Template } from "@/models/Template";
import { Campaign } from "@/models/Campaign";
import { CommunicationLog } from "@/models/CommunicationLog";
import { normalizarTelefone, zapiConfigurado } from "@/lib/zapi";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

type LeanTemplate = { _id: unknown; name: string; body: string };
type LeanClient = { _id: unknown; name?: string; company?: string; whatsapp?: string; phone?: string };

function render(body: string, vars: { nome?: string; empresa?: string }): string {
  return body
    .replace(/\{\{\s*nome\s*\}\}/gi, vars.nome ?? "")
    .replace(/\{\{\s*empresa\s*\}\}/gi, vars.empresa ?? "");
}

/* ─── Agendar / enfileirar uma campanha ────────────────────── */

interface ScheduleInput {
  name: string;
  templateId: string;
  targetStatus?: string;
  manualPhones?: string[];
  scheduledFor?: string; // ISO. Vazio = enviar assim que o próximo ciclo rodar.
}

export async function scheduleCampaign(
  input: ScheduleInput
): Promise<ActionResult<{ campaignId: string; total: number; scheduled: boolean }>> {
  if (!zapiConfigurado()) {
    return { ok: false, error: "Z-API não configurada. Preencha as variáveis ZAPI_* primeiro." };
  }
  if (!input.name?.trim() || !input.templateId) {
    return { ok: false, error: "Informe o nome da campanha e o modelo." };
  }

  try {
    await dbConnect();
    const tpl = (await Template.findById(input.templateId).lean()) as unknown as LeanTemplate | null;
    if (!tpl) return { ok: false, error: "Modelo não encontrado." };

    // Monta destinatários.
    type Alvo = { id?: string; nome?: string; empresa?: string; phone: string };
    let alvos: Alvo[] = [];

    if (input.targetStatus) {
      const clients = (await Client.find({ status: input.targetStatus }).lean()) as unknown as LeanClient[];
      alvos = clients
        .map((c) => ({ id: String(c._id), nome: c.name, empresa: c.company, phone: c.whatsapp || c.phone || "" }))
        .filter((a) => normalizarTelefone(a.phone));
    } else if (input.manualPhones?.length) {
      alvos = input.manualPhones.map((p) => ({ phone: p })).filter((a) => normalizarTelefone(a.phone));
    }

    if (alvos.length === 0) {
      return { ok: false, error: "Nenhum destinatário com WhatsApp válido foi encontrado." };
    }

    const when = input.scheduledFor ? new Date(input.scheduledFor) : new Date();
    const isFuture = when.getTime() > Date.now() + 5000;

    const campaign = await Campaign.create({
      name: input.name.trim(),
      templateId: input.templateId,
      templateName: tpl.name,
      targetStatus: input.targetStatus,
      manualPhones: input.manualPhones,
      total: alvos.length,
      status: isFuture ? "scheduled" : "sending",
      scheduledFor: when,
    });

    // Enfileira: cria um log "queued" por destinatário (mensagem já renderizada).
    await CommunicationLog.insertMany(
      alvos.map((a) => ({
        clientId: a.id,
        campaignId: campaign._id,
        templateName: tpl.name,
        phone: normalizarTelefone(a.phone),
        contactName: a.nome,
        message: render(tpl.body, { nome: a.nome, empresa: a.empresa }),
        status: "queued",
      }))
    );

    revalidatePath("/admin/comunicacoes/campanhas");
    return { ok: true, data: { campaignId: String(campaign._id), total: alvos.length, scheduled: isFuture } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao agendar campanha." };
  }
}

/* ─── Progresso ao vivo (para a tela de acompanhamento) ────── */

export interface RecipientDTO {
  name: string;
  phone: string;
  status: string;
}
export interface CampaignProgressDTO {
  id: string;
  name: string;
  templateName: string;
  status: string;
  scheduledFor: string | null;
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  recipients: RecipientDTO[];
}

export async function getCampaignProgress(campaignId: string): Promise<CampaignProgressDTO | null> {
  await dbConnect();
  const c = (await Campaign.findById(campaignId).lean()) as unknown as
    | { _id: unknown; name?: string; templateName?: string; status?: string; scheduledFor?: Date; total?: number }
    | null;
  if (!c) return null;

  const count = (status: string | string[]) =>
    CommunicationLog.countDocuments({
      campaignId,
      status: Array.isArray(status) ? { $in: status } : status,
    });

  const [queued, sending, sent, delivered, read, failed] = await Promise.all([
    count("queued"),
    count("sending"),
    count("sent"),
    count("delivered"),
    count("read"),
    count("failed"),
  ]);

  const logs = (await CommunicationLog.find({ campaignId })
    .sort({ createdAt: 1 })
    .limit(60)
    .lean()) as unknown as { contactName?: string; phone?: string; status?: string }[];

  return {
    id: String(c._id),
    name: c.name ?? "",
    templateName: c.templateName ?? "",
    status: c.status ?? "draft",
    scheduledFor: c.scheduledFor ? new Date(c.scheduledFor).toISOString() : null,
    total: c.total ?? 0,
    // "sent" exibido = já saíram (sent + delivered + read).
    queued: queued + sending,
    sent: sent + delivered + read,
    delivered: delivered + read,
    read,
    failed,
    recipients: logs.map((l) => ({
      name: l.contactName ?? "—",
      phone: l.phone ?? "",
      status: l.status ?? "queued",
    })),
  };
}
