import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getCampaignProgress } from "@/actions/campaign-queue";
import { LiveProgress } from "./LiveProgress";

export const dynamic = "force-dynamic";

const STATUS_PT: Record<string, string> = {
  queued: "Na fila", sending: "Enviando", sent: "Enviado",
  delivered: "Entregue", read: "Lido", failed: "Falhou",
};

export default async function CampanhaTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCampaignProgress(id);

  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/comunicacoes/campanhas" className="inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather">
          <ArrowLeft className="h-4 w-4" /> Campanhas
        </Link>
        <p className="text-leather">Campanha não encontrada.</p>
      </div>
    );
  }

  const ativo = data.status === "sending" || data.status === "scheduled";
  const concluido = data.total > 0 ? Math.round(((data.sent + data.failed) / data.total) * 100) : 0;

  const cards: [string, number][] = [
    ["Na fila", data.queued],
    ["Enviadas", data.sent],
    ["Entregues", data.delivered],
    ["Lidas", data.read],
    ["Falhas", data.failed],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/comunicacoes/campanhas" className="mb-2 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather">
          <ArrowLeft className="h-4 w-4" /> Campanhas
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-leather">{data.name}</h1>
          {ativo ? (
            <LiveProgress active={ativo} />
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Concluída
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-leather/60">
          Modelo: {data.templateName}
          {data.scheduledFor && data.status === "scheduled" && (
            <> · agendada para {new Date(data.scheduledFor).toLocaleString("pt-BR")}</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-premium/20 bg-white p-4 text-center">
            <div className="text-2xl font-semibold text-leather">{value}</div>
            <div className="text-xs text-leather/60">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-leather/60">
          <span>Progresso</span>
          <span>{concluido}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-premium/10">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${concluido}%` }} />
        </div>
      </div>

      <div className="rounded-lg border border-premium/20 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-leather">Destinatários</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-leather/60">
                <th className="py-2 pr-4 font-medium">Contato</th>
                <th className="py-2 pr-4 font-medium">Telefone</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recipients.map((r, i) => (
                <tr key={i} className="border-t border-premium/10">
                  <td className="py-2 pr-4 text-leather">{r.name}</td>
                  <td className="py-2 pr-4 text-leather/60">{r.phone}</td>
                  <td className="py-2 text-leather/70">{STATUS_PT[r.status] ?? r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.total > data.recipients.length && (
          <p className="mt-2 text-xs text-leather/50">
            Mostrando {data.recipients.length} de {data.total} destinatários.
          </p>
        )}
      </div>
    </div>
  );
}
