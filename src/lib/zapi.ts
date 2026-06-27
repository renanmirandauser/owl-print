import "server-only";

/**
 * Cliente da Z-API (envio de WhatsApp).
 *
 * Lê as credenciais do ambiente (.env.local / Vercel). NENHUMA credencial
 * aparece no front-end — este arquivo só roda no servidor ("server-only").
 *
 * Variáveis necessárias:
 *   ZAPI_INSTANCE_ID      → ID da instância (Z-API painel)
 *   ZAPI_INSTANCE_TOKEN   → token da instância
 *   ZAPI_CLIENT_TOKEN     → "Token de Segurança da Conta" (header Client-Token)
 */

const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const INSTANCE_TOKEN = process.env.ZAPI_INSTANCE_TOKEN;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

export function zapiConfigurado(): boolean {
  return Boolean(INSTANCE_ID && INSTANCE_TOKEN);
}

function baseUrl(): string {
  return `https://api.z-api.io/instances/${INSTANCE_ID}/token/${INSTANCE_TOKEN}`;
}

/** Normaliza o telefone para o formato da Z-API: só dígitos, com DDI 55. */
export function normalizarTelefone(raw: string): string | null {
  let d = (raw || "").replace(/\D/g, "");
  if (!d) return null;
  // Se vier sem DDI (10 ou 11 dígitos), assume Brasil (55).
  if (d.length === 10 || d.length === 11) d = "55" + d;
  // Validação mínima: 55 + DDD(2) + número(8 ou 9) = 12 ou 13 dígitos.
  if (d.length < 12 || d.length > 13) return null;
  return d;
}

export type ZapiResult =
  | { ok: true; messageId: string; zaapId?: string }
  | { ok: false; error: string };

/**
 * Envia uma mensagem de texto simples.
 * @param phone  telefone do destinatário (qualquer formato; é normalizado)
 * @param message texto já com as variáveis substituídas
 * @param delaySeconds atraso 1–15s antes do envio (útil em massa). Opcional.
 */
export async function enviarTexto(
  phone: string,
  message: string,
  delaySeconds?: number
): Promise<ZapiResult> {
  if (!zapiConfigurado()) {
    return { ok: false, error: "Z-API não configurada (verifique as variáveis ZAPI_*)." };
  }
  const telefone = normalizarTelefone(phone);
  if (!telefone) return { ok: false, error: `Telefone inválido: "${phone}"` };

  type Body = { phone: string; message: string; delayMessage?: number };
  const body: Body = { phone: telefone, message };
  if (delaySeconds && delaySeconds >= 1 && delaySeconds <= 15) {
    body.delayMessage = Math.round(delaySeconds);
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (CLIENT_TOKEN) headers["Client-Token"] = CLIENT_TOKEN;

    const res = await fetch(`${baseUrl()}/send-text`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      // Evita cache em ambiente serverless.
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
      zaapId?: string;
      error?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.error || data.message || `Z-API retornou HTTP ${res.status}`,
      };
    }
    if (!data.messageId) {
      return { ok: false, error: "Z-API não retornou messageId (verifique a conexão da instância)." };
    }
    return { ok: true, messageId: data.messageId, zaapId: data.zaapId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha de rede ao chamar a Z-API." };
  }
}
