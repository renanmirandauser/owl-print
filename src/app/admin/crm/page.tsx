import Link from "next/link";
import { Plus, Search, FileSpreadsheet } from "lucide-react";
import { listClients } from "@/actions/clients";
import { ClientStatusBadge } from "@/components/crm/ClientStatusBadge";
import { LEAD_STATUS, LEAD_STATUS_LABEL, type LeadStatus } from "@/types";

export const dynamic = "force-dynamic";

const TABS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  ...LEAD_STATUS.map((s) => ({ value: s, label: LEAD_STATUS_LABEL[s] })),
];

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const active = (TABS.find((t) => t.value === status)?.value ?? "all") as LeadStatus | "all";
  const clients = await listClients({ status: active, q });

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-leather">CRM — Leads</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/crm/importar"
            className="inline-flex items-center gap-2 rounded-lg border border-leather/20 px-4 py-2 text-sm font-medium text-leather transition-colors hover:bg-leather/5"
          >
            <FileSpreadsheet className="h-4 w-4" /> Importar Excel
          </Link>
          <Link href="/admin/crm/novo" className="btn-gold !py-2 !px-4">
            <Plus className="h-4 w-4" /> Novo Lead
          </Link>
        </div>
      </div>

      {/* Busca */}
      <form className="mt-6 flex gap-2" action="/admin/crm">
        {active !== "all" && <input type="hidden" name="status" value={active} />}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-leather/40" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome, empresa, e-mail ou telefone..."
            className="w-full rounded-md border border-premium/20 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30"
          />
        </div>
        <button className="btn-gold !py-2 !px-4">Buscar</button>
      </form>

      {/* Filtros */}
      <div className="mt-4 flex flex-wrap gap-1 border-b border-premium/10">
        {TABS.map((t) => {
          const params = new URLSearchParams();
          if (t.value !== "all") params.set("status", t.value);
          if (q) params.set("q", q);
          const qs = params.toString();
          return (
            <Link
              key={t.value}
              href={`/admin/crm${qs ? `?${qs}` : ""}`}
              className={
                "rounded-t-md px-4 py-2 text-sm transition-colors " +
                (active === t.value
                  ? "border-b-2 border-champagne font-medium text-leather"
                  : "text-leather/50 hover:text-leather")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Lista */}
      <div className="mt-4 overflow-hidden rounded-xl border border-premium/10 bg-white">
        {clients.length === 0 ? (
          <div className="p-12 text-center text-leather/50">
            Nenhum lead encontrado.{" "}
            <Link href="/admin/crm/novo" className="text-premium underline">
              Cadastrar o primeiro
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
            <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-premium/10">
              {clients.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/crm/${c.id}`} className="font-medium text-premium">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-leather">{c.company || "—"}</td>
                  <td className="px-4 py-3 text-leather/60">{c.phone || c.whatsapp || c.email || "—"}</td>
                  <td className="px-4 py-3">
                    <ClientStatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
