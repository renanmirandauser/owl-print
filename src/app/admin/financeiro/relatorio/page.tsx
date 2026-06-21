import { getFinancialSummary, listEntries } from "@/actions/financial";
import { PrintButton } from "@/components/quotes/PrintButton";
import { BRL } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Relatório Financeiro",
  robots: { index: false },
};

export default async function FinancialReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = Number(yearParam) || new Date().getFullYear();
  const [summary, entries] = await Promise.all([getFinancialSummary(year), listEntries(year)]);

  return (
    <div className="min-h-screen bg-cream py-8 print:bg-white print:py-0">
      <div className="container mb-6 flex max-w-3xl justify-end print:hidden">
        <PrintButton />
      </div>

      <article className="container max-w-3xl rounded-xl bg-white p-10 shadow-premium print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between border-b-2 border-champagne pb-6">
          <div>
            <p className="font-display text-2xl font-bold text-leather">OWL PRINT</p>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">
              Relatório Financeiro Anual
            </p>
          </div>
          <p className="font-display text-3xl text-leather">{year}</p>
        </header>

        {/* Resumo */}
        <section className="mt-6 grid grid-cols-3 gap-4 text-center">
          <Box label="Receita" value={BRL.format(summary.totalRevenue)} />
          <Box label="Despesa" value={BRL.format(summary.totalExpense)} />
          <Box label="Lucro" value={BRL.format(summary.profit)} accent />
        </section>

        {/* Resumo mensal */}
        <h2 className="mt-8 font-display text-lg text-leather">Demonstrativo Mensal</h2>
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-leather/20 text-left text-xs uppercase tracking-wider text-leather/50">
              <th className="py-2">Mês</th>
              <th className="py-2 text-right">Receita</th>
              <th className="py-2 text-right">Despesa</th>
              <th className="py-2 text-right">Lucro</th>
            </tr>
          </thead>
          <tbody>
            {summary.monthly.map((m) => (
              <tr key={m.month} className="border-b border-leather/10">
                <td className="py-2 text-leather">{m.label}</td>
                <td className="py-2 text-right">{BRL.format(m.revenue)}</td>
                <td className="py-2 text-right">{BRL.format(m.expense)}</td>
                <td className="py-2 text-right font-medium">{BRL.format(m.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>

        <footer className="mt-12 border-t border-leather/10 pt-4 text-center text-xs text-leather/40">
          OWL PRINT — Cardápios Personalizados • {entries.length} lançamentos no ano de {year}
        </footer>
      </article>
    </div>
  );
}

function Box({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={"rounded-lg p-4 " + (accent ? "bg-champagne/15" : "bg-cream/60") + " print:bg-transparent print:border print:border-leather/10"}>
      <p className="text-xs uppercase tracking-wider text-leather/50">{label}</p>
      <p className="mt-1 font-display text-xl text-leather">{value}</p>
    </div>
  );
}
