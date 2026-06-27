"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Calendar, Loader2 } from "lucide-react";
import { scheduleCampaign } from "@/actions/campaign-queue";
import { type TemplateDTO } from "@/actions/communications";
import { LEAD_STATUS, LEAD_STATUS_LABEL } from "@/types";

export function NovaCampanhaForm({ templates }: { templates: TemplateDTO[] }) {
  const router = useRouter();
  const ativos = templates.filter((t) => t.active);

  const [nome, setNome] = useState("");
  const [modo, setModo] = useState<"status" | "numeros">("status");
  const [targetStatus, setTargetStatus] = useState<string>(LEAD_STATUS[0] ?? "");
  const [numerosTxt, setNumerosTxt] = useState("");
  const [templateId, setTemplateId] = useState(ativos[0]?.id ?? "");
  const [quando, setQuando] = useState<"agora" | "agendar">("agora");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  const numeros = numerosTxt.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean);
  const destinoOk = modo === "status" ? Boolean(targetStatus) : numeros.length > 0;
  const agendamentoOk = quando === "agora" || (data && hora);
  const podeEnviar = nome.trim() && templateId && destinoOk && agendamentoOk;

  function enviar() {
    setErro("");
    let scheduledFor: string | undefined;
    if (quando === "agendar" && data && hora) {
      scheduledFor = new Date(`${data}T${hora}`).toISOString();
    }
    startTransition(async () => {
      const res = await scheduleCampaign({
        name: nome,
        templateId,
        targetStatus: modo === "status" ? targetStatus : undefined,
        manualPhones: modo === "numeros" ? numeros : undefined,
        scheduledFor,
      });
      if (res.ok) {
        // Vai direto para a tela de acompanhamento ao vivo.
        router.push(`/admin/comunicacoes/campanhas/${res.data.campaignId}`);
      } else {
        setErro(res.error);
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
        <button onClick={() => setModo("status")}
          className={`rounded-md border px-3 py-2 text-sm ${modo === "status" ? "border-leather bg-cream font-medium text-leather" : "border-premium/20 text-leather/60"}`}>
          Por status do lead
        </button>
        <button onClick={() => setModo("numeros")}
          className={`rounded-md border px-3 py-2 text-sm ${modo === "numeros" ? "border-leather bg-cream font-medium text-leather" : "border-premium/20 text-leather/60"}`}>
          Digitar números
        </button>
      </div>

      {modo === "status" ? (
        <select value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)}
          className="mb-3 w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm">
          {LEAD_STATUS.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABEL[s] ?? s}</option>
          ))}
        </select>
      ) : (
        <>
          <textarea value={numerosTxt} onChange={(e) => setNumerosTxt(e.target.value)} rows={3}
            placeholder={"5511999990000\n5521988881234"}
            className="w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm" />
          <p className="mb-3 mt-1 text-xs text-leather/60">{numeros.length} número(s) reconhecido(s)</p>
        </>
      )}

      <label className="block text-xs font-medium text-leather/70">Modelo</label>
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
        className="mt-1 mb-3 w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm">
        {ativos.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <button onClick={() => setQuando("agora")}
          className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${quando === "agora" ? "border-leather bg-cream font-medium text-leather" : "border-premium/20 text-leather/60"}`}>
          <Send className="h-4 w-4" /> Enviar agora
        </button>
        <button onClick={() => setQuando("agendar")}
          className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${quando === "agendar" ? "border-leather bg-cream font-medium text-leather" : "border-premium/20 text-leather/60"}`}>
          <Calendar className="h-4 w-4" /> Agendar
        </button>
      </div>

      {quando === "agendar" && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <input type="date" value={data} onChange={(e) => setData(e.target.value)}
            className="rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm" />
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)}
            className="rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm" />
        </div>
      )}

      {erro && <p className="mb-3 text-xs text-burgundy">{erro}</p>}

      <button onClick={enviar} disabled={pending || !podeEnviar}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Preparando…" : quando === "agora" ? "Criar e enviar" : "Agendar campanha"}
      </button>
      <p className="mt-2 text-xs text-leather/50">
        Os envios são processados em fila pelo agendador (a cada minuto), sem travar o site — funciona para listas grandes.
      </p>
    </div>
  );
}
