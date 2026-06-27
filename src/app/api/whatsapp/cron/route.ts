import { NextResponse } from "next/server";
import { processDueCampaigns } from "@/lib/process-queue";

/**
 * Rota de processamento da fila de WhatsApp.
 *
 * Acione-a a cada minuto com um agendador externo gratuito (ex.: cron-job.org),
 * porque o cron interno da Vercel no plano grátis só roda 1x/dia.
 *
 *   URL:    https://SEU-DOMINIO/api/whatsapp/cron?secret=SEU_CRON_SECRET
 *   Método: GET (ou POST)
 *
 * Proteja com a variável de ambiente CRON_SECRET (string aleatória).
 * Aceita o segredo via ?secret= OU no header Authorization: Bearer <segredo>.
 */

function autorizado(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // sem segredo configurado, libera (mas configure!)
  const url = new URL(req.url);
  const qs = url.searchParams.get("secret");
  const auth = req.headers.get("authorization");
  return qs === secret || auth === `Bearer ${secret}`;
}

async function handle(req: Request) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const batch = Number(url.searchParams.get("batch")) || 10;
  const r = await processDueCampaigns(batch);
  return NextResponse.json({ ok: true, ...r, at: new Date().toISOString() });
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
