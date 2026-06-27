import "server-only";
import { dbConnect } from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import { CommunicationLog } from "@/models/CommunicationLog";
import { enviarTexto } from "@/lib/zapi";

/**
 * Processa a fila de envios.
 * Chamado pela rota /api/whatsapp/cron (acionada por um agendador externo a cada minuto).
 *
 * É idempotente e seguro contra execuções duplicadas:
 * cada mensagem é "reivindicada" atomicamente (queued -> sending) antes de enviar,
 * então rodar duas vezes não envia a mesma mensagem duas vezes.
 */
export async function processDueCampaigns(batchSize = 10): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  await dbConnect();
  const now = new Date();

  // 1) Ativa campanhas agendadas cujo horário já chegou.
  await Campaign.updateMany(
    { status: "scheduled", scheduledFor: { $lte: now } },
    { $set: { status: "sending" } }
  );

  // 2) Envia um lote de mensagens da fila.
  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < batchSize; i++) {
    // Reivindica 1 mensagem atomicamente (evita envio duplicado).
    const log = (await CommunicationLog.findOneAndUpdate(
      { status: "queued" },
      { $set: { status: "sending" } },
      { new: true, sort: { createdAt: 1 } }
    ).lean()) as unknown as { _id: unknown; phone?: string; message?: string } | null;

    if (!log) break; // fila vazia

    const r = await enviarTexto(log.phone ?? "", log.message ?? "", 2);
    await CommunicationLog.findByIdAndUpdate(
      log._id,
      r.ok
        ? { $set: { status: "sent", messageId: r.messageId, zaapId: r.zaapId } }
        : { $set: { status: "failed", error: r.error } }
    );

    if (r.ok) sent++;
    else failed++;
    processed++;
  }

  // 3) Fecha campanhas "sending" que já não têm mais nada na fila.
  const sendingCampaigns = (await Campaign.find({ status: "sending" })
    .select("_id")
    .lean()) as unknown as { _id: unknown }[];

  for (const c of sendingCampaigns) {
    const pendentes = await CommunicationLog.countDocuments({
      campaignId: c._id,
      status: { $in: ["queued", "sending"] },
    });
    if (pendentes === 0) {
      const sentCount = await CommunicationLog.countDocuments({
        campaignId: c._id,
        status: { $in: ["sent", "delivered", "read"] },
      });
      const failedCount = await CommunicationLog.countDocuments({
        campaignId: c._id,
        status: "failed",
      });
      await Campaign.findByIdAndUpdate(c._id, {
        $set: {
          status: failedCount > 0 && sentCount === 0 ? "failed" : "done",
          sent: sentCount,
          failed: failedCount,
        },
      });
    }
  }

  return { processed, sent, failed };
}
