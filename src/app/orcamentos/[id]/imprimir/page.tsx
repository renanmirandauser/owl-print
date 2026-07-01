import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuote } from "@/actions/quotes";
import { PrintButton } from "@/components/quotes/PrintButton";
import { OsDetails } from "@/components/quotes/OsDetails";
import { QUOTE_STATUS_LABEL } from "@/types";
import { BRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const q = await getQuote(id);
  return { title: q ? `Orçamento ${q.code}` : "Orçamento", robots: { index: false } };
}

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const q = await getQuote(id);
  if (!q) notFound();

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="min-h-screen bg-cream py-8 print:bg-white print:py-0">
      {/* Barra de ações — some na impressão */}
      <div className="container mb-6 flex max-w-3xl justify-end print:hidden">
        <PrintButton />
      </div>

      {/* Documento A4 */}
      <article className="container max-w-3xl rounded-xl bg-white p-10 shadow-premium print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        {/* Cabeçalho */}
        <header className="flex items-start justify-between border-b-2 border-champagne pb-6">
          <div>
            <p className="font-display text-2xl font-bold text-leather">OWL PRINT</p>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">
              Cardápios Personalizados
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl text-leather">Orçamento</p>
            <p className="text-sm text-leather/60">#{q.code}</p>
            <p className="mt-1 text-xs text-leather/50">
              {QUOTE_STATUS_LABEL[q.status]}
            </p>
          </div>
        </header>

        {/* Dados */}
        <section className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-leather/40">Cliente</p>
            <p className="font-medium text-leather">{q.clientName}</p>
            {q.clientPhone && <p className="text-leather/60">{q.clientPhone}</p>}
            {q.clientEmail && <p className="text-leather/60">{q.clientEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-leather/40">Emissão</p>
            <p className="text-leather">{fmt(q.createdAt)}</p>
            <p className="mt-2 text-xs uppercase tracking-wider text-leather/40">Validade</p>
            <p className="text-leather">{fmt(q.validUntil)}</p>
          </div>
        </section>

        {/* Itens / valores (só quando o orçamento tem preços) */}
        {q.items.length > 0 && (
          <>
            <table className="mt-8 w-full text-sm">
              <thead>
                <tr className="border-b border-leather/20 text-left text-xs uppercase tracking-wider text-leather/50">
                  <th className="py-2">Produto</th>
                  <th className="py-2 text-right">Qtd.</th>
                  <th className="py-2 text-right">Valor Unit.</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {q.items.map((it, i) => (
                  <tr key={i} className="border-b border-leather/10">
                    <td className="py-3 text-leather">{it.name}</td>
                    <td className="py-3 text-right">{it.quantity}</td>
                    <td className="py-3 text-right">{BRL.format(it.unitPrice)}</td>
                    <td className="py-3 text-right font-medium">{BRL.format(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="mt-6 flex justify-end">
              <div className="w-56 border-t-2 border-champagne pt-3 text-right">
                <p className="text-xs uppercase tracking-wider text-leather/50">Total</p>
                <p className="font-display text-3xl text-leather">{BRL.format(q.total)}</p>
              </div>
            </div>
          </>
        )}

        {/* OS do Sistema de Vendas (briefing e seções de produção) */}
        {q.vendas && <OsDetails vendas={q.vendas} print />}

        {q.notes && (
          <section className="mt-8 rounded-lg bg-cream/60 p-4 text-sm print:bg-transparent print:p-0">
            <p className="text-xs uppercase tracking-wider text-leather/40">Observações</p>
            <p className="mt-1 text-leather/80">{q.notes}</p>
          </section>
        )}

        <footer className="mt-12 border-t border-leather/10 pt-4 text-center text-xs text-leather/40">
          OWL PRINT — Cardápios Personalizados • Excelência em cada detalhe
        </footer>
      </article>
    </div>
  );
}
