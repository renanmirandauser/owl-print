"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setClientStatus } from "@/actions/clients";
import { LEAD_STATUS, LEAD_STATUS_LABEL, LEAD_STATUS_COLOR, type LeadStatus } from "@/types";
import { cn } from "@/lib/utils";

export function ClientPipeline({ id, status }: { id: string; status: LeadStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(s: LeadStatus) {
    if (s === status) return;
    startTransition(async () => {
      await setClientStatus(id, s);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-leather/50">Etapa:</span>
      {LEAD_STATUS.map((s) => (
        <button
          key={s}
          onClick={() => change(s)}
          disabled={pending}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all disabled:opacity-50",
            s === status
              ? LEAD_STATUS_COLOR[s] + " ring-2 ring-champagne ring-offset-1"
              : "bg-cream text-leather/60 hover:bg-premium/10"
          )}
        >
          {LEAD_STATUS_LABEL[s]}
        </button>
      ))}
      {pending && <Loader2 className="h-4 w-4 animate-spin text-champagne" />}
    </div>
  );
}
