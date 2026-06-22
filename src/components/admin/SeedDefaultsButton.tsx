"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { seedDefaultCategories } from "@/actions/catalog";

export function SeedDefaultsButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  function run() {
    setMsg("");
    start(async () => {
      const res = await seedDefaultCategories();
      if (res.ok) {
        setMsg(res.added > 0 ? `${res.added} categoria(s) importada(s).` : "Todas já estavam na lista.");
        router.refresh();
      } else {
        setMsg(res.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-premium/20 px-3 py-1.5 text-sm text-leather transition-colors hover:bg-cream disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Importar categorias padrão
      </button>
      {msg && <span className="text-xs text-ink/50">{msg}</span>}
    </div>
  );
}
