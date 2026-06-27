"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { createAndSendCampaign, type TemplateDTO } from "@/actions/communications";
import { LEAD_STATUS, LEAD_STATUS_LABEL } from "@/types";

export function NovaCampanhaForm({ templates }: { templates: TemplateDTO[] }) {
  const router = useRouter();
  const ativos = templates.filter((t) => t.active);

  const [nome, setNome] = useState("");
  const [modo, setModo] = useState<"status" | "numeros">("status");
  const [targetStatus, setTargetStatus] = useState<string>(LEAD_STATUS[0] ?? "");
  const [numerosTxt, setNumerosTxt] = useState("");
  const [templateId, setTemplateId] = useState(ativos[0]?.id ?? "");
  const [delay, setDelay] = useState(2);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const numeros = numerosTxt.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
  const podeEnviar = nome.trim() && templateId && (modo === "status" ? targetStatus : numeros.length > 0);

  function enviar() {
    setResult(null);
    startTransition(async () => {
      const res = await createAndSendCampaign({
        name: nome,
        templateId,
        targetStatus: modo === "status" ? targetStatus : undefined,
        manualPhones: modo === "numeros" ? numeros : undefined,
        delaySeconds: delay,
      });
      if (res.ok) {
        setResult({ ok: true, text: `Campanha enviada: ${res.data.sent} ok, ${res.data.failed} falha(s).` });
        setNome("");
        router.refresh();
      } else {
        setResult({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="rounded-lg border border-premium/20 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-leather">Nova campanha</h3>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da campanha"
        className="mb-3 w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm"
      />

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setModo("status")}
          className={`rounded-md border px-3 py-2 text-sm ${modo === "status" ? "border-leather bg-cream font-medium text-leather" : "border-premium/20 text-leather/60"}`}
        >
          Por status do lead
        </button>
        <button
          onClick={() => setModo("numeros")}
          className={`rounded-md border px-3 py-2 text-sm ${modo === "numeros" ? "border-leather bg-cream font-medium text-leather" : "border-premium/20 text-leather/60"}`}
        >
          Digitar números
        </button>
      </div>

      {modo === "status" ? (
        <select
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value)}
          className="mb-3 w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm"
        >
          {LEAD_STATUS.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABEL[s] ?? s}</option>
          ))}
        </select>
      ) : (
        <>
          <textarea
            value={numerosTxt}
            onChange={(e) => setNumerosTxt(e.target.value)}
            rows={3}
            placeholder={"5511999990000\n5521988881234"}
            className="w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm"
          />
          <p className="mb-3 mt-1 text-xs text-leather/60">{numeros.length} número(s) reconhecido(s)</p>
        </>
      )}

      <label className="block text-xs font-medium text-leather/70">Modelo</label>
      <select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        className="mt-1 mb-3 w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm"
      >
        {ativos.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <label className="block text-xs font-medium text-leather/70">Intervalo entre envios: {delay}s</label>
      <input
        type="range" min={1} max={15} value={delay}
        onChange={(e) => setDelay(Number(e.target.value))}
        className="mb-3 w-full"
      />

      {result && (
        <div className={`mb-3 flex items-center gap-1.5 text-sm ${result.ok ? "text-emerald-700" : "text-burgundy"}`}>
          {result.ok && <CheckCircle2 className="h-4 w-4" />} {result.text}
        </div>
      )}

      <button
        onClick={enviar}
        disabled={pending || !podeEnviar}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Enviando…" : "Criar e enviar"}
      </button>
      <p className="mt-2 text-xs text-leather/50">
        Dica: para listas grandes, envie em blocos. Veja a nota sobre fila/agendamento no manual.
      </p>
    </div>
  );
}
