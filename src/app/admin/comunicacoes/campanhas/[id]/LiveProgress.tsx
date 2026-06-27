"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

/** Atualiza a página a cada 4s enquanto a campanha está enviando/agendada. */
export function LiveProgress({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(id);
  }, [active, router]);

  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
      <Activity className="h-3.5 w-3.5" /> Atualizando ao vivo…
    </span>
  );
}
