"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Trash2, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { deleteEntry, type EntryDTO } from "@/actions/financial";
import { BRL } from "@/lib/utils";

export function EntryList({ entries }: { entries: EntryDTO[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  function remove(id: string) {
    if (!window.confirm("Excluir este lançamento?")) return;
    setBusy(id);
    startTransition(async () => {
      await deleteEntry(id);
      setBusy(null);
      router.refresh();
    });
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-premium/10 bg-white p-10 text-center text-sm text-leather/50">
        Nenhum lançamento no período.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-premium/10 bg-white">
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
        <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
          <tr>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-premium/10">
          {entries.map((e) => {
            const rev = e.kind === "revenue";
            return (
              <tr key={e.id} className="hover:bg-cream/40">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 text-leather">
                    {rev ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-burgundy" />
                    )}
                    {e.description}
                  </span>
                </td>
                <td className="px-4 py-3 text-leather/60">{e.category || "—"}</td>
                <td className="px-4 py-3 text-leather/60">
                  {new Date(e.date).toLocaleDateString("pt-BR")}
                </td>
                <td className={"px-4 py-3 text-right font-medium " + (rev ? "text-emerald-700" : "text-burgundy")}>
                  {rev ? "+" : "−"} {BRL.format(e.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(e.id)}
                    disabled={pending && busy === e.id}
                    className="text-leather/30 hover:text-burgundy"
                    aria-label="Excluir"
                  >
                    {pending && busy === e.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </div>
  );
}
