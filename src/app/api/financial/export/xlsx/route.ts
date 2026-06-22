import * as XLSX from "xlsx";
import { listEntries, getFinancialSummary } from "@/actions/financial";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const [entries, summary] = await Promise.all([listEntries(year), getFinancialSummary(year)]);

  const wb = XLSX.utils.book_new();

  // Aba 1 — Resumo mensal
  const monthlyRows = summary.monthly.map((m) => ({
    Mês: m.label,
    Receita: m.revenue,
    Despesa: m.expense,
    Lucro: m.profit,
  }));
  monthlyRows.push({
    Mês: "TOTAL",
    Receita: summary.totalRevenue,
    Despesa: summary.totalExpense,
    Lucro: summary.profit,
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyRows), "Resumo");

  // Aba 2 — Lançamentos
  const entryRows = entries.map((e) => ({
    Data: new Date(e.date).toLocaleDateString("pt-BR"),
    Tipo: e.kind === "revenue" ? "Receita" : "Despesa",
    Descrição: e.description,
    Categoria: e.category,
    Valor: e.amount,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(entryRows), "Lançamentos");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buf);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="financeiro-owlprint-${year}.xlsx"`,
    },
  });
}
