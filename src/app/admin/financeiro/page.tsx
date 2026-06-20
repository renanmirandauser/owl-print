import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { getFinancialSummary, listEntries } from "@/actions/financial";
import { MetricCard } from "@/components/admin/DashboardMetrics";
import { FinancialChart } from "@/components/financial/FinancialChart";
import { EntryForm } from "@/components/financial/EntryForm";
import { EntryList } from "@/components/financial/EntryList";
import { ExportButtons } from "@/components/financial/ExportButtons";
import { BRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinancialPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = Number(yearParam) || new Date().getFullYear();

  const [summary, entries] = await Promise.all([
    getFinancialSummary(year),
    listEntries(year),
  ]);

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-leather">Financeiro</h1>
        <div className="flex items-center gap-3">
          {/* Navegação por ano */}
          <div className="flex items-center gap-1 rounded-md border border-premium/20 bg-white">
            <Link href={`/admin/financeiro?year=${year - 1}`} className="px-2 py-1.5 text-leather/60 hover:text-leather">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="px-2 text-sm font-medium text-leather">{year}</span>
            <Link href={`/admin/financeiro?year=${year + 1}`} className="px-2 py-1.5 text-leather/60 hover:text-leather">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <ExportButtons year={year} />
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Receita" value={BRL.format(summary.totalRevenue)} icon={TrendingUp} />
        <MetricCard label="Despesa" value={BRL.format(summary.totalExpense)} icon={TrendingDown} />
        <MetricCard
          label="Lucro"
          value={BRL.format(summary.profit)}
          icon={Wallet}
          positive={summary.profit >= 0}
          delta={summary.profit >= 0 ? "Resultado positivo" : "Resultado negativo"}
        />
      </div>

      {/* Gráfico */}
      <div className="mt-4">
        <FinancialChart data={summary.monthly} />
      </div>

      {/* Lançamentos */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EntryForm />
        </div>
        <div className="lg:col-span-2">
          <EntryList entries={entries} />
        </div>
      </div>
    </div>
  );
}
