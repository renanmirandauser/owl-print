"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, Loader2, X, CheckCircle2 } from "lucide-react";
import { sendWhatsAppToClient, type TemplateDTO } from "@/actions/communications";

/**
 * Botão "Enviar WhatsApp" para a ficha do cliente.
 * Abre um painel para escolher o modelo e dispara pela Z-API (server action).
 *
 * Uso na página do cliente (server component):
 *   const templates = await listTemplates();
 *   <SendWhatsAppButton clientId={client.id} templates={templates} />
 */
export function SendWhatsAppButton({
  clientId,
  templates,
}: {
  clientId: string;
  templates: TemplateDTO[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const ativos = templates.filter((t) => t.active);
  const selecionado = ativos.find((t) => t.id === templateId);

  function enviar() {
    setMsg(null);
    startTransition(async () => {
      const res = await sendWhatsAppToClient(clientId, templateId);
      if (res.ok) {
        setMsg({ ok: true, text: "Mensagem enviada!" });
        router.refresh(); // atualiza a timeline do cliente
        setTimeout(() => setOpen(false), 1200);
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-premium/20 px-3 py-2 text-sm text-leather hover:bg-cream"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600" /> Enviar WhatsApp
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-80 rounded-lg border border-premium/20 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-leather">Enviar mensagem</span>
            <button onClick={() => setOpen(false)} className="text-leather/50 hover:text-leather">
              <X className="h-4 w-4" />
            </button>
          </div>

          {ativos.length === 0 ? (
            <p className="text-sm text-leather/70">
              Nenhum modelo ativo. Crie um em <strong>Comunicações → Modelos</strong>.
            </p>
          ) : (
            <>
              <label className="block text-xs font-medium text-leather/70">Modelo</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="mt-1 w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm"
              >
                {ativos.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {selecionado && (
                <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 p-2 text-xs text-leather">
                  {selecionado.body}
                </div>
              )}

              {msg && (
                <div className={`mt-3 flex items-center gap-1.5 text-xs ${msg.ok ? "text-emerald-700" : "text-burgundy"}`}>
                  {msg.ok && <CheckCircle2 className="h-3.5 w-3.5" />} {msg.text}
                </div>
              )}

              <button
                onClick={enviar}
                disabled={pending || !templateId}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {pending ? "Enviando…" : "Enviar agora"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
