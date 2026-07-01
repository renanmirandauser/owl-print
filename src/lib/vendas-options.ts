/* ══════════════════════════════════════════════════════════════════
   SISTEMA DE VENDAS OWL PRINT — catálogo de opções
   Portado 1:1 do arquivo SISTEMA_DE_VENDAS_OWL_PRINT.html.
   Todas as listas de selects vivem aqui para manter o builder,
   a página de detalhe e o PDF sempre sincronizados.
   ══════════════════════════════════════════════════════════════════ */

export const OS_MODOS = ["PROD", "CRIACAO", "ALTERACAO"] as const;
export type OsModo = (typeof OS_MODOS)[number];

export const OS_MODO_LABEL: Record<OsModo, string> = {
  PROD: "Produção",
  CRIACAO: "Criação",
  ALTERACAO: "Alteração",
};

export const VENDEDORES = ["RENAN", "RAYSSA", "MICHEL"];

export const ENTREGAS = [
  "CORREIOS (MÁX 28KG)",
  "LALAMOVE OU 99 MOTO",
  "LALAMOVE OU 99 CARRO",
  "LALAMOVE OU 99 FIORINO",
  "LALAMOVE OU 99 FURGÃO",
  "SOLICITAR COLETA",
  "VENDEDOR ENTREGA",
  "CLIENTE RETIRA",
];

export const PRIORIDADES = ["NORMAL", "MEDIA", "ALTA"];

/* ─── Briefing de Criação ──────────────────────────────────────── */
export const CRI_FORMATOS = ["A4", "i33", "i30", "i40", "i50", "A433", "A5 Horizontal", "A5 Vertical", "Especial (Ver Obs)"];
export const CRI_MODELOS = ["Capa Dura", "Prancheta", "Gráfico"];
export const CRI_FIXACOES = ["Divisória PET", "Elástico (x4)", "Parafuso", "Grampo (x4)", "Não aplicável", "Especial"];
export const CRI_ACABAMENTOS = ["Refile", "Vincos", "Furos", "Nenhum"];
export const CRI_FOTOS = ["Banco de Imagens OWL PRINT", "Cliente envia", "Sem fotos", "Usar Vetores"];
export const CRI_CORES = ["Cores do Logo", "Manual da Marca (Anexo)", "Ref. Instagram (Ver Obs)"];
export const CRI_CAPAS = ["Baixo Relevo", "Silk", "Couro Impresso", "Outro"];

/* ─── Briefing de Alteração ────────────────────────────────────── */
export const ALT_FOTOS = [
  { value: "NAO", label: "Não" },
  { value: "SIM", label: "Sim (Inclusão/Troca)" },
];
export const ALT_TIPOS = [
  { value: "SIMPLES", label: "Alteração Simples" },
  { value: "REDIAGRAMACAO", label: "Rediagramação" },
];

