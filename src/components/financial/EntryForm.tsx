"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { createEntry, type EntryInput } from "@/actions/financial";
import { entrySchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

export function EntryForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<EntryInput>({
      resolver: zodResolver(entrySchema),
      defaultValues: { kind: "revenue", description: "", amount: 0, category: "" },
    });

  const kind = watch("kind");

  function onSubmit(data: EntryInput) {
    setError(null);
    startTransition(async () => {
      const res = await createEntry(data);
      if (!res.ok) return setError(res.error);
      reset({ kind, description: "", amount: 0, category: "" });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-premium/10 bg-white p-5">
      <h2 className="font-display text-lg text-leather">Novo Lançamento</h2>

      {/* Toggle receita/despesa */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setValue("kind", "revenue")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border py-2 text-sm transition-colors",
            kind === "revenue"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-premium/20 text-leather/60"
          )}
        >
          <TrendingUp className="h-4 w-4" /> Receita
        </button>
        <button
          type="button"
          onClick={() => setValue("kind", "expense")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border py-2 text-sm transition-colors",
            kind === "expense"
              ? "border-burgundy/40 bg-burgundy/10 text-burgundy"
              : "border-premium/20 text-leather/60"
          )}
        >
          <TrendingDown className="h-4 w-4" /> Despesa
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs text-leather/60">Descrição *</label>
        <input className={inputCls} placeholder="Ex: Compra de couro" {...register("description")} />
        {errors.description && <p className="mt-1 text-xs text-burgundy">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-leather/60">Valor (R$) *</label>
          <input type="number" step="0.01" min="0" className={inputCls} {...register("amount")} />
          {errors.amount && <p className="mt-1 text-xs text-burgundy">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs text-leather/60">Data</label>
          <input type="date" className={inputCls} {...register("date")} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-leather/60">Categoria</label>
        <input className={inputCls} placeholder="material, frete, venda, salário..." {...register("category")} />
      </div>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <button type="submit" disabled={pending} className="btn-gold !py-2 w-full justify-center disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Lançar
      </button>
    </form>
  );
}
