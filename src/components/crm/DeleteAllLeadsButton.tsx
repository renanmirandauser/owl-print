"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteAllClients } from "@/actions/clients";

export function DeleteAllLeadsButton({ count }: { count: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function confirm() {
    startTransition(async () => {
      const res = await deleteAllClients();
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (count === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-burgundy/30 px-3 py-2 text-sm font-medium text-burgundy transition-colors hover:bg-burgundy/5"
      >
        <Trash2 className="h-4 w-4" />
        Excluir todos ({count})
      </button>

      {/* Modal de confirmação */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-premium">
            <button
              onClick={() => setOpen(false)}
              disabled={pending}
              className="absolute right-4 top-4 text-ink/40 hover:text-ink disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy/10">
                <AlertTriangle className="h-5 w-5 text-burgundy" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-leather">Excluir todos os leads</h3>
                <p className="mt-1 text-sm text-ink/60">
                  Esta ação vai remover <strong className="text-ink">{count} leads</strong> permanentemente.
                  Não é possível desfazer.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-leather/5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirm}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-burgundy/90 disabled:opacity-60"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Sim, excluir todos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