/* ─── Seção: Cardápio (Físico) ─────────────────────────────────── */
export const C_TIPOS = [
  "CARDÁPIO COM CAPA DURA", "CARDÁPIO COM CAPA FLEXÍVEL", "CARDÁPIO EM POLASEAL",
  "CARDÁPIO VERSÁTIL", "PRANCHETA DE MADEIRA", "PRANCHETA EM COURO SINTETICO",
  "CARDAPIO GRAFICO (VER OBS)", "ENVELOPE", "REFORMA",
];
export const C_FORMATOS = ["A4", "i33", "i30", "i40", "i50", "A433", "13x30", "18x30", "ESPECIAL"];
export const C_MATERIAIS_CAPA = [
  "CEDRO", "DOLARO", "DUNI", "URUGUAI", "SEVILE", "DENVER", "EROS", "LAMINADO",
  "COURO IMPRESSO", "SINTETICO LAMINADO", "SINTETICO + COURO IMPRESSO",
  "MADEIRA", "COURO LEGITIMO", "ESPECIAL", "NÃO APLICAVEL",
];
export const C_CORES_CAPA = [
  "PRETO", "MARROM CAFÉ", "INDIANO", "VERDE", "VINHO", "AZUL", "VERMELHO",
  "TERRA COTA", "OCRE", "BEGE", "NÃO APLICAVEL", "ESPECIAL",
];
export const C_TRISSETS = ["NÃO", "NA LOMBADA", "JANELA", "ESPECIAL"];
export const C_COSTURAS = ["PADRÃO OWL PRINT", "RETA LOMBADA", "TRANSVERSAL", "TRANSVERSAL ONDULADA", "SEM COSTURA", "ESPECIAL"];
export const C_CORES_LINHA = ["PRETO", "MARROM CAFÉ", "VERDE", "VINHO", "AZUL", "VERMELHO", "TERRA COTA", "OCRE", "BEGE", "ESPECIAL", "NÃO APLICAVEL"];
export const C_FIXACOES = [
  "PARAFUSO PADRÃO OWL PRINT", "BROCHURA", "ELASTICO", "PARAFUSO MADEIRINHA FIXA",
  "MADEIRINHA SUPERIOR", "MADEIRINHA LATERAL", "ESPIRAL", "ARGOLAS", "WYRE-O", "FERRAGEM", "GRAMPO",
];
export const C_TIPOS_DIV = ["NÃO APLICAVEL", "PET COM SOLDA", "PET COM DEBRUM", "KRAFT + CANTONEIRAS BICO", "COUCHE LAMINADO"];
export const C_PERS = [
  "NÃO APLICAVEL", "SILK", "CLICHE NOVO", "CLICHE JÁ TEMOS",
  "HOT STAMPING DOURADO", "HOT STAMPING PRATA", "IMPRESSÃO UV RICK", "GRAVAÇÃO A LASER",
];
export const C_POS_FRENTE = ["PADRÃO OWL PRINT", "CENTRALIZADO", "RODAPÉ CENTRALIZADO", "ESPECIAL", "NÃO APLICAVEL"];
export const C_POS_VERSO = ["NÃO APLICAVEL", "PADRÃO OWL PRINT", "CENTRALIZADO", "RODAPÉ CENTRALIZADO"];
export const CONTRA_CAPAS = [
  "PET", "MESMO MATERIAL", "MESMO MAT + FRISO", "MESMO MAT + BICO",
  "KRAFT + FRISO", "KRAFT + BICO", "2 FILIPETAS PET", "3 FILIPETAS PET",
];
export const C_CORES_ACAB = ["PRETO", "MARROM CAFÉ", "VERDE", "VINHO", "AZUL", "VERMELHO", "ESPECIAL"];
export const C_FILIPETAS = ["NÃO", "SIM, DESCREVA EM OBSERVAÇÃO"];
export const C_QUADROS = ["NÃO APLICAVEL", "PAGINA INTEIRA", "MEIA PAGINA"];
export const C_CANTONEIRAS = ["NÃO APLICAVEL", "PRATA", "DOURADA"];

/* ─── Seção: Impressão ─────────────────────────────────────────── */
export const I_PAPEIS = ["COUCHE FRENTE", "COUCHE FV", "RECICLATO FRENTE", "RECICLATO FV", "PAPEL ESPECIAL"];
export const I_TAMANHOS = ["A4", "A3", "i33", "i30", "i40", "i50", "A433", "A5 VERTICAL", "A5 HORIZONTAL", "18X30", "13X30", "ESPECIAL"];
export const I_LAMINACOES = ["SEM LAMINAÇÃO", "BRILHO", "FOSCA"];
export const I_ACABAMENTOS = ["REFILE", "VINCO", "ELÁSTICO", "DIVISÓRIA PET", "GRAMPO", "PARAFUSO", "ARGOLA", "ESPIRAL", "WYRE-O", "CANTONEIRA"];

/* ─── Seção: Jogos Americanos ──────────────────────────────────── */
export const J_FORMATOS = ["29 CM x 39 CM", "29 CM x 43 CM", "TOALHA", "TRAPEZIO", "SEXTAVADO", "ELIPSE", "OVAL", "REDONDO", "M1", "M2", "ESPECIAL"];
export const J_MATERIAIS = ["CEDRO", "DOLARO", "DUNI", "URUGUAI", "SEVILE", "DENVER", "EROS", "BOX", "COURO IMPRESSO"];
export const J_CORES_FRENTE = ["PRETO", "MARROM CAFÉ", "INDIANO", "VERDE", "VINHO", "AZUL", "VERMELHO", "TERRA COTA", "OCRE", "BRANCO", "ESPECIAL"];
export const J_CORES_VERSO = ["NÃO APLICAVEL", ...J_CORES_FRENTE];
export const J_PERS = ["NÃO APLICÁVEL", "CLICHÊ (JÁ TEMOS)", "CLICHÊ (NOVO)", "SILK CLEZIO", "UV RICK"];
export const J_POSICOES = ["NÃO APLICAVEL", "INFERIOR DIREITO", "ESPECIAL"];
export const J_COSTURAS = ["PADRÃO OWL PRINT", "JOGO DA VELHA", "TALHER"];
export const J_CORES_LINHA = ["PRETO", "MARROM CAFÉ", "VERDE", "VINHO", "AZUL", "VERMELHO", "TERRA COTA", "OCRE", "BEGE"];

