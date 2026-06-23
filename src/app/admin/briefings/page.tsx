import Link from "next/link";
import { listBriefings } from "@/actions/briefings";
import {
  BRIEFING_STATUS,
  BRIEFING_STATUS_LABEL,
  BRIEFING_STATUS_COLOR,
  type BriefingStatus,
} from "@/types";

export const dynamic = "force-dynamic";

const TABS: { value: BriefingStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  ...BRIEFING_STATUS.map((s) => ({ value: s, label: BRIEFING_STATUS_LABEL[s] })),
];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

export default async function BriefingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = (TABS.find((t) => t.value === status)?.value ?? "all") as BriefingStatus | "all";
  const items = await listBriefings(active);

  return (
    <div className="container py-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-leather">Briefings</h1>
        <p className="mt-1 text-ink/60">Solicitações de criação enviadas pelos clientes no site.</p>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-premium/10">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/admin/briefings" : `/admin/briefings?status=${t.value}`}
            className={
              "rounded-t-md px-4 py-2 text-sm transition-colors " +
              (active === t.value
                ? "border-b-2 border-champagne font-semibold text-leather"
                : "text-leather/50 hover:text-leather")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Lista */}
      <div className="mt-4 overflow-hidden rounded-xl border border-premium/10 bg-white">
        {items.length === 0 ? (
          <div className="p-12 text-center text-leather/50">Nenhum briefing recebido ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
                <tr>
                  <th className="px-4 py-3">Estabelecimento</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Recebido</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-premium/10">
                {items.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-cream/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/briefings/${b.id}`} className="font-semibold text-premium">
                        {b.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-leather">{b.responsible}</td>
                    <td className="px-4 py-3 text-leather/60">{b.whatsapp || "—"}</td>
                    <td className="px-4 py-3 text-leather/60">{b.projectType || "—"}</td>
                    <td className="px-4 py-3 text-leather/60">{fmtDate(b.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium " + BRIEFING_STATUS_COLOR[b.status]}>
                        {BRIEFING_STATUS_LABEL[b.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
