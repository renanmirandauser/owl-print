"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import {
  FileText,
  MessageCircle,
  Mail,
  Copy,
  Trash2,
  Pencil,
  Check,
  X,
  Send,
  Factory,
  Loader2,
} from "lucide-react";
import {
  setQuoteStatus,
  duplicateQuote,
  deleteQuote,
  sendQuoteByEmail,
  buildWhatsAppLink,
} from "@/actions/quotes";
import { createOrderFromQuote } from "@/actions/orders";
import type { QuoteStatus } from "@/types";

const btn =
  "inline-flex items-center gap-2 rounded-md border border-premium/20 px-3 py-2 text-sm " +
  "text-leather transition-colors hover:bg-cream disabled:opacity-50";

export function QuoteActions({ id, status }: { id: string; status: QuoteStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setMsg(res.error ?? "Erro");
      router.refresh();
    });
  }

  function whatsapp() {
    setMsg(null);
    startTransition(async () => {
      const res = await buildWhatsAppLink(id);
      if (!res.ok) return setMsg(res.error);
      window.open(res.data.url, "_blank", "noopener");
      router.refresh();
    });
  }

  function email() {
    const to = window.prompt("Enviar para qual e-mail? (deixe vazio para usar o do cliente)") ?? "";
    run(() => sendQuoteByEmail(id, to || undefined));
  }

  function remove() {
    if (!window.confirm("Excluir este orçamento? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const res = await deleteQuote(id);
      if (res.ok) router.push("/admin/orcamentos");
      else setMsg(res.error);
    });
  }

  function duplicate() {
    startTransition(async () => {
      const res = await duplicateQuote(id);
      if (res.ok) router.push(`/admin/orcamentos/${res.data.id}`);
      else setMsg(res.error);
    });
  }

  function generateOrder() {
    setMsg(null);
    startTransition(async () => {
      const res = await createOrderFromQuote(id);
      if (res.ok) router.push(`/admin/producao/${res.data.id}`);
      else setMsg(res.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <a className={btn} href={`/orcamentos/${id}/imprimir`} target="_blank" rel="noopener">
          <FileText className="h-4 w-4" /> Visualizar PDF
        </a>
        <button className={btn} onClick={whatsapp} disabled={pending}>
          <MessageCircle className="h-4 w-4 text-emerald-600" /> Enviar por WhatsApp
        </button>
        <button className={btn} onClick={email} disabled={pending}>
          <Mail className="h-4 w-4" /> Enviar por E-mail
        </button>
        <a className={btn} href={`/admin/orcamentos/${id}/editar`}>
          <Pencil className="h-4 w-4" /> Editar
        </a>
        <button className={btn} onClick={duplicate} disabled={pending}>
          <Copy className="h-4 w-4" /> Duplicar
        </button>
        <button className={btn} onClick={remove} disabled={pending}>
          <Trash2 className="h-4 w-4 text-burgundy" /> Excluir
        </button>
      </div>

      {/* Orçamento aprovado → produção */}
      {status === "approved" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <button
            onClick={generateOrder}
            disabled={pending}
            className="btn-gold !py-2 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Factory className="h-4 w-4" />}
            Gerar Pedido de Produção
          </button>
          <p className="mt-1 text-xs text-leather/50">
            Cria um pedido no Kanban com os itens deste orçamento.
          </p>
        </div>
      )}

      {/* Mudança de status */}
      <div className="flex flex-wrap items-center gap-2 border-t border-premium/10 pt-3">
        <span className="text-xs uppercase tracking-wider text-leather/50">Status:</span>
        {status === "draft" && (
          <button className={btn} onClick={() => run(() => setQuoteStatus(id, "sent"))} disabled={pending}>
            <Send className="h-4 w-4" /> Marcar como Enviado
          </button>
        )}
        {status !== "approved" && (
          <button
            className={btn}
            onClick={() => run(() => setQuoteStatus(id, "approved"))}
            disabled={pending}
          >
            <Check className="h-4 w-4 text-emerald-600" /> Aprovar
          </button>
        )}
        {status !== "rejected" && (
          <button
            className={btn}
            onClick={() => run(() => setQuoteStatus(id, "rejected"))}
            disabled={pending}
          >
            <X className="h-4 w-4 text-burgundy" /> Rejeitar
          </button>
        )}
        {pending && <Loader2 className="h-4 w-4 animate-spin text-champagne" />}
      </div>

      {msg && <p className="text-sm text-burgundy">{msg}</p>}
    </div>
  );
}
