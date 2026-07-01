/* ══════════════════════════════════════════════════════════════════
   OS DETAILS — renderização da Ordem de Serviço (Sistema de Vendas)
   Server Component compartilhado entre a página de detalhe do
   orçamento e a página pública de impressão. Espelha as seções
   e a ordem de campos do PDF/HTML original.
   ══════════════════════════════════════════════════════════════════ */

import {
  type OsVendas,
  type CampoOS,
  CAMPOS_CARDAPIO,
  CAMPOS_IMPRESSAO,
  CAMPOS_JA,
  CAMPOS_PC,
  CAMPOS_DISPLAY,
  OS_MODO_LABEL,
  formatarDataBR,
} from "@/lib/vendas-options";

export function OsDetails({ vendas, print = false }: { vendas: OsVendas; print?: boolean }) {
  const d = vendas.detalhes ?? {};
  const b = vendas.briefing ?? null;

  const card = print
    ? "mt-6 break-inside-avoid"
    : "mt-4 rounded-xl border border-premium/10 bg-white p-5";

  return (
    <div>
      {/* Resumo do pedido */}
      <div className={card}>
        <SectionTitle>
          {vendas.modo === "PROD"
            ? "Ordem de Serviço — Produção"
            : `Briefing de ${OS_MODO_LABEL[vendas.modo]}`}
          {vendas.nPedido ? ` • OS #${vendas.nPedido}` : ""}
        </SectionTitle>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          <Linha label="Vendedor" value={vendas.vendedor} />
          <Linha label="Data de Entrada" value={formatarDataBR(vendas.dtEntrada)} />
          <Linha label="Data Limite" value={formatarDataBR(vendas.dtLimite)} destaque />
          <Linha label="Inauguração" value={formatarDataBR(vendas.inauguracao)} />
          <Linha label="Entrega" value={vendas.entrega} />
          <Linha label="Prioridade" value={vendas.prioridade} />
        </dl>
      </div>

      {/* Briefing de Criação */}
      {vendas.modo === "CRIACAO" && b && (
        <div className={card}>
          <SectionTitle>🎨 Briefing de Criação (Novo)</SectionTitle>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            <Linha label="Quantos Cardápios" value={b.qtd} />
            <Linha label="Formato" value={b.formato} />
            <Linha label="Modelo" value={b.modelo} />
            <Linha label="Fixação" value={b.fixacao} />
            <Linha label="Acabamento" value={b.acab} />
            <Linha label="Segmento" value={b.segmento} />
            <Linha label="Fotos" value={b.fotos} />
            <Linha label="Cores" value={b.cores} />
            <Linha label="Capa (Pers.)" value={b.capa} />
            <Linha
              label="Acessórios"
              value={[
                b.acessorios?.ja && "Jogos Americanos",
                b.acessorios?.pc && "Porta Contas",
                b.acessorios?.disp && "Displays",
                b.acessorios?.na && "Não Aplicável",
              ]
                .filter(Boolean)
                .join(", ")}
            />
          </dl>
          <Paragrafo label="Template / Referência" value={b.template} />
          <Paragrafo label="🚫 Restrições (não pode haver)" value={b.restricoes} />
        </div>
      )}

      {/* Briefing de Alteração */}
      {vendas.modo === "ALTERACAO" && b && (
        <div className={card}>
          <SectionTitle>🔄 Briefing de Alteração</SectionTitle>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            <Linha label="Quantos Cardápios" value={b.qtd} />
            <Linha label="Troca de Fotos" value={b.fotos} />
            <Linha label="Tipo de Serviço" value={b.tipo} />
          </dl>
          <Paragrafo label="Quais Páginas / Descrição" value={b.desc} />
          {(b.driveLink || vendas.driveLink) && (
            <p className="mt-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-leather/50">
                Pasta no Drive:{" "}
              </span>
              <a
                href={b.driveLink || vendas.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-premium underline"
              >
                {b.driveLink || vendas.driveLink}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Seções de produção */}
      {vendas.secoes.cardapio && (
        <Secao card={card} titulo="Cardápio (Físico)" campos={CAMPOS_CARDAPIO} det={d} prefixo="c" mockups={vendas.mockups} />
      )}
      {vendas.secoes.impressao && (
        <Secao card={card} titulo="Impressão" campos={CAMPOS_IMPRESSAO} det={d} prefixo="i" mockups={vendas.mockups} />
      )}
      {vendas.secoes.ja && (
        <Secao card={card} titulo="Jogos Americanos" campos={CAMPOS_JA} det={d} prefixo="j" mockups={vendas.mockups} />
      )}
      {vendas.secoes.pc && (
        <Secao card={card} titulo="Porta Contas" campos={CAMPOS_PC} det={d} prefixo="p" mockups={vendas.mockups} />
      )}
      {vendas.secoes.display && (
        <Secao card={card} titulo="Display" campos={CAMPOS_DISPLAY} det={d} prefixo="d" mockups={vendas.mockups} />
      )}
    </div>
  );
}

/* ─── auxiliares ───────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 rounded-md bg-gradient-to-r from-champagne/90 to-transparent px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-ink">
      {children}
    </h3>
  );
}

function Linha({
  label,
  value,
  destaque,
}: {
  label: string;
  value?: string | null;
  destaque?: boolean;
}) {
  if (!value || String(value).trim() === "") return null;
  return (
    <div className="text-sm">
      <dt className="text-xs font-semibold uppercase tracking-wider text-leather/50">{label}</dt>
      <dd className={destaque ? "font-bold text-burgundy" : "text-leather"}>{value}</dd>
    </div>
  );
}

function Paragrafo({ label, value }: { label: string; value?: string | null }) {
  if (!value || String(value).trim() === "") return null;
  return (
    <div className="mt-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-leather/50">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-leather/90">{value}</p>
    </div>
  );
}

function Secao({
  card,
  titulo,
  campos,
  det,
  prefixo,
  mockups,
}: {
  card: string;
  titulo: string;
  campos: CampoOS[];
  det: Record<string, string>;
  prefixo: string;
  mockups: OsVendas["mockups"];
}) {
  const imgs = (mockups ?? []).filter((m) => m.key.startsWith(prefixo));
  const linhas = campos.filter((c) => !c.paragraph && det[c.key]);
  const paragrafos = campos.filter((c) => c.paragraph && det[c.key]);
  if (linhas.length === 0 && paragrafos.length === 0 && imgs.length === 0) return null;

  return (
    <div className={card}>
      <SectionTitle>{titulo}</SectionTitle>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {linhas.map((c) => (
          <Linha key={c.key} label={c.label} value={det[c.key]} />
        ))}
      </dl>
      {paragrafos.map((c) => (
        <Paragrafo key={c.key} label={c.label} value={det[c.key]} />
      ))}
      {imgs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {imgs.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={m.key}
              src={m.url}
              alt={`Mockup ${m.key}`}
              className="max-h-56 rounded-lg border border-champagne/60 object-contain"
            />
          ))}
        </div>
      )}
    </div>
  );
}
