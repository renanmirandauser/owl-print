/* ══════════════════════════════════════════════════════════════════
   GERAÇÃO DE PDF DA OS — OWL PRINT
   Porte 1:1 do gerarPDF() do SISTEMA_DE_VENDAS_OWL_PRINT.html
   (jsPDF via CDN, mesmo layout: cabeçalho, seções, linhas, imagens,
   rodapé com paginação), adaptado à identidade visual oficial do
   sistema: azul-marinho (#15395B) + dourado champagne (#BF9B4F).
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

/* Identidade OWL PRINT (tailwind.config.ts) em RGB */
const PDF_NAVY: [number, number, number] = [21, 57, 91]; // leather #15395B
const PDF_GOLD: [number, number, number] = [191, 155, 79]; // champagne #BF9B4F
const PDF_INK: [number, number, number] = [18, 39, 63]; // ink #12273F
const PDF_GREY: [number, number, number] = [110, 115, 125];
const PDF_CREAM: [number, number, number] = [247, 245, 239]; // cream #F7F5EF

const PAGE_W = 595.28;
const PAGE_H = 841.89; // A4 em pt
const MARGIN = 40;

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
  imagens: Partial<Record<string, string>>; // key: c1..d2 → dataURL
  itens?: OsPdfItem[];
  total?: number;
  notes?: string;
}

/* ─── Carregamento do jsPDF via CDN (igual ao HTML) ────────────── */

declare global {
  interface Window {
    jspdf?: { jsPDF: new (opts: { unit: string; format: string }) => JsPdfDoc };
  }
}

/* Tipagem mínima do jsPDF usada aqui */
interface JsPdfDoc {
  addPage(): void;
  setPage(n: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  setLineWidth(w: number): void;
  setTextColor(r: number, g: number, b: number): void;
  setFont(f: string, s: string): void;
  setFontSize(n: number): void;
  rect(x: number, y: number, w: number, h: number, style?: string): void;
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

/* Converte URL (Cloudinary) em dataURL para embutir no PDF */
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

const BRL_FMT = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/* ─── Geração do documento ─────────────────────────────────────── */

export async function gerarPdfOS(dados: OsPdfData): Promise<void> {
  await loadJsPdf();
  if (!window.jspdf) throw new Error("Biblioteca de PDF indisponível.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const v = dados.vendas;
  const d = v.detalhes ?? {};
  let y = 0;

  function novaPagina() {
    doc.addPage();
    y = MARGIN;
    cabecalhoSecundario();
  }
  function checkSpace(altura: number) {
    if (y + altura > PAGE_H - 60) novaPagina();
  }

  function cabecalhoPrincipal() {
    // Barra superior azul-marinho + filete dourado (identidade oficial)
    doc.setFillColor(...PDF_INK);
    doc.rect(0, 0, PAGE_W, 92, "F");
    doc.setFillColor(...PDF_GOLD);
    doc.rect(0, 92, PAGE_W, 3, "F");

    doc.setTextColor(...PDF_GOLD);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("OWL PRINT", MARGIN, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_CREAM);
    doc.text("CARDÁPIOS, PLACEMATS E ACESSÓRIOS EM COURO SINTÉTICO", MARGIN, 56);

    const modoLabel =
      v.modo === "CRIACAO"
        ? "BRIEFING DE CRIAÇÃO"
        : v.modo === "ALTERACAO"
          ? "BRIEFING DE ALTERAÇÃO"
          : "ORDEM DE SERVIÇO";
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(modoLabel, PAGE_W - MARGIN, 32, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_GOLD);
    const ref = [v.nPedido ? `OS #${v.nPedido}` : "OS #—", dados.codigo ? `• ${dados.codigo}` : ""]
      .filter(Boolean)
      .join(" ");
    doc.text(ref, PAGE_W - MARGIN, 48, { align: "right" });
    doc.setTextColor(...PDF_CREAM);
    doc.setFontSize(8);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date()
        .toLocaleTimeString("pt-BR")
        .slice(0, 5)}`,
      PAGE_W - MARGIN,
      60,
      { align: "right" }
    );
    y = 115;
  }

  function cabecalhoSecundario() {
    doc.setFillColor(...PDF_INK);
    doc.rect(0, 0, PAGE_W, 34, "F");
    doc.setTextColor(...PDF_GOLD);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OWL PRINT", MARGIN, 22);
    doc.setTextColor(...PDF_CREAM);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`OS #${v.nPedido || "—"}  •  ${dados.cliente || ""}`, PAGE_W - MARGIN, 22, {
      align: "right",
    });
    y = 55;
  }

  function tituloSecao(titulo: string) {
    checkSpace(30);
    doc.setFillColor(...PDF_GOLD);
    doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 20, "F");
    doc.setTextColor(...PDF_INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(titulo.toUpperCase(), MARGIN + 8, y + 14);
    y += 30;
  }

  function linha(label: string, valor?: string | number | null) {
    if (valor === undefined || valor === null || String(valor).trim() === "") return;
    checkSpace(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_NAVY);
    doc.text(String(label).toUpperCase() + ":", MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 44, 52);
    const texto = doc.splitTextToSize(String(valor), PAGE_W - MARGIN - 190);
    doc.text(texto, MARGIN + 155, y);
    y += Math.max(15, texto.length * 12);
  }

  function paragrafo(label: string, valor?: string | null) {
    if (!valor || String(valor).trim() === "") return;
    checkSpace(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_NAVY);
    doc.text(String(label).toUpperCase() + ":", MARGIN, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 44, 52);
    const texto = doc.splitTextToSize(String(valor), PAGE_W - MARGIN * 2);
    checkSpace(texto.length * 12);
    doc.text(texto, MARGIN, y);
    y += texto.length * 12 + 6;
  }