/* ─── Seção: Porta Contas ──────────────────────────────────────── */
export const PC_TIPOS = ["PORTA CONTA COM CAPA DURA", "PORTA CONTA COM CAPA FLEXÍVEL", "PORTA CONTA PRANCHETA"];
export const PC_MATERIAIS = ["CEDRO", "DOLARO", "DUNI", "COURO IMPRESSO", "SINTETICO + LAMINADO", "SINTETICO + COURO IMPRESSO", "MADEIRA", "LAMINADO"];
export const PC_CORES = ["PRETO", "MARROM CAFÉ", "VERDE", "VINHO", "AZUL", "VERMELHO", "TERRA COTA", "OCRE", "INDIANO", "BEGE"];
export const PC_COSTURAS = ["PADRÃO OWL PRINT", "RETA LOMBADA", "TRANSVERSAL", "TRANSVERSAL ONDULADA"];
export const PC_CORES_LINHA = ["PRETO", "MARROM CAFÉ", "VERDE", "VINHO", "AZUL", "VERMELHO", "TERRA COTA", "OCRE", "BEGE"];
export const PC_PERS = ["NÃO APLICÁVEL", "CLICHÊ (JÁ TEMOS)", "CLICHÊ NOVO", "SILK CLEZIO", "GRAVAÇÃO UV RICK", "LASER"];
export const PC_POSICOES = ["NÃO APLICÁVEL", "PADRÃO OWL PRINT", "CENTRALIZADO", "INFERIOR DIREITO", "RODAPÉ CENTRALIZADO"];

/* ─── Seção: Display ───────────────────────────────────────────── */
export const D_TIPOS = ["2 FACES", "3 FACES", "ACRILICO"];
export const D_MEDIDAS = ["10X15", "ESPECIAL"];
export const D_MATERIAIS = ["CEDRO", "DOLARO", "DUNI", "URUGUAI", "SEVILE", "DENVER", "EROS", "LAMINADO", "COURO IMPRESSO", "MADEIRA"];
export const D_CORES = ["PRETO", "MARROM CAFÉ", "INDIANO", "VERDE", "VINHO", "AZUL", "VERMELHO", "TERRA COTA", "OCRE", "BEGE"];
export const D_FIXACOES = ["CANTONEIRAS RETAS", "CANTONEIRAS FRISO", "ARGOLA", "NÃO"];
export const D_PERS = ["NÃO", "CLICHE", "SILK", "UV"];
export const D_POSICOES = ["NÃO APLICÁVEL", "PADRÃO OWL PRINT", "CENTRALIZADO", "INFERIOR DIREITO", "RODAPÉ CENTRALIZADO"];

/* ─── Chaves de mockup (2 imagens por seção, igual ao HTML) ────── */
export const MOCKUP_KEYS = ["c1", "c2", "i1", "i2", "j1", "j2", "p1", "p2", "d1", "d2"] as const;
export type MockupKey = (typeof MOCKUP_KEYS)[number];

export const MOCKUP_GROUP_LABEL: Record<string, string> = {
  c: "Mockups do Cardápio",
  i: "Mockups de Impressão",
  j: "Mockups de Jogos Americanos",
  p: "Mockups de Porta Contas",
  d: "Mockups de Display",
};

/* ══════════════════════════════════════════════════════════════════
   Estrutura de dados da OS (Ordem de Serviço / Sistema de Vendas)
   ══════════════════════════════════════════════════════════════════ */

export interface OsSecoes {
  cardapio: boolean;
  impressao: boolean;
  ja: boolean;
  pc: boolean;
  display: boolean;
}

export interface BriefingCriacao {
  qtd?: string;
  formato?: string;
  modelo?: string;
  fixacao?: string;
  acab?: string;
  segmento?: string;
  template?: string;
  fotos?: string;
  cores?: string;
  capa?: string;
  restricoes?: string;
  acessorios?: { ja?: boolean; pc?: boolean; disp?: boolean; na?: boolean };
}

export interface BriefingAlteracao {
  qtd?: string;
  fotos?: string;
  tipo?: string;
  desc?: string;
  driveLink?: string;
}

export interface OsMockup {
  key: string;
  url: string;
  publicId?: string;
}

export interface OsVendas {
  modo: OsModo;
  nPedido?: string;
  vendedor?: string;
  entrega?: string;
  prioridade?: string;
  dtEntrada?: string; // yyyy-mm-dd
  dtLimite?: string; // yyyy-mm-dd
  inauguracao?: string; // yyyy-mm-dd
  secoes: OsSecoes;
  detalhes: Record<string, string>;
  briefing?: (BriefingCriacao & BriefingAlteracao) | null;
  mockups: OsMockup[];
  driveLink?: string;
}

export const SECOES_VAZIAS: OsSecoes = {
  cardapio: false,
  impressao: false,
  ja: false,
  pc: false,
  display: false,
};

