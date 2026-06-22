import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getQuote } from "@/actions/quotes";
import { QuoteStatusBadge } from "@/components/quotes/QuoteStatusBadge";
import { QuoteActions } from "@/components/quotes/QuoteActions";
import { BRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href="/admin/orcamentos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-leather">#{quote.code}</h1>
          <p className="text-leather/60">{quote.clientName}</p>
        </div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      {/* Meta */}
      <div className="mt-6 grid gap-4 rounded-xl border border-premium/10 bg-white p-5 sm:grid-cols-3">
        <Meta label="Criado em" value={quote.createdAt ? fmt(quote.createdAt) : "—"} />
        <Meta label="Validade" value={quote.validUntil ? fmt(quote.validUntil) : "—"} />
        <Meta label="Contato" value={quote.clientPhone || quote.clientEmail || "—"} />
      </div>

      {/* Itens */}
      <div className="mt-4 overflow-hidden rounded-xl border border-premium/10 bg-white">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
          <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3 text-right">Qtd.</th>
              <th className="px-4 py-3 text-right">Valor Unit.</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-premium/10">
            {quote.items.map((it, i) => (
              <tr key={i}>
                <td className="px-4 py-3 text-leather">{it.name}</td>
                <td className="px-4 py-3 text-right">{it.quantity}</td>
                <td className="px-4 py-3 text-right">{BRL.format(it.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-medium">{BRL.format(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-premium/10">
              <td colSpan={3} className="px-4 py-4 text-right font-display text-lg text-leather">
                Total
              </td>
              <td className="px-4 py-4 text-right font-display text-2xl text-leather">
                {BRL.format(quote.total)}
              </td>
            </tr>
          </tfoot>
        </table></div>
      </div>

      {quote.notes && (
        <div className="mt-4 rounded-xl border border-premium/10 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-leather/50">Observações</p>
          <p className="mt-1 text-sm text-leather">{quote.notes}</p>
        </div>
      )}

      <div className="mt-6">
        <QuoteActions id={quote.id} status={quote.status} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-leather/50">{label}</p>
      <p className="mt-1 text-sm text-leather">{value}</p>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}
