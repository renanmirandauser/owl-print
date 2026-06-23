"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { setBriefingStatus, deleteBriefing } from "@/actions/briefings";
import { BRIEFING_STATUS, BRIEFING_STATUS_LABEL, BRIEFING_STATUS_COLOR, type BriefingStatus } from "@/types";
import { cn } from "@/lib/utils";

export function BriefingStatusControl({ id, status }: { id: string; status: BriefingStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(s: BriefingStatus) {
    if (s === status) return;
    startTransition(async () => {
      await setBriefingStatus(id, s);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-leather/50">Etapa:</span>
      {BRIEFING_STATUS.map((s) => (
        <button
          key={s}
          onClick={() => change(s)}
          disabled={pending}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all disabled:opacity-50",
            s === status
              ? BRIEFING_STATUS_COLOR[s] + " ring-2 ring-champagne ring-offset-1"
              : "bg-cream text-leather/60 hover:bg-premium/10"
          )}
        >
          {BRIEFING_STATUS_LABEL[s]}
        </button>
      ))}
      {pending && <Loader2 className="h-4 w-4 animate-spin text-champagne" />}
    </div>
  );
}

export function DeleteBriefingButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function remove() {
    if (!window.confirm("Excluir este briefing? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const res = await deleteBriefing(id);
      if (res.ok) {
        router.push("/admin/briefings");
        router.refresh();
      }
    });
  }
  return (
    <button
      onClick={remove}
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-burgundy/30 px-3 py-2 text-sm font-medium text-burgundy transition-colors hover:bg-burgundy/5 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Excluir
    </button>
  );
}
