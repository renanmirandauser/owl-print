/* ══════════════════════════════════════════════════════════════════
   GERAÇÃO DE PDF DA OS — OWL PRINT  (v2 — layout reconstruído)
   • Logotipo oficial (/owllogo.png) embutido no cabeçalho
   • Hierarquia tipográfica: label 6.2pt / valor 9.2pt / seção 9.5pt
   • Campos em grade de 2 colunas com zebra (em vez de lista corrida)
   • Bloco-resumo, tabela de valores, campo de assinaturas e rodapé
   Uso exclusivo em Client Components.
   ══════════════════════════════════════════════════════════════════ */

import {
  type OsVendas,
  type CampoOS,
  CAMPOS_CARDAPIO,
  CAMPOS_IMPRESSAO,
  CAMPOS_JA,
  CAMPOS_PC,
  CAMPOS_DISPLAY,
  MOCKUP_GROUP_LABEL,
  formatarDataBR,
} from "@/lib/vendas-options";

/* ─── Paleta (tailwind.config.ts) ─────────────────────────────── */
type RGB = [number, number, number];
const NAVY: RGB = [21, 57, 91]; // leather   #15395B
const GOLD: RGB = [191, 155, 79]; // champagne #BF9B4F
const INK: RGB = [18, 39, 63]; // ink       #12273F
const BURGUNDY: RGB = [122, 30, 45]; // burgundy
const GREY: RGB = [122, 128, 138];
const LINE: RGB = [223, 218, 206];
const ZEBRA: RGB = [250, 248, 243];
const CREAM: RGB = [247, 245, 239];
const WHITE: RGB = [255, 255, 255];

/* ─── Métricas ────────────────────────────────────────────────── */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 44;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 46; // limite inferior do conteúdo
const GUTTER = 14;
const COL_W = (CONTENT_W - GUTTER) / 2;

const LOGO_SRC = "/owllogo.png";
const LOGO_H = 30; // altura fixa do logo no cabeçalho (pt)

export interface OsPdfItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OsPdfData {
  codigo?: string; // ORC-00035 (código do ERP)
  cliente: string;
  vendas: OsVendas;
  /** dataURLs (preview local) ou URLs Cloudinary já convertidas p/ dataURL */
  imagens: Partial<Record<string, string>>;
  itens?: OsPdfItem[];
  total?: number;
  notes?: string;
}

/* ─── jsPDF via CDN ───────────────────────────────────────────── */

declare global {
  interface Window {
    jspdf?: { jsPDF: new (opts: { unit: string; format: string }) => JsPdfDoc };
  }
}

interface JsPdfDoc {
  addPage(): void;
  setPage(n: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  setLineWidth(w: number): void;
  setTextColor(r: number, g: number, b: number): void;
  setFont(f: string, s: string): void;
  setFontSize(n: number): void;
  setCharSpace(n: number): void;
  getTextWidth(t: string): number;
  rect(x: number, y: number, w: number, h: number, style?: string): void;
  roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  text(t: string | string[], x: number, y: number, o?: { align?: string }): void;
  splitTextToSize(t: string, w: number): string[];
  addImage(src: string, fmt: string, x: number, y: number, w: number, h: number): void;
  save(name: string): void;
  internal: { getNumberOfPages(): number };
}

let jspdfPromise: Promise<void> | null = null;

export function loadJsPdf(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("client only"));
  if (window.jspdf) return Promise.resolve();
  if (jspdfPromise) return jspdfPromise;
  jspdfPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      jspdfPromise = null;
      reject(new Error("Falha ao carregar a biblioteca de PDF. Verifique a conexão."));
    };
    document.head.appendChild(s);
  });
  return jspdfPromise;
}

/* Converte URL (Cloudinary / public) em dataURL para embutir no PDF */
export async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* Logo oficial: carrega uma vez e guarda proporção real */
type LogoInfo = { data: string; ratio: number };
let logoCache: LogoInfo | null | undefined;

async function carregarLogo(): Promise<LogoInfo | null> {
  if (logoCache !== undefined) return logoCache;
  const data = await urlToDataUrl(LOGO_SRC);
  if (!data) {
    logoCache = null;
    return null;
  }
  const ratio = await new Promise<number>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth / (img.naturalHeight || 1) || 3.1);
    img.onerror = () => resolve(3.1);
    img.src = data;
  });
  logoCache = { data, ratio };
  return logoCache;
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/* ═════════════════════════ GERAÇÃO ═════════════════════════════ */

