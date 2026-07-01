"use client";

/* Botão "Baixar PDF da OS" — usado na página de detalhe do orçamento.
   Reconstrói o PDF completo do Sistema de Vendas a partir dos dados
   salvos (converte mockups do Cloudinary em dataURL para embutir). */

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import type { QuoteDTO } from "@/actions/quotes";
import { gerarPdfOS, urlToDataUrl } from "@/lib/os-pdf";

export function OsPdfButton({ quote }: { quote: QuoteDTO }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!quote.vendas) return null;

  async function baixar() {
    if (!quote.vendas) return;
    setBusy(true);
    setErr(null);
    try {
      const imagens: Partial<Record<string, string>> = {};
      for (const m of quote.vendas.mockups ?? []) {
        const data = await urlToDataUrl(m.url);
        if (data) imagens[m.key] = data;
      }
      await gerarPdfOS({
        codigo: quote.code,
        cliente: quote.clientName,
        vendas: quote.vendas,
        imagens,
        itens: quote.items,
        total: quote.total,
        notes: quote.notes,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao gerar PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={baixar}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather transition-colors hover:border-champagne disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        Baixar PDF da OS
      </button>
      {err && <p className="text-xs text-burgundy">{err}</p>}
    </>
  );
}