/* ─── Labels para renderização (detalhe / impressão / PDF) ─────── */
/* A ordem dos campos abaixo espelha exatamente a ordem do PDF do HTML. */

export type CampoOS = { key: string; label: string; paragraph?: boolean };

export const CAMPOS_CARDAPIO: CampoOS[] = [
  { key: "cTipo", label: "Tipo" },
  { key: "cQtdPed", label: "Qtd Pedido" },
  { key: "cQtdProd", label: "Qtd Produção" },
  { key: "cFormato", label: "Formato" },
  { key: "cMatCapa", label: "Material da Capa" },
  { key: "cCorCapa", label: "Cor da Capa" },
  { key: "cTrisse", label: "Trisset" },
  { key: "cCostura", label: "Costura" },
  { key: "cCorLinha", label: "Cor da Linha" },
  { key: "cFixacao", label: "Fixação" },
  { key: "cTipoDiv", label: "Tipo de Divisórias" },
  { key: "cQtdDiv", label: "Qtd Divisórias por Cardápio" },
  { key: "cPersCapa", label: "Pers. Frente" },
  { key: "cPosCapa", label: "Posição Frente" },
  { key: "cPersVerso", label: "Pers. Verso" },
  { key: "cPosVerso", label: "Posição Verso" },
  { key: "cCC1", label: "Contra Capa 1" },
  { key: "cCC2", label: "Contra Capa 2" },
  { key: "cCorAcab", label: "Cor Acabamento" },
  { key: "cFilipeta", label: "Filipeta" },
  { key: "cQuadro", label: "Quadro" },
  { key: "cCantoneira", label: "Cantoneira" },
  { key: "cObs", label: "Observações", paragraph: true },
];

export const CAMPOS_IMPRESSAO: CampoOS[] = [
  { key: "iQtdCard", label: "Qtd Cardápios" },
  { key: "iPagCard", label: "Páginas por Cardápio" },
  { key: "iTotalImp", label: "Total de Impressões" },
  { key: "iPapel", label: "Papel" },
  { key: "iTamanho", label: "Tamanho" },
  { key: "iLam", label: "Laminação" },
  { key: "iAcab", label: "Acabamento" },
  { key: "iObs", label: "Obs Impressão", paragraph: true },
];

export const CAMPOS_JA: CampoOS[] = [
  { key: "jQtd", label: "Quantidade" },
  { key: "jFormato", label: "Formato" },
  { key: "jMatF", label: "Material Frente" },
  { key: "jCorF", label: "Cor Frente" },
  { key: "jPersF", label: "Pers. Frente" },
  { key: "jPosF", label: "Posição Frente" },
  { key: "jMatV", label: "Material Verso" },
  { key: "jCorV", label: "Cor Verso" },
  { key: "jPersV", label: "Pers. Verso" },
  { key: "jPosV", label: "Posição Verso" },
  { key: "jCostura", label: "Costura" },
  { key: "jLinha", label: "Cor da Linha" },
  { key: "jObs", label: "Obs JA", paragraph: true },
];

export const CAMPOS_PC: CampoOS[] = [
  { key: "pcQtd", label: "Quantidade" },
  { key: "pcTipo", label: "Tipo" },
  { key: "pcMat", label: "Material" },
  { key: "pcCor", label: "Cor" },
  { key: "pcCC1", label: "Contra Capa 1" },
  { key: "pcCC2", label: "Contra Capa 2" },
  { key: "pcCostura", label: "Costura" },
  { key: "pcLinha", label: "Cor da Linha" },
  { key: "pcPers", label: "Personalização" },
  { key: "pcPosPers", label: "Posição" },
];

export const CAMPOS_DISPLAY: CampoOS[] = [
  { key: "dQtd", label: "Quantidade" },
  { key: "dTipo", label: "Tipo" },
  { key: "dMedida", label: "Medida" },
  { key: "dMat", label: "Material" },
  { key: "dCor", label: "Cor" },
  { key: "dFixacao", label: "Fixação" },
  { key: "dPers", label: "Personalização" },
  { key: "dPosPers", label: "Posição" },
];

/** Calcula a data limite: hoje + N dias úteis (padrão 15, igual ao HTML). */
export function calcularDataLimite(base: Date, diasUteis = 15): Date {
  let contados = 0;
  const d = new Date(base);
  while (contados < diasUteis) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) contados++;
  }
  return d;
}

/** yyyy-mm-dd → dd/mm/yyyy (mesma formatação do HTML). */
export function formatarDataBR(valor?: string | null): string {
  if (!valor) return "";
  const partes = String(valor).slice(0, 10).split("-");
  if (partes.length !== 3) return String(valor);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/** Date → yyyy-mm-dd no fuso local. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
