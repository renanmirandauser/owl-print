import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { CommunicationLog } from "@/models/CommunicationLog";

/**
 * Recebe os callbacks de status da Z-API (entregue / lido).
 * Configure esta URL no painel da Z-API em "Ao enviar / Status da mensagem".
 *   Ex.: https://SEU-DOMINIO/api/whatsapp/webhook
 *
 * A Z-API costuma enviar algo como:
 *   { type: "MessageStatusCallback", status: "SENT"|"RECEIVED"|"READ"|"PLAYED",
 *     ids: ["<messageId>"], phone: "...", instanceId: "..." }
 * Lemos de forma tolerante (nomes de campos podem variar por versão).
 */

function mapStatus(raw?: string): "sent" | "delivered" | "read" | null {
  const s = (raw || "").toUpperCase();
  if (s === "SENT") return "sent";
  if (s === "RECEIVED" || s === "DELIVERED") return "delivered";
  if (s === "READ" || s === "PLAYED") return "read";
  return null;
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const status = mapStatus(payload.status as string | undefined);
    if (!status) return NextResponse.json({ ignored: true });

    // Coleta os messageIds (pode vir como "ids", "messageId" ou "id").
    const ids: string[] = [];
    if (Array.isArray(payload.ids)) ids.push(...(payload.ids as string[]));
    if (typeof payload.messageId === "string") ids.push(payload.messageId);
    if (typeof payload.id === "string") ids.push(payload.id);
    if (ids.length === 0) return NextResponse.json({ ignored: true });

    await dbConnect();

    // Atualiza só "para frente" (não volta de "read" para "sent").
    const ordem = { queued: 0, sent: 1, delivered: 2, read: 3, failed: 0 } as Record<string, number>;
    for (const id of ids) {
      const log = await CommunicationLog.findOne({ messageId: id });
      if (!log) continue;
      if ((ordem[status] ?? 0) > (ordem[log.status as string] ?? 0)) {
        log.status = status;
        await log.save();
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Sempre responde 200 para a Z-API não ficar reenviando indefinidamente.
    return NextResponse.json({ ok: false });
  }
}

// A Z-API pode validar a URL com um GET — respondemos 200.
export async function GET() {
  return NextResponse.json({ ok: true, service: "owl-whatsapp-webhook" });
}
