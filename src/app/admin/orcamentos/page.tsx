import Link from "next/link";
import { Plus } from "lucide-react";
import { listQuotes } from "@/actions/quotes";
import { QuoteStatusBadge } from "@/components/quotes/QuoteStatusBadge";
import { QUOTE_STATUS, QUOTE_STATUS_LABEL, type QuoteStatus } from "@/types";
import { BRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS: { value: QuoteStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  ...QUOTE_STATUS.map((s) => ({ value: s, label: QUOTE_STATUS_LABEL[s] })),
];

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = (TABS.find((t) => t.value === status)?.value ?? "all") as QuoteStatus | "all";
  const quotes = await listQuotes(active);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-leather">Orçamentos</h1>
        <Link href="/admin/orcamentos/novo" className="btn-gold !py-2 !px-4">
          <Plus className="h-4 w-4" /> Novo Orçamento
        </Link>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-premium/10">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/admin/orcamentos" : `/admin/orcamentos?status=${t.value}`}
            className={
              "rounded-t-md px-4 py-2 text-sm transition-colors " +
              (active === t.value
                ? "border-b-2 border-champagne font-medium text-leather"
                : "text-leather/50 hover:text-leather")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      <div className="mt-4 overflow-hidden rounded-xl border border-premium/10 bg-white">
        {quotes.length === 0 ? (
          <div className="p-12 text-center text-leather/50">
            Nenhum orçamento por aqui ainda.{" "}
            <Link href="/admin/orcamentos/novo" className="text-premium underline">
              Criar o primeiro
            </Link>
            .
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-premium/10">
              {quotes.map((q) => (
                <tr key={q.id} className="transition-colors hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orcamentos/${q.id}`} className="font-medium text-premium">
                      #{q.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-leather">{q.clientName}</td>
                  <td className="px-4 py-3">
                    <QuoteStatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-leather">
                    {BRL.format(q.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-leather/50">
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
