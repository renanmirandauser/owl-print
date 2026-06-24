import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, MessageCircle, Mail, Instagram, MapPin, Download } from "lucide-react";
import { getBriefing } from "@/actions/briefings";
import { briefingWhatsAppHref } from "@/lib/briefing-share";
import {
  BRIEFING_STATUS_LABEL,
  BRIEFING_STATUS_COLOR,
} from "@/types";
import { BriefingStatusControl, DeleteBriefingButton } from "@/components/admin/BriefingActions";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await getBriefing(id);
  if (!b) notFound();

  const waHref = briefingWhatsAppHref(b);

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href="/admin/briefings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-leather">{b.company}</h1>
          <p className="text-ink/60">
            {b.responsible} · Recebido em {fmtDate(b.createdAt)}
          </p>
        </div>
        <span className={"rounded-full px-3 py-1 text-xs font-medium " + BRIEFING_STATUS_COLOR[b.status]}>
          {BRIEFING_STATUS_LABEL[b.status]}
        </span>
      </div>

      {/* Ações + status */}
      <div className="mt-5 rounded-2xl border border-leather/10 bg-white p-4 shadow-soft">
        <BriefingStatusControl id={b.id} status={b.status} />
        <div className="mt-4 flex flex-wrap gap-2 border-t border-leather/10 pt-4">
          <Link
            href={`/admin/briefings/${b.id}/imprimir`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-premium/20 px-4 py-2 text-sm font-medium text-leather transition-colors hover:bg-cream"
          >
            <Download className="h-4 w-4 text-champagne" /> Baixar briefing
          </Link>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold !py-2 !px-4"
            >
              <MessageSquare className="h-4 w-4" /> Enviar por WhatsApp
            </a>
          )}
          <DeleteBriefingButton id={b.id} />
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <Card title="Contato">
          <Row label="Responsável" value={b.responsible} />
          <Row label="Estabelecimento" value={b.company} />
          <Row label="WhatsApp" value={b.whatsapp} icon={MessageCircle} />
          <Row label="E-mail" value={b.email} icon={Mail} />
          <Row label="Instagram" value={b.instagram} icon={Instagram} />
          <Row label="Cidade / Estado" value={b.city} icon={MapPin} />
        </Card>

        <Card title="Sobre o estabelecimento">
          <Row label="Segmento" value={b.segment} />
          <Row label="Estilo" value={b.style} />
          <Row label="Público-alvo" value={b.audience} />
          <Row label="Possui logo / identidade" value={b.hasBranding} />
        </Card>

        <Card title="Sobre o cardápio">
          <Row label="Tipo de projeto" value={b.projectType} />
          <Row label="O que precisa" value={b.productTypes.join(", ")} />
          <Row label="Quantidade" value={b.quantity} />
          <Row label="Tamanho" value={b.size} />
          <Row label="Cor / couro" value={b.colorPreference} />
          <Row label="Acabamento" value={b.finishes.join(", ")} />
          <Row label="Posição da logo" value={b.logoPosition} />
          <Row label="Páginas / itens" value={b.pages} />
          <Row label="Idiomas" value={b.languages} />
          <Row label="Conteúdo pronto?" value={b.contentReady} />
        </Card>

        <Card title="Referências e prazo">
          <Row label="Referências" value={b.references} />
          <Row label="Prazo desejado" value={b.deadline} />
          <Row label="Faixa de orçamento" value={b.budget} />
          <Row label="Observações" value={b.notes} />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
      <h2 className="mb-2 font-display text-lg font-semibold text-leather">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: typeof MessageSquare;
}) {
  if (!value || !value.trim()) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-leather/5 py-2.5 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <span className="flex w-52 shrink-0 items-center gap-1.5 text-sm font-medium text-ink/50">
        {Icon && <Icon className="h-3.5 w-3.5 text-champagne" />}
        {label}
      </span>
      <span className="whitespace-pre-wrap text-[15px] text-ink">{value}</span>
    </div>
  );
}
