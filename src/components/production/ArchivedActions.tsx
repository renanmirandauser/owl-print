"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { unarchiveOrder, deleteOrder } from "@/actions/orders";

export function ArchivedActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function unarchive() {
    start(async () => {
      await unarchiveOrder(id);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Excluir este pedido definitivamente? Esta ação não pode ser desfeita.")) return;
    start(async () => {
      await deleteOrder(id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-champagne" />}
      <button
        onClick={unarchive}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-premium/20 px-2.5 py-1.5 text-xs text-leather transition-colors hover:bg-cream"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Restaurar
      </button>
      <button
        onClick={remove}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-burgundy/30 px-2.5 py-1.5 text-xs text-burgundy transition-colors hover:bg-burgundy/5"
      >
        <Trash2 className="h-3.5 w-3.5" /> Excluir
      </button>
    </div>
  );
}