  const espacador = (h: number) => {
    y += h;
  };

  function imagensGrupo(prefixo: "c" | "i" | "j" | "p" | "d") {
    const srcs = [dados.imagens[`${prefixo}1`], dados.imagens[`${prefixo}2`]].filter(
      (s): s is string => !!s && s.startsWith("data:image")
    );
    if (srcs.length === 0) return;
    checkSpace(150);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_NAVY);
    doc.text((MOCKUP_GROUP_LABEL[prefixo] ?? "Mockups").toUpperCase(), MARGIN, y);
    y += 10;
    const larguraTotal = PAGE_W - MARGIN * 2;
    const larguraImg = srcs.length > 1 ? (larguraTotal - 10) / 2 : Math.min(220, larguraTotal);
    const alturaImg = larguraImg * 0.72;
    srcs.forEach((src, idx) => {
      let formato = src.substring(11, src.indexOf(";")).toUpperCase();
      if (formato !== "PNG" && formato !== "JPEG" && formato !== "JPG") formato = "JPEG";
      const x = MARGIN + idx * (larguraImg + 10);
      try {
        doc.addImage(src, formato, x, y, larguraImg, alturaImg);
      } catch {
        /* imagem inválida — ignora, igual ao HTML */
      }
      doc.setDrawColor(...PDF_GOLD);
      doc.rect(x, y, larguraImg, alturaImg);
    });
    y += alturaImg + 16;
  }

  function secaoCampos(titulo: string, campos: CampoOS[], prefixo: "c" | "i" | "j" | "p" | "d") {
    tituloSecao(titulo);
    for (const campo of campos) {
      const valor = d[campo.key];
      if (campo.paragraph) paragrafo(campo.label, valor);
      else linha(campo.label, valor);
    }
    imagensGrupo(prefixo);
    espacador(6);
  }

  function rodape() {
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setDrawColor(...PDF_GOLD);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, PAGE_H - 42, PAGE_W - MARGIN, PAGE_H - 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...PDF_GREY);
      doc.text(
        "OWL PRINT — Ordem de Serviço gerada automaticamente pelo Sistema de Vendas",
        MARGIN,
        PAGE_H - 30
      );
      doc.text(`Página ${i} de ${totalPaginas}`, PAGE_W - MARGIN, PAGE_H - 30, { align: "right" });
    }
  }

  /* ===== MONTAGEM DO DOCUMENTO (mesma ordem do HTML) ===== */
  cabecalhoPrincipal();

  tituloSecao("Resumo do Pedido");
  linha("Cliente", dados.cliente);
  linha("Vendedor", v.vendedor);
  linha("Tipo Principal", d.cTipo);
  linha("Quantidade", d.cQtdPed || d.jQtd || d.pcQtd || d.dQtd);
  linha("Data de Entrada", formatarDataBR(v.dtEntrada));
  linha("Data Limite", formatarDataBR(v.dtLimite));
  linha("Inauguração", formatarDataBR(v.inauguracao));
  linha("Entrega", v.entrega);
  linha("Prioridade", v.prioridade);
  espacador(6);

  // Briefing de Criação
  if (v.modo === "CRIACAO" && v.briefing) {
    const b = v.briefing;
    tituloSecao("Briefing de Criação (Novo)");
    linha("Quantos Cardápios", b.qtd);
    linha("Formato", b.formato);
    linha("Modelo", b.modelo);
    linha("Fixação", b.fixacao);
    linha("Acabamento", b.acab);
    linha("Segmento", b.segmento);
    linha("Fotos", b.fotos);
    linha("Cores", b.cores);
    linha("Capa (Pers.)", b.capa);
    if (b.acessorios) {
      const ac: string[] = [];
      if (b.acessorios.ja) ac.push("Jogos Americanos");
      if (b.acessorios.pc) ac.push("Porta Contas");
      if (b.acessorios.disp) ac.push("Displays");
      if (b.acessorios.na) ac.push("Não Aplicável");
      linha("Acessórios Adicionais", ac.join(", "));
    }
    paragrafo("Template / Referência", b.template);
    paragrafo("Restrições (não pode haver)", b.restricoes);
    espacador(6);
  }

  // Briefing de Alteração
  if (v.modo === "ALTERACAO" && v.briefing) {
    const b = v.briefing;
    tituloSecao("Briefing de Alteração");
    linha("Quantos Cardápios", b.qtd);
    linha("Troca de Fotos", b.fotos);
    linha("Tipo de Serviço", b.tipo);
    linha("Link da Pasta (Drive)", b.driveLink || v.driveLink);
    paragrafo("Quais Páginas / Descrição", b.desc);
    espacador(6);
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
    linha("Status", "Nenhum item de produção foi marcado neste pedido.");
  }

  // Valores do orçamento (integração ERP — só imprime se houver itens)
  if (dados.itens && dados.itens.length > 0) {
    tituloSecao("Valores do Orçamento");
    for (const it of dados.itens) {
      linha(
        it.name,
        `${it.quantity} × ${BRL_FMT.format(it.unitPrice)} = ${BRL_FMT.format(
          it.quantity * it.unitPrice
        )}`
      );
    }
    checkSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PDF_NAVY);
    doc.text(`TOTAL: ${BRL_FMT.format(dados.total ?? 0)}`, PAGE_W - MARGIN, y, { align: "right" });
    y += 18;
    espacador(4);
  }

  if (dados.notes) paragrafo("Observações Gerais", dados.notes);

  rodape();

  const nomeArquivo = `OS_${v.nPedido || dados.codigo || "SN"}_${(dados.cliente || "CLIENTE").replace(
    /[^A-Z0-9]/gi,
    "_"
  )}.pdf`;
  doc.save(nomeArquivo);
}
