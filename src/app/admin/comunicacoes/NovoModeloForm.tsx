"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createTemplate } from "@/actions/communications";

export function NovoModeloForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function salvar() {
    setErr("");
    startTransition(async () => {
      const res = await createTemplate({ name, body });
      if (res.ok) {
        setName(""); setBody("");
        router.refresh();
      } else {
        setErr(res.error);
      }
    });
  }

  return (
    <div className="rounded-lg border border-premium/20 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-leather">Novo modelo</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do modelo (ex.: Pedido Pronto)"
        className="mb-2 w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Olá {{nome}}! Seu pedido está pronto para retirada. 🦉"
        className="w-full rounded-md border border-premium/20 bg-cream px-3 py-2 text-sm"
      />
      <p className="mt-1 text-xs text-leather/60">
        Variáveis disponíveis: <code>{"{{nome}}"}</code>, <code>{"{{empresa}}"}</code>, <code>{"{{numero}}"}</code>
      </p>
      {err && <p className="mt-2 text-xs text-burgundy">{err}</p>}
      <button
        onClick={salvar}
        disabled={pending || !name.trim() || !body.trim()}
        className="mt-3 inline-flex items-center gap-2 rounded-md bg-leather px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Salvar modelo
      </button>
    </div>
  );
}
