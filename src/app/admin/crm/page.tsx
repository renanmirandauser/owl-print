import Link from "next/link";
import { Plus, Search, FileSpreadsheet } from "lucide-react";
import { listClients } from "@/actions/clients";
import { DeleteAllLeadsButton } from "@/components/crm/DeleteAllLeadsButton";
import { CrmLeadsTable } from "@/components/crm/CrmLeadsTable";
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
  const allClients = active === "all" && !q ? clients : await listClients({});

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-leather">CRM — Leads</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/crm/importar" className="inline-flex items-center gap-2 rounded-lg border border-leather/20 px-4 py-2 text-sm font-medium text-leather transition-colors hover:bg-leather/5">
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

      {/* Abas de status */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-premium/10">
        <div className="flex flex-wrap gap-1">
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
                    ? "border-b-2 border-champagne font-semibold text-leather"
                    : "text-leather/50 hover:text-leather")
                }
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {active === "all" && !q && allClients.length > 0 && (
          <DeleteAllLeadsButton count={allClients.length} />
        )}
      </div>

      {/* Tabela com checkbox (componente client) */}
      <CrmLeadsTable
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          phone: c.phone,
          whatsapp: c.whatsapp,
          email: c.email,
          status: c.status,
        }))}
      />
    </div>
  );
}
