import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getBriefing } from "@/actions/briefings";
import { PrintButton } from "@/components/quotes/PrintButton";
import { BRIEFING_STATUS_LABEL } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const b = await getBriefing(id);
  return { title: b ? `Briefing — ${b.company}` : "Briefing", robots: { index: false } };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const joinList = (arr?: string[]) => (arr && arr.length ? arr.join(", ") : "");

type Field = { label: string; value?: string | null };

export default async function BriefingPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await getBriefing(id);
  if (!b) notFound();

  // Cada seção é montada a partir dos dados; campos vazios são filtrados,
  // e a seção só aparece se tiver ao menos um campo preenchido.
  const sections: { title: string; fields: Field[] }[] = [
    {
      title: "Contato",
      fields: [
        { label: "Responsável", value: b.responsible },
        { label: "Estabelecimento", value: b.company },
        { label: "WhatsApp", value: b.whatsapp },
        { label: "E-mail", value: b.email },
        { label: "Instagram", value: b.instagram },
        { label: "Cidade / Estado", value: b.city },
      ],
    },
    {
      title: "Sobre o estabelecimento",
      fields: [
        { label: "Segmento", value: b.segment },
        { label: "Estilo", value: b.style },
        { label: "Público-alvo", value: b.audience },
        { label: "Possui logo / identidade", value: b.hasBranding },
      ],
    },
    {
      title: "Sobre o cardápio",
      fields: [
        { label: "Tipo de projeto", value: b.projectType },
        { label: "O que precisa", value: joinList(b.productTypes) },
        { label: "Quantidade", value: b.quantity },
        { label: "Tamanho", value: b.size },
        { label: "Cor / couro", value: b.colorPreference },
        { label: "Acabamento", value: joinList(b.finishes) },
        { label: "Posição da logo", value: b.logoPosition },
        { label: "Páginas / itens", value: b.pages },
        { label: "Idiomas", value: b.languages },
        { label: "Conteúdo pronto?", value: b.contentReady },
      ],
    },
    {
      title: "Referências e prazo",
      fields: [
        { label: "Referências", value: b.references },
        { label: "Prazo desejado", value: b.deadline },
        { label: "Faixa de orçamento", value: b.budget },
        { label: "Observações", value: b.notes },
      ],
    },
  ]
    .map((s) => ({ ...s, fields: s.fields.filter((f) => (f.value ?? "").toString().trim()) }))
    .filter((s) => s.fields.length > 0);

  return (
    <div className="min-h-screen bg-cream py-8 print:bg-white print:py-0">
      {/* Barra de ações — some na impressão */}
      <div className="container mb-6 flex max-w-3xl items-center justify-between print:hidden">
        <Link
          href={`/admin/briefings/${b.id}`}
          className="inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <PrintButton />
      </div>

      {/* Documento A4 */}
      <article className="container max-w-3xl rounded-xl bg-white p-10 shadow-premium print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        {/* Cabeçalho */}
        <header className="flex items-start justify-between border-b-2 border-champagne pb-6">
          <div>
            <p className="font-display text-2xl font-bold text-leather">OWL PRINT</p>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">
              Cardápios Personalizados
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl text-leather">Briefing</p>
            <p className="text-sm text-leather/60">{b.company}</p>
            <p className="mt-1 text-xs text-leather/50">{BRIEFING_STATUS_LABEL[b.status]}</p>
          </div>
        </header>

        {/* Resumo do topo */}
        <section className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-leather/40">Responsável</p>
            <p className="font-medium text-leather">{b.responsible}</p>
            {b.whatsapp && <p className="text-leather/60">{b.whatsapp}</p>}
            {b.email && <p className="text-leather/60">{b.email}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-leather/40">Recebido em</p>
            <p className="text-leather">{fmtDate(b.createdAt)}</p>
            {b.city && (
              <>
                <p className="mt-2 text-xs uppercase tracking-wider text-leather/40">
                  Cidade / Estado
                </p>
                <p className="text-leather">{b.city}</p>
              </>
            )}
          </div>
        </section>

        {/* Seções */}
        <div className="mt-8 space-y-7">
          {sections.map((s) => (
            <section key={s.title} className="break-inside-avoid">
              <h2 className="mb-2 border-b border-leather/15 pb-1 font-display text-base font-semibold text-leather">
                {s.title}
              </h2>
              <dl>
                {s.fields.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col gap-0.5 border-b border-leather/5 py-2 last:border-0 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <dt className="w-52 shrink-0 text-sm font-medium text-leather/50">{f.label}</dt>
                    <dd className="whitespace-pre-wrap text-[15px] text-ink">
                      {(f.value ?? "").toString().trim()}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-leather/10 pt-4 text-center text-xs text-leather/40">
          OWL PRINT — Cardápios Personalizados • Excelência em cada detalhe
        </footer>
      </article>
    </div>
  );
}
