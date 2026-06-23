"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSelectedClients } from "@/actions/clients";
import { ClientStatusBadge } from "@/components/crm/ClientStatusBadge";
import { useRouter } from "next/navigation";

export interface LeadRow {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  status: string;
}

export function CrmLeadsTable({ clients }: { clients: LeadRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = clients.length > 0 && selected.size === clients.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(clients.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function deleteSelected() {
    const ids = [...selected];
    if (!window.confirm(`Excluir ${ids.length} ${ids.length === 1 ? "lead" : "leads"} selecionado${ids.length === 1 ? "" : "s"}? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      const res = await deleteSelectedClients(ids);
      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  if (clients.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-premium/10 bg-white p-12 text-center text-leather/50">
        Nenhum lead encontrado.{" "}
        <Link href="/admin/crm/novo" className="text-premium underline">Cadastrar o primeiro</Link>.
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Barra de ações em lote */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-2.5">
          <span className="text-sm font-semibold text-leather">
            {selected.size} {selected.size === 1 ? "lead selecionado" : "leads selecionados"}
          </span>
          <button
            onClick={deleteSelected}
            disabled={pending}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-burgundy/30 bg-white px-3 py-1.5 text-sm font-medium text-burgundy transition-colors hover:bg-burgundy/5 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Excluir selecionados
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-ink/50 hover:text-ink">
            Cancelar
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-premium/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-[#BF9B4F] cursor-pointer"
                    title={allSelected ? "Desmarcar todos" : "Selecionar todos"}
                  />
                </th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-premium/10">
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className={
                    "transition-colors hover:bg-cream/40 " +
                    (selected.has(c.id) ? "bg-champagne/5" : "")
                  }
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      className="h-4 w-4 accent-[#BF9B4F] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/crm/${c.id}`} className="font-semibold text-premium hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-leather">{c.company || "—"}</td>
                  <td className="px-4 py-3 text-leather/60">{c.phone || c.whatsapp || c.email || "—"}</td>
                  <td className="px-4 py-3">
                    <ClientStatusBadge status={c.status as never} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
