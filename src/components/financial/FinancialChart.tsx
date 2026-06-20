"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyPoint } from "@/actions/financial";
import { BRL } from "@/lib/utils";

export function FinancialChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="rounded-xl border border-premium/10 bg-white p-5">
      <h2 className="mb-4 font-display text-lg text-leather">Receita × Despesa × Lucro</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3dccf" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#5C3D2E" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#8a7d72" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <Tooltip
              formatter={(v: number) => BRL.format(v)}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e3dccf",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name="Receita" fill="#C9A876" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Despesa" fill="#7A1F1F" radius={[4, 4, 0, 0]} />
            <Line dataKey="profit" name="Lucro" stroke="#3D2B1F" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
