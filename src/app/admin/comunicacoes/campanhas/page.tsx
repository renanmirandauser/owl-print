import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { listTemplates, listCampaigns } from "@/actions/communications";
import { NovaCampanhaForm } from "./NovaCampanhaForm";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho", scheduled: "Agendada", sending: "Enviando", done: "Concluída", failed: "Falhou",
};

export default async function CampanhasPage() {
  const [templates, campaigns] = await Promise.all([listTemplates(), listCampaigns()]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/comunicacoes" className="mb-2 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather">
          <ArrowLeft className="h-4 w-4" /> Comunicações
        </Link>
        <h1 className="text-2xl font-semibold text-leather">Campanhas</h1>
        <p className="text-sm text-leather/60">Envio em massa e agendado pela Z-API</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {templates.filter((t) => t.active).length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Crie um modelo ativo primeiro em <Link href="/admin/comunicacoes" className="underline">Comunicações</Link>.
          </div>
        ) : (
          <NovaCampanhaForm templates={templates} />
        )}

        <div className="rounded-lg border border-premium/20 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-leather">Histórico de campanhas</h3>
          {campaigns.length === 0 ? (
            <p className="text-sm text-leather/60">Nenhuma campanha ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-leather/60">
                    <th className="py-2 pr-4 font-medium">Campanha</th>
                    <th className="py-2 pr-4 font-medium">Enviadas</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-t border-premium/10">
                      <td className="py-2 pr-4 font-medium text-leather">{c.name}</td>
                      <td className="py-2 pr-4 text-leather/70">{c.sent}/{c.total}</td>
                      <td className="py-2 pr-4 text-leather/70">{STATUS_LABEL[c.status] ?? c.status}</td>
                      <td className="py-2 text-right">
                        <Link href={`/admin/comunicacoes/campanhas/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-leather hover:underline">
                          <Eye className="h-3.5 w-3.5" /> Acompanhar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