export async function gerarPdfOS(dados: OsPdfData): Promise<void> {
  await loadJsPdf();
  if (!window.jspdf) throw new Error("Biblioteca de PDF indisponível.");
  const logo = await carregarLogo();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const v = dados.vendas;
  const d = v.detalhes ?? {};
  let y = 0;

  const modoLabel =
    v.modo === "CRIACAO"
      ? "BRIEFING DE CRIAÇÃO"
      : v.modo === "ALTERACAO"
        ? "BRIEFING DE ALTERAÇÃO"
        : "ORDEM DE SERVIÇO";

  const osRef = v.nPedido ? `OS Nº ${v.nPedido}` : "OS S/Nº";

  /* ─── utilitários de texto ─── */
  const fonte = (estilo: "normal" | "bold", tamanho: number, cor: RGB, espaco = 0) => {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tamanho);
    doc.setTextColor(...cor);
    doc.setCharSpace(espaco);
  };
  const reset = () => doc.setCharSpace(0);

  /* ─── páginas ─── */
  function novaPagina() {
    doc.addPage();
    cabecalhoSecundario();
  }
  function espaco(altura: number) {
    if (y + altura > FOOTER_Y) novaPagina();
  }

  /* ─── cabeçalhos ─── */
  function cabecalhoPrincipal() {
    // faixa creme suave atrás do cabeçalho
    doc.setFillColor(...CREAM);
    doc.rect(0, 0, PAGE_W, 104, "F");

    // logotipo oficial (fallback tipográfico se não carregar)
    if (logo) {
      doc.addImage(logo.data, "PNG", MARGIN, 30, LOGO_H * logo.ratio, LOGO_H);
    } else {
      fonte("bold", 21, INK, 1.2);
      doc.text("OWL PRINT", MARGIN, 52);
      reset();
    }
    fonte("normal", 6, GREY, 1.1);
    doc.text("CARDÁPIOS • JOGOS AMERICANOS • PORTA-CONTAS • PORTA-TALHERES", MARGIN, 74);
    reset();

    // bloco de identificação à direita
    fonte("bold", 13, INK, 0.8);
    doc.text(modoLabel, PAGE_W - MARGIN, 40, { align: "right" });
    reset();

    fonte("bold", 10, GOLD, 0.4);
    const ref = [osRef, dados.codigo].filter(Boolean).join("   •   ");
    doc.text(ref, PAGE_W - MARGIN, 56, { align: "right" });
    reset();

    const agora = new Date();
    fonte("normal", 7, GREY);
    doc.text(
      `Emitido em ${agora.toLocaleDateString("pt-BR")} às ${agora
        .toLocaleTimeString("pt-BR")
        .slice(0, 5)}`,
      PAGE_W - MARGIN,
      70,
      { align: "right" }
    );

    // filete duplo: dourado grosso + hairline
    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, 96, CONTENT_W, 2, "F");
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 101, PAGE_W - MARGIN, 101);

    y = 126;
  }

  function cabecalhoSecundario() {
    if (logo) {
      doc.addImage(logo.data, "PNG", MARGIN, 26, 19 * logo.ratio, 19);
    } else {
      fonte("bold", 11, INK, 1);
      doc.text("OWL PRINT", MARGIN, 40);
      reset();
    }
    fonte("normal", 7.5, GREY);
    doc.text(`${osRef}  •  ${(dados.cliente || "").toUpperCase()}`, PAGE_W - MARGIN, 40, {
      align: "right",
    });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 54, PAGE_W - MARGIN, 54);
    y = 76;
  }

  /* ─── título de seção ─── */
  function tituloSecao(titulo: string) {
    espaco(46);
    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, y - 8, 2.5, 11, "F");

    fonte("bold", 9.5, INK, 1.3);
    doc.text(titulo.toUpperCase(), MARGIN + 9, y);
    const largura = doc.getTextWidth(titulo.toUpperCase()) + 1.3 * titulo.length;
    reset();

    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 15 + largura, y - 3, PAGE_W - MARGIN, y - 3);
    y += 12;
  }

  /* ─── grade de campos em 2 colunas ─── */
  type Campo = { label: string; valor: string; destaque?: boolean };

  function celula(x: number, topo: number, campo: Campo, linhas: string[]) {
    fonte("normal", 6.2, GREY, 0.7);
    doc.text(campo.label.toUpperCase(), x, topo + 11);
    reset();
    fonte("bold", 9.2, campo.destaque ? BURGUNDY : INK);
    doc.text(linhas, x, topo + 23);
  }

  function grade(campos: Campo[]) {
    const lista = campos.filter((c) => c.valor && String(c.valor).trim() !== "");
    if (lista.length === 0) return;
    let zebra = 0;

    for (let i = 0; i < lista.length; i += 2) {
      const a = lista[i];
      const b = lista[i + 1];
      doc.setFontSize(9.2);
      doc.setFont("helvetica", "bold");
      const la = doc.splitTextToSize(String(a.valor), COL_W - 16);
      const lb = b ? doc.splitTextToSize(String(b.valor), COL_W - 16) : [];
      const h = Math.max(la.length, lb.length) * 11 + 20;

      if (y + h > FOOTER_Y) novaPagina();

      if (zebra % 2 === 0) {
        doc.setFillColor(...ZEBRA);
        doc.rect(MARGIN, y, CONTENT_W, h, "F");
      }
      celula(MARGIN + 9, y, a, la);
      if (b) celula(MARGIN + COL_W + GUTTER + 9, y, b, lb);

      y += h;
      zebra++;
    }
    y += 12;
  }

  /* ─── parágrafo (campos longos) ─── */
  function paragrafo(label: string, valor?: string | null) {
    if (!valor || String(valor).trim() === "") return;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(String(valor), CONTENT_W - 24);
    const h = linhas.length * 12 + 30;
    if (y + h > FOOTER_Y) novaPagina();

    doc.setFillColor(...ZEBRA);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN, y, CONTENT_W, h - 6, 3, 3, "FD");

    fonte("normal", 6.2, GREY, 0.7);
    doc.text(label.toUpperCase(), MARGIN + 12, y + 14);
    reset();
    fonte("normal", 9, INK);
    doc.text(linhas, MARGIN + 12, y + 27);
    y += h + 6;
  }

  /* ─── bloco resumo ─── */
  function resumo() {
    const stats: Campo[] = [
      { label: "Data de entrada", valor: formatarDataBR(v.dtEntrada) },
      { label: "Data limite", valor: formatarDataBR(v.dtLimite), destaque: true },
      { label: "Inauguração", valor: formatarDataBR(v.inauguracao) },
      { label: "Prioridade", valor: v.prioridade ?? "" },
    ].filter((s) => s.valor);

    const h = 86;
    espaco(h);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.7);
    doc.roundedRect(MARGIN, y, CONTENT_W, h, 4, 4, "FD");
    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, y, 3, h, "F");

    fonte("normal", 6.2, GREY, 0.7);
    doc.text("CLIENTE", MARGIN + 16, y + 18);
    reset();
    fonte("bold", 15, NAVY);
    const nome = doc.splitTextToSize((dados.cliente || "—").toUpperCase(), CONTENT_W - 190);
    doc.text(nome[0], MARGIN + 16, y + 35);

    const tipo = d.cTipo || "";
    if (tipo) {
      fonte("normal", 8.4, GREY);
      doc.text(doc.splitTextToSize(tipo, CONTENT_W - 190)[0], MARGIN + 16, y + 49);
    }

    // vendedor / entrega à direita
    const direita: Campo[] = [
      { label: "Vendedor", valor: v.vendedor ?? "" },
      { label: "Entrega", valor: v.entrega ?? "" },
    ].filter((s) => s.valor);
    let ry = y + 18;
    for (const item of direita) {
      fonte("normal", 6.2, GREY, 0.7);
      doc.text(item.label.toUpperCase(), PAGE_W - MARGIN - 16, ry, { align: "right" });
      reset();
      fonte("bold", 8.6, INK);
      doc.text(doc.splitTextToSize(item.valor, 150)[0], PAGE_W - MARGIN - 16, ry + 11, {
        align: "right",
      });
      ry += 26;
    }

    // faixa inferior com datas
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 16, y + 58, PAGE_W - MARGIN - 16, y + 58);

    const passo = (CONTENT_W - 32) / Math.max(stats.length, 1);
    stats.forEach((s, i) => {
      const x = MARGIN + 16 + passo * i;
      fonte("normal", 6, GREY, 0.6);
      doc.text(s.label.toUpperCase(), x, y + 70);
      reset();
      fonte("bold", 10, s.destaque ? BURGUNDY : INK);
      doc.text(s.valor, x, y + 81);
    });

    y += h + 24;
  }

  /* ─── mockups ─── */
  function imagensGrupo(prefixo: "c" | "i" | "j" | "p" | "d") {
    const srcs = [dados.imagens[`${prefixo}1`], dados.imagens[`${prefixo}2`]].filter(
      (s): s is string => !!s && s.startsWith("data:image")
    );
    if (srcs.length === 0) return;

    const larguraImg = srcs.length > 1 ? (CONTENT_W - 12) / 2 : Math.min(240, CONTENT_W);
    const alturaImg = larguraImg * 0.72;
    if (y + alturaImg + 26 > FOOTER_Y) novaPagina();

    fonte("normal", 6.2, GREY, 0.7);
    doc.text((MOCKUP_GROUP_LABEL[prefixo] ?? "Mockups").toUpperCase(), MARGIN, y + 8);
    reset();
    y += 16;

    srcs.forEach((src, idx) => {
      let formato = src.substring(11, src.indexOf(";")).toUpperCase();
      if (formato !== "PNG" && formato !== "JPEG" && formato !== "JPG") formato = "JPEG";
      const x = MARGIN + idx * (larguraImg + 12);
      try {
        doc.addImage(src, formato, x, y, larguraImg, alturaImg);
      } catch {
        /* imagem inválida — ignora */
      }
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.7);
      doc.rect(x, y, larguraImg, alturaImg);
    });
    y += alturaImg + 20;
  }

  function secaoCampos(titulo: string, campos: CampoOS[], prefixo: "c" | "i" | "j" | "p" | "d") {
    tituloSecao(titulo);
    const curtos: Campo[] = [];
    const longos: CampoOS[] = [];
    for (const campo of campos) {
      if (campo.paragraph) longos.push(campo);
      else curtos.push({ label: campo.label, valor: String(d[campo.key] ?? "") });
    }
    grade(curtos);
    for (const campo of longos) paragrafo(campo.label, d[campo.key]);
    imagensGrupo(prefixo);
  }

  /* ─── tabela de valores ─── */
  function tabelaValores(itens: OsPdfItem[]) {
    tituloSecao("Valores do Orçamento");
    const cols = [MARGIN + 10, MARGIN + 300, MARGIN + 360, PAGE_W - MARGIN - 10];

    espaco(60);
    doc.setFillColor(...NAVY);
    doc.rect(MARGIN, y, CONTENT_W, 20, "F");
    fonte("bold", 7, WHITE, 0.8);
    doc.text("DESCRIÇÃO", cols[0], y + 13);
    doc.text("QTD", cols[1], y + 13);
    doc.text("UNITÁRIO", cols[2], y + 13);
    doc.text("SUBTOTAL", cols[3], y + 13, { align: "right" });
    reset();
    y += 20;

    itens.forEach((it, i) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const linhas = doc.splitTextToSize(it.name || "—", 275);
      const h = linhas.length * 11 + 10;
      if (y + h > FOOTER_Y) novaPagina();
      if (i % 2 === 0) {
        doc.setFillColor(...ZEBRA);
        doc.rect(MARGIN, y, CONTENT_W, h, "F");
      }
      fonte("normal", 9, INK);
      doc.text(linhas, cols[0], y + 13);
      doc.text(String(it.quantity), cols[1], y + 13);
      doc.text(BRL.format(it.unitPrice), cols[2], y + 13);
      fonte("bold", 9, INK);
      doc.text(BRL.format(it.quantity * it.unitPrice), cols[3], y + 13, { align: "right" });
      y += h;
    });

    espaco(34);
    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, y, CONTENT_W, 26, "F");
    fonte("bold", 8, INK, 1);
    doc.text("TOTAL GERAL", cols[0], y + 17);
    reset();
    fonte("bold", 13, INK);
    doc.text(BRL.format(dados.total ?? 0), PAGE_W - MARGIN - 10, y + 18, { align: "right" });
    y += 26 + 20;
  }

  /* ─── assinaturas ─── */
  function assinaturas() {
    const h = 54;
    if (y + h > FOOTER_Y) novaPagina();
    y = Math.max(y, FOOTER_Y - h);
    const larguraLinha = (CONTENT_W - 40) / 2;
    ["Aprovação do Cliente", "Responsável OWL PRINT"].forEach((rot, i) => {
      const x = MARGIN + i * (larguraLinha + 40);
      doc.setDrawColor(...GREY);
      doc.setLineWidth(0.5);
      doc.line(x, y + 26, x + larguraLinha, y + 26);
      fonte("normal", 6.5, GREY, 0.6);
      doc.text(rot.toUpperCase(), x, y + 38);
      reset();
    });
    y += h;
  }

  /* ─── rodapé ─── */
  function rodape() {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, PAGE_H - 38, PAGE_W - MARGIN, PAGE_H - 38);
      fonte("normal", 6.8, GREY);
      doc.text(
        "OWL PRINT  •  owlprintcardapios.com.br  •  documento gerado pelo Sistema de Vendas & Produção",
        MARGIN,
        PAGE_H - 26
      );
      fonte("bold", 6.8, GREY);
      doc.text(`${i} / ${total}`, PAGE_W - MARGIN, PAGE_H - 26, { align: "right" });
    }
  }

  /* ═════════ MONTAGEM ═════════ */
  cabecalhoPrincipal();
  resumo();

  if (v.modo === "CRIACAO" && v.briefing) {
    const b = v.briefing;
    tituloSecao("Briefing de Criação (Novo)");
    const ac: string[] = [];
    if (b.acessorios?.ja) ac.push("Jogos Americanos");
    if (b.acessorios?.pc) ac.push("Porta Contas");
    if (b.acessorios?.disp) ac.push("Displays");
    if (b.acessorios?.na) ac.push("Não Aplicável");
    grade([
      { label: "Quantos Cardápios", valor: String(b.qtd ?? "") },
      { label: "Formato", valor: String(b.formato ?? "") },
      { label: "Modelo", valor: String(b.modelo ?? "") },
      { label: "Fixação", valor: String(b.fixacao ?? "") },
      { label: "Acabamento", valor: String(b.acab ?? "") },
      { label: "Segmento", valor: String(b.segmento ?? "") },
      { label: "Fotos", valor: String(b.fotos ?? "") },
      { label: "Cores", valor: String(b.cores ?? "") },
      { label: "Capa (Pers.)", valor: String(b.capa ?? "") },
      { label: "Acessórios Adicionais", valor: ac.join(", ") },
    ]);
    paragrafo("Template / Referência", b.template);
    paragrafo("Restrições (não pode haver)", b.restricoes);
  }

  if (v.modo === "ALTERACAO" && v.briefing) {
    const b = v.briefing;
    tituloSecao("Briefing de Alteração");
    grade([
      { label: "Quantos Cardápios", valor: String(b.qtd ?? "") },
      { label: "Troca de Fotos", valor: String(b.fotos ?? "") },
      { label: "Tipo de Serviço", valor: String(b.tipo ?? "") },
      { label: "Link da Pasta (Drive)", valor: String(b.driveLink ?? v.driveLink ?? "") },
    ]);
    paragrafo("Quais Páginas / Descrição", b.desc);
  }

  if (v.secoes.cardapio) secaoCampos("Cardápio (Físico)", CAMPOS_CARDAPIO, "c");
  if (v.secoes.impressao) secaoCampos("Impressão", CAMPOS_IMPRESSAO, "i");
  if (v.secoes.ja) secaoCampos("Jogos Americanos", CAMPOS_JA, "j");
  if (v.secoes.pc) secaoCampos("Porta Contas", CAMPOS_PC, "p");
  if (v.secoes.display) secaoCampos("Display", CAMPOS_DISPLAY, "d");

  if (
    !v.secoes.cardapio &&
    !v.secoes.impressao &&
    !v.secoes.ja &&
    !v.secoes.pc &&
    !v.secoes.display &&
    v.modo === "PROD"
  ) {
    tituloSecao("Aviso");
    grade([{ label: "Status", valor: "Nenhum item de produção foi marcado neste pedido." }]);
  }

  if (dados.itens && dados.itens.length > 0) tabelaValores(dados.itens);
  if (dados.notes) {
    tituloSecao("Observações Gerais");
    paragrafo("Anotações", dados.notes);
  }

  assinaturas();
  rodape();

  const nomeArquivo = `OS_${v.nPedido || dados.codigo || "SN"}_${(dados.cliente || "CLIENTE")
    .replace(/[^A-Z0-9]/gi, "_")
    .replace(/_+/g, "_")}.pdf`;
  doc.save(nomeArquivo);
}
