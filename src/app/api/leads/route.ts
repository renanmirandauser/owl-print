import { NextResponse } from "next/server";
import { createLead } from "@/actions/leads";
import { leadSchema } from "@/lib/schemas";

/**
 * Limite de envios simples, em memória (best-effort).
 * Observação honesta: em ambiente serverless (Vercel) as instâncias são
 * reiniciadas e podem coexistir várias, então isto NÃO é um limite global
 * perfeito — mas já barra spam repetido de uma mesma origem. Para um limite
 * robusto, usar um serviço externo (ex.: Upstash Redis).
 */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQ = 5; // por janela, por IP
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  cur.count += 1;
  return cur.count > MAX_REQ;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    // Guarda contra payloads gigantes
    const raw = await req.text();
    if (raw.length > 10_000) {
      return NextResponse.json(
        { ok: false, error: "Conteúdo muito grande." },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
    }

    // Honeypot anti-bot: campo oculto "website". Se vier preenchido, é robô.
    // Fingimos sucesso para não dar pistas ao bot, mas NÃO criamos o lead.
    const hp = (body as Record<string, unknown> | null)?.website;
    if (typeof hp === "string" && hp.trim() !== "") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const result = await createLead(parsed.data);
    return NextResponse.json(result, { status: result.ok ? 201 : 500 });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro inesperado" }, { status: 400 });
  }
}
