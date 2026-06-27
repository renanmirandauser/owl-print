import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Pencil, Mail, Instagram, Phone, Building2 } from "lucide-react";
import { getClient } from "@/actions/clients";
import { ClientStatusBadge } from "@/components/crm/ClientStatusBadge";
import { ClientPipeline } from "@/components/crm/ClientPipeline";
import { ActivityTimeline } from "@/components/crm/ActivityTimeline";
import { ClientActions } from "@/components/crm/ClientActions";
import { listTemplates } from "@/actions/communications";
import { SendWhatsAppButton } from "@/components/crm/SendWhatsAppButton";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getClient(id);
  if (!c) notFound();
  const templates = await listTemplates();

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href="/admin/crm"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-leather">{c.name}</h1>
          {c.company && <p className="text-leather/60">{c.company}</p>}
        </div>
        <ClientStatusBadge status={c.status} />
      </div>

      {/* Pipeline */}
      <div className="mt-5 rounded-xl border border-premium/10 bg-white p-4">
        <ClientPipeline id={c.id} status={c.status} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* Coluna info */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-xl border border-premium/10 bg-white p-5">
            <h2 className="mb-3 font-display text-lg text-leather">Contato</h2>
            <ul className="space-y-2 text-sm text-leather/80">
              {c.phone && <Info icon={Phone} value={c.phone} />}
              {c.whatsapp && <Info icon={Phone} value={`WhatsApp: ${c.whatsapp}`} />}
              {c.email && <Info icon={Mail} value={c.email} />}
              {c.instagram && <Info icon={Instagram} value={c.instagram} />}
              {c.company && <Info icon={Building2} value={c.company} />}
            </ul>
            {c.notes && (
              <p className="mt-4 border-t border-premium/10 pt-3 text-sm text-leather/70">{c.notes}</p>
            )}
          </div>

          <div className="rounded-xl border border-premium/10 bg-white p-5">
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/orcamentos/novo?clientId=${c.id}`}
                className="btn-gold !py-2 justify-center"
              >
                <FileText className="h-4 w-4" /> Criar Orçamento
              </Link>
              <Link
                href={`/admin/crm/${c.id}/editar`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-premium/20 px-3 py-2 text-sm text-leather hover:bg-cream"
              >
                <Pencil className="h-4 w-4" /> Editar
              </Link>
              <ClientActions id={c.id} whatsapp={c.whatsapp || c.phone} />
              <SendWhatsAppButton clientId={c.id} templates={templates} />
            </div>
          </div>
        </div>

        {/* Coluna histórico */}
        <div className="md:col-span-2">
          <ActivityTimeline id={c.id} activities={c.activities} />
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-champagne" />
      <span>{value}</span>
    </li>
  );
}
