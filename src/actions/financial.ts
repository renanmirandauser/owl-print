"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Financial } from "@/models/Financial";
import { type FinancialKind } from "@/types";
import { entrySchema } from "@/lib/schemas";

export type EntryInput = z.infer<typeof entrySchema>;

/* ─── DTOs ──────────────────────────────────────────────── */

export interface EntryDTO {
  id: string;
  kind: FinancialKind;
  description: string;
  amount: number;
  category: string;
  date: string;
}
export interface MonthlyPoint {
  month: number; // 1-12
  label: string; // Jan, Fev...
  revenue: number;
  expense: number;
  profit: number;
}
export interface FinancialSummary {
  year: number;
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  monthly: MonthlyPoint[];
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export type ActionResult = { ok: true } | { ok: false; error: string };

/* ─── Resumo + agregação mensal (gráficos) ──────────────── */

export async function getFinancialSummary(year: number): Promise<FinancialSummary> {
  await dbConnect();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const rows = await Financial.aggregate<{ _id: { m: number; kind: FinancialKind }; total: number }>([
    { $match: { date: { $gte: start, $lt: end } } },
    { $group: { _id: { m: { $month: "$date" }, kind: "$kind" }, total: { $sum: "$amount" } } },
  ]);

  const monthly: MonthlyPoint[] = MONTHS.map((label, i) => ({
    month: i + 1,
    label,
    revenue: 0,
    expense: 0,
    profit: 0,
  }));

  for (const r of rows) {
    const point = monthly[r._id.m - 1];
    if (r._id.kind === "revenue") point.revenue = r.total;
    else point.expense = r.total;
  }
  monthly.forEach((p) => (p.profit = p.revenue - p.expense));

  const totalRevenue = monthly.reduce((s, p) => s + p.revenue, 0);
  const totalExpense = monthly.reduce((s, p) => s + p.expense, 0);

  return { year, totalRevenue, totalExpense, profit: totalRevenue - totalExpense, monthly };
}

/* ─── Lançamentos ───────────────────────────────────────── */

type LeanEntry = {
  _id: unknown;
  kind: FinancialKind;
  description: string;
  amount: number;
  category?: string;
  date: Date;
};

function serialize(e: LeanEntry): EntryDTO {
  return {
    id: String(e._id),
    kind: e.kind,
    description: e.description,
    amount: e.amount,
    category: e.category ?? "",
    date: new Date(e.date).toISOString(),
  };
}

export async function listEntries(year: number, kind?: FinancialKind): Promise<EntryDTO[]> {
  await dbConnect();
  const filter: Record<string, unknown> = {
    date: { $gte: new Date(Date.UTC(year, 0, 1)), $lt: new Date(Date.UTC(year + 1, 0, 1)) },
  };
  if (kind) filter.kind = kind;
  const docs = await Financial.find(filter).sort({ date: -1 }).lean<LeanEntry[]>();
  return docs.map(serialize);
}

export async function createEntry(input: EntryInput): Promise<ActionResult> {
  const parsed = entrySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await dbConnect();
    await Financial.create({
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    });
    revalidatePath("/admin/financeiro");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("createEntry:", err);
    return { ok: false, error: "Erro ao lançar." };
  }
}

export async function deleteEntry(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Financial.findByIdAndDelete(id);
    revalidatePath("/admin/financeiro");
    return { ok: true };
  } catch (err) {
    console.error("deleteEntry:", err);
    return { ok: false, error: "Erro ao excluir." };
  }
}
