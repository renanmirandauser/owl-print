"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { updateOrder } from "@/actions/orders";

export function OrderEditor({
  id,
  deliveryForecast,
  internalNotes,
}: {
  id: string;
  deliveryForecast: string | null;
  internalNotes: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(deliveryForecast ? deliveryForecast.slice(0, 10) : "");
  const [notes, setNotes] = useState(internalNotes);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setSaved(false);
    startTransition(async () => {
      const res = await updateOrder(id, { deliveryForecast: date || undefined, internalNotes: notes });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  const inputCls =
    "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
    "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

  return (
    <div className="space-y-4 rounded-xl border border-premium/10 bg-white p-5">
      <div>
        <label className="mb-1 block text-xs text-leather/60">Previsão de entrega</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-leather/60">Notas internas (produção)</label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detalhes de acabamento, observações de máquina, prioridade..."
          className={inputCls}
        />
      </div>
      <button onClick={save} disabled={pending} className="btn-gold !py-2 disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {saved ? <Check className="h-4 w-4" /> : null}
        {saved ? "Salvo" : "Salvar"}
      </button>
    </div>
  );
}
