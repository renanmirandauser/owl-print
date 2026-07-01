"use client";

/* ══════════════════════════════════════════════════════════════════
   SISTEMA DE VENDAS OWL PRINT — Builder de OS / Orçamento
   Porte completo do SISTEMA_DE_VENDAS_OWL_PRINT.html para dentro
   do ERP, com a identidade visual oficial (azul-marinho + champagne).

   Funcionalidades portadas 1:1 do HTML:
   • Seletor de modo: PRODUÇÃO / CRIAÇÃO / ALTERAÇÃO
   • Datas automáticas: entrada = hoje; limite = +15 dias úteis
   • Título da aba: "os {nº} {cliente}" (atualizarTitulo)
   • Briefing de Criação (com acessórios e restrições)
   • Briefing de Alteração (com link de pasta do Drive)
   • 5 seções opcionais: Cardápio, Impressão, Jogos Americanos,
     Porta Contas e Display — com TODAS as opções originais
   • Total de impressões automático (qtd × páginas)
   • Replicar formato do Cardápio → Impressão
   • 2 mockups por seção com preview (upload real via Cloudinary)
   • Busca de histórico do cliente (agora com retorno REAL do banco)
   • Botão principal muda conforme o modo
   • GERAR PDF DA OS (SEM SALVAR) — jsPDF, mesmo layout do HTML
   • NOVO PEDIDO (LIMPAR TELA)

   Integrações com o ERP:
   • Vínculo opcional com lead do CRM (preenche contato)
   • Seção opcional de Valores (itens/preços) → total, WhatsApp,
     e-mail e geração de Pedido de Produção continuam funcionando
   ══════════════════════════════════════════════════════════════════ */

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Factory,
  Palette,
  RefreshCcw,
  Camera,
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  FileDown,
  Eraser,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  createQuote,
  updateQuote,
  uploadOsMockup,
  getClientOsHistory,
  type QuoteInput,
} from "@/actions/quotes";
import type { ClientOption } from "@/actions/clients";
import { BRL } from "@/lib/utils";
import { gerarPdfOS, urlToDataUrl } from "@/lib/os-pdf";
import {
  type OsModo,
  type OsVendas,
  type OsMockup,
  type MockupKey,
  MOCKUP_KEYS,
  SECOES_VAZIAS,
  VENDEDORES,
  ENTREGAS,
  PRIORIDADES,
  CRI_FORMATOS,
  CRI_MODELOS,
  CRI_FIXACOES,
  CRI_ACABAMENTOS,
  CRI_FOTOS,
  CRI_CORES,
  CRI_CAPAS,
  ALT_FOTOS,
  ALT_TIPOS,
  C_TIPOS,
  C_FORMATOS,
  C_MATERIAIS_CAPA,
  C_CORES_CAPA,
  C_TRISSETS,
  C_COSTURAS,
  C_CORES_LINHA,
  C_FIXACOES,
  C_TIPOS_DIV,
  C_PERS,
  C_POS_FRENTE,
  C_POS_VERSO,
  CONTRA_CAPAS,
  C_CORES_ACAB,
  C_FILIPETAS,
  C_QUADROS,
  C_CANTONEIRAS,
  I_PAPEIS,
  I_TAMANHOS,
  I_LAMINACOES,
  I_ACABAMENTOS,
  J_FORMATOS,
  J_MATERIAIS,
  J_CORES_FRENTE,
  J_CORES_VERSO,
  J_PERS,
  J_POSICOES,
  J_COSTURAS,
  J_CORES_LINHA,
  PC_TIPOS,
  PC_MATERIAIS,
  PC_CORES,
  PC_COSTURAS,
  PC_CORES_LINHA,
  PC_PERS,
  PC_POSICOES,
  D_TIPOS,
  D_MEDIDAS,
  D_MATERIAIS,
  D_CORES,
  D_FIXACOES,
  D_PERS,
  D_POSICOES,
  calcularDataLimite,
  toISODate,
} from "@/lib/vendas-options";

/* ─── estilos base (identidade do sistema) ─────────────────────── */

const inputCls =
  "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30 disabled:bg-cream/60";

const labelCls = "mb-1 block text-xs font-semibold text-leather/60";

interface ItemRow {
  name: string;
  quantity: number | string;
  unitPrice: number | string;
}

interface Props {
  quoteId?: string;
  clients?: ClientOption[];
  products?: string[];
  defaultValues?: Partial<QuoteInput>;
  defaultVendas?: OsVendas | null;
}

export function SalesOrderBuilder({
  quoteId,
  clients = [],
  products = [],
  defaultValues,
  defaultVendas,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ─── modo ─── */
  const [modo, setModo] = useState<OsModo>(defaultVendas?.modo ?? "PROD");

  /* ─── dados do pedido / cliente ─── */
  const [cliente, setCliente] = useState(defaultValues?.clientName ?? "");
  const [clientId, setClientId] = useState(defaultValues?.clientId ?? "");
  const [clientPhone, setClientPhone] = useState(defaultValues?.clientPhone ?? "");
  const [clientEmail, setClientEmail] = useState(defaultValues?.clientEmail ?? "");
  const [nPedido, setNPedido] = useState(defaultVendas?.nPedido ?? "");
  const [vendedor, setVendedor] = useState(defaultVendas?.vendedor ?? "");
  const [entrega, setEntrega] = useState(defaultVendas?.entrega ?? "");
  const [prioridade, setPrioridade] = useState(defaultVendas?.prioridade ?? "");
  const [dtEntrada, setDtEntrada] = useState(defaultVendas?.dtEntrada ?? "");
  const [dtLimite, setDtLimite] = useState(defaultVendas?.dtLimite ?? "");
  const [inauguracao, setInauguracao] = useState(defaultVendas?.inauguracao ?? "");

  /* ─── seções e detalhes ─── */
  const [secoes, setSecoes] = useState({ ...SECOES_VAZIAS, ...(defaultVendas?.secoes ?? {}) });
  const [det, setDetState] = useState<Record<string, string>>(defaultVendas?.detalhes ?? {});

  /* ─── briefings ─── */
  const b0: Partial<NonNullable<OsVendas["briefing"]>> = defaultVendas?.briefing ?? {};
  const [briCri, setBriCri] = useState({
    qtd: b0.qtd ?? "",
    formato: b0.formato ?? "",
    modelo: b0.modelo ?? "",
    fixacao: b0.fixacao ?? "",
    acab: b0.acab ?? "",
    segmento: b0.segmento ?? "",
    template: b0.template ?? "",
    fotos: b0.fotos ?? "",
    cores: b0.cores ?? "",
    capa: b0.capa ?? "",
    restricoes: b0.restricoes ?? "",
    acJa: b0.acessorios?.ja ?? false,
    acPc: b0.acessorios?.pc ?? false,
    acDisp: b0.acessorios?.disp ?? false,
    acNa: b0.acessorios?.na ?? false,
  });
  const [briAlt, setBriAlt] = useState({
    qtd: b0.qtd ?? "",
    fotos: b0.fotos ?? "NAO",
    tipo: b0.tipo ?? "SIMPLES",
    desc: b0.desc ?? "",
  });
  const [driveLink, setDriveLink] = useState(
    defaultVendas?.driveLink ?? b0.driveLink ?? ""
  );

  /* ─── mockups ─── */
  // previews: o que aparece na tela (dataURL local ou URL Cloudinary salva)
  const [previews, setPreviews] = useState<Partial<Record<MockupKey, string>>>(() => {
    const p: Partial<Record<MockupKey, string>> = {};
    for (const m of defaultVendas?.mockups ?? []) p[m.key as MockupKey] = m.url;
    return p;
  });
  // pendentes: dataURLs novos que precisam subir para o Cloudinary ao salvar
  const [pendingUploads, setPendingUploads] = useState<Partial<Record<MockupKey, string>>>({});
  // mockups já salvos (mantidos se não forem substituídos)
  const savedMockups = useRef<OsMockup[]>(defaultVendas?.mockups ?? []);
  const fileInputs = useRef<Partial<Record<MockupKey, HTMLInputElement | null>>>({});

  /* ─── valores (integração ERP — opcional) ─── */
  const hasDefaultItems = (defaultValues?.items?.length ?? 0) > 0;
  const [showValores, setShowValores] = useState(hasDefaultItems);
  const [items, setItems] = useState<ItemRow[]>(
    hasDefaultItems
      ? (defaultValues!.items as ItemRow[])
      : [{ name: "", quantity: 1, unitPrice: 0 }]
  );
  const [validUntil, setValidUntil] = useState(defaultValues?.validUntil ?? "");
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");

  /* ─── histórico ─── */
  const lastHistorySearch = useRef("");

  /* ═══ init(): datas automáticas (igual ao HTML) ═══ */
  useEffect(() => {
    if (!defaultVendas) {
      const hoje = new Date();
      setDtEntrada(toISODate(hoje));
      setDtLimite(toISODate(calcularDataLimite(hoje, 15)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══ atualizarTitulo(): título da aba "os N CLIENTE" ═══ */
  useEffect(() => {
    document.title = `os ${nPedido} ${cliente}`.trim() || "Novo Orçamento";
  }, [nPedido, cliente]);

  /* ═══ helpers de estado ═══ */
  const setDet = (key: string, value: string) =>
    setDetState((prev) => ({ ...prev, [key]: value }));

  /* calcImpressao(): total = cardápios × páginas */
  const totalImp = useMemo(() => {
    const card = parseInt(det.iQtdCard || "0", 10) || 0;
    const pag = parseInt(det.iPagCard || "0", 10) || 0;
    return card && pag ? String(card * pag) : "";
  }, [det.iQtdCard, det.iPagCard]);

  /* replicarFormato(): formato do cardápio → tamanho da impressão */
  function onFormatoCardapio(valor: string) {
    setDet("cFormato", valor);
    if (I_TAMANHOS.includes(valor)) setDet("iTamanho", valor);
  }

  /* ═══ buscarHistorico(): agora com retorno real do banco ═══ */
  function buscarHistorico(origem: string) {
    const nome = cliente.trim();
    if (nome.length < 2 || lastHistorySearch.current === nome.toUpperCase()) return;
    lastHistorySearch.current = nome.toUpperCase();
    setStatusMsg(`🔍 Buscando histórico de ${origem}...`);
    startTransition(async () => {
      const res = await getClientOsHistory(nome);
      if (!res.ok || !res.data.found || !res.data.vendas) {
        setStatusMsg(res.ok ? "Nenhum histórico encontrado para este cliente." : res.error);
        setTimeout(() => setStatusMsg(""), 3500);
        return;
      }
      const dt = res.data.createdAt
        ? new Date(res.data.createdAt).toLocaleDateString("pt-BR")
        : "";
      const usar = window.confirm(
        `Encontrei a OS ${res.data.code}${dt ? ` (${dt})` : ""} deste cliente.\nPreencher o pedido com os dados dela?`
      );
      if (!usar) {
        setStatusMsg("");
        return;
      }
      const h = res.data.vendas;
      setDetState((prev) => ({ ...h.detalhes, ...stripEmpty(prev) }));
      setSecoes((prev) => ({
        cardapio: prev.cardapio || h.secoes.cardapio,
        impressao: prev.impressao || h.secoes.impressao,
        ja: prev.ja || h.secoes.ja,
        pc: prev.pc || h.secoes.pc,
        display: prev.display || h.secoes.display,
      }));
      if (!vendedor && h.vendedor) setVendedor(h.vendedor);
      if (!entrega && h.entrega) setEntrega(h.entrega);
      if ((res.data.items?.length ?? 0) > 0 && !showValores) {
        setShowValores(true);
        setItems(res.data.items!.map((i) => ({ ...i })));
      }
      setStatusMsg(`✅ Dados da OS ${res.data.code} aplicados.`);
      setTimeout(() => setStatusMsg(""), 3500);
    });
  }

  function stripEmpty(obj: Record<string, string>) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) if (v && v.trim() !== "") out[k] = v;
    return out;
  }

  /* ═══ mockups: preview + compressão local ═══ */
  function triggerFile(key: MockupKey) {
    fileInputs.current[key]?.click();
  }

  async function onFileChange(key: MockupKey, file?: File | null) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setErrorMsg("Formato inválido. Use PNG, JPG ou WEBP.");
      return;
    }
    setErrorMsg(null);
    const dataUrl = await compressImage(file);
    setPreviews((p) => ({ ...p, [key]: dataUrl }));
    setPendingUploads((p) => ({ ...p, [key]: dataUrl }));
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read"));
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1400;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            const scale = MAX / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(String(reader.result));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => resolve(String(reader.result));
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  /* ═══ montarDados(): objeto completo (igual ao HTML) ═══ */
  const up = (s: string) => (s ?? "").toUpperCase();

  function montarVendas(mockups: OsMockup[]): OsVendas {
    const detalhes: Record<string, string> = {};
    for (const [k, v] of Object.entries(det)) {
      if (v == null || String(v).trim() === "") continue;
      // textareas mantêm caixa original; demais campos em CAIXA ALTA (getVal)
      detalhes[k] = ["cObs", "iObs", "jObs"].includes(k) ? v : up(v);
    }
    if (totalImp) detalhes.iTotalImp = totalImp;
    detalhes.cExtras = `Fil:${up(det.cFilipeta ?? "")} Quad:${up(det.cQuadro ?? "")} Cant:${up(det.cCantoneira ?? "")}`;

    let briefing: OsVendas["briefing"] = null;
    if (modo === "CRIACAO") {
      briefing = {
        qtd: up(briCri.qtd),
        formato: up(briCri.formato),
        modelo: up(briCri.modelo),
        fixacao: up(briCri.fixacao),
        acab: up(briCri.acab),
        segmento: up(briCri.segmento),
        template: briCri.template,
        fotos: up(briCri.fotos),
        cores: up(briCri.cores),
        capa: up(briCri.capa),
        restricoes: briCri.restricoes,
        acessorios: {
          ja: briCri.acJa,
          pc: briCri.acPc,
          disp: briCri.acDisp,
          na: briCri.acNa,
        },
      };
    } else if (modo === "ALTERACAO") {
      briefing = {
        qtd: up(briAlt.qtd),
        fotos: up(briAlt.fotos),
        tipo: up(briAlt.tipo),
        desc: briAlt.desc,
        driveLink,
      };
    }

    return {
      modo,
      nPedido: nPedido.trim(),
      vendedor: up(vendedor),
      entrega: up(entrega),
      prioridade: up(prioridade),
      dtEntrada,
      dtLimite,
      inauguracao,
      secoes: { ...secoes },
      detalhes,
      briefing,
      mockups,
      driveLink: driveLink.trim() || undefined,
    };
  }

  function itensValidos(): { name: string; quantity: number; unitPrice: number }[] {
    if (!showValores) return [];
    return items
      .map((i) => ({
        name: String(i.name ?? "").trim(),
        quantity: Number(i.quantity) || 0,
        unitPrice: Number(i.unitPrice) || 0,
      }))
      .filter((i) => i.name.length > 0 && i.quantity >= 1);
  }

  const totalValores = items.reduce(
    (s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0),
    0
  );

  /* ═══ processarPedido(): upload + salvar + PDF ═══ */
  function processarPedido() {
    setErrorMsg(null);
    if (cliente.trim().length < 2) {
      setErrorMsg("Informe o Nome Fantasia (Cliente).");
      return;
    }
    startTransition(async () => {
      // 1. Upload dos mockups pendentes (Cloudinary)
      setStatusMsg("Fazendo upload de imagens...");
      const replacedKeys = Object.keys(pendingUploads);
      const kept = savedMockups.current.filter((m) => !replacedKeys.includes(m.key));
      const uploaded: OsMockup[] = [];
      for (const key of MOCKUP_KEYS) {
        const dataUrl = pendingUploads[key];
        if (!dataUrl) continue;
        const res = await uploadOsMockup(key, dataUrl);
        if (!res.ok) {
          setStatusMsg("");
          setErrorMsg(`Mockup ${key.toUpperCase()}: ${res.error}`);
          return;
        }
        uploaded.push(res.data);
      }
      const mockups = [...kept, ...uploaded];

      // 2. Monta dados completos
      const vendas = montarVendas(mockups);
      const payload: QuoteInput = {
        clientName: up(cliente.trim()),
        clientId: clientId || undefined,
        clientPhone: clientPhone || undefined,
        clientEmail: clientEmail || undefined,
        validUntil: validUntil || undefined,
        notes: notes || undefined,
        items: itensValidos(),
        vendas,
      };

      // 3. Salva no banco
      setStatusMsg("Salvando pedido...");
      const res = quoteId ? await updateQuote(quoteId, payload) : await createQuote(payload);
      if (!res.ok) {
        setStatusMsg("");
        setErrorMsg(res.error);
        return;
      }

      // 4. Gera o PDF completo da OS (igual ao HTML)
      setStatusMsg("Pedido salvo. Gerando PDF...");
      try {
        await gerarPdfOS({
          codigo: undefined,
          cliente: up(cliente.trim()),
          vendas,
          imagens: await imagensParaPdf(),
          itens: itensValidos(),
          total: totalValores,
          notes,
        });
      } catch {
        /* PDF é cortesia — não bloqueia o fluxo de salvar */
      }

      setStatusMsg("✅ Pedido salvo com sucesso!");
      const newId =
        quoteId ?? ("data" in res && res.data ? (res.data as { id: string }).id : "");
      setTimeout(() => {
        if (newId) router.push(`/admin/orcamentos/${newId}`);
        router.refresh();
      }, 900);
    });
  }

  /* imagens para o PDF: usa previews locais; converte URLs salvas */
  async function imagensParaPdf(): Promise<Partial<Record<string, string>>> {
    const out: Partial<Record<string, string>> = {};
    for (const key of MOCKUP_KEYS) {
      const src = previews[key];
      if (!src) continue;
      if (src.startsWith("data:image")) out[key] = src;
      else {
        const converted = await urlToDataUrl(src);
        if (converted) out[key] = converted;
      }
    }
    return out;
  }

  /* ═══ gerarPDF() sem salvar (igual ao HTML) ═══ */
  function gerarPdfSemSalvar() {
    setErrorMsg(null);
    startTransition(async () => {
      setStatusMsg("Gerando PDF da OS...");
      try {
        await gerarPdfOS({
          cliente: up(cliente.trim()) || "CLIENTE",
          vendas: montarVendas(savedMockups.current),
          imagens: await imagensParaPdf(),
          itens: itensValidos(),
          total: totalValores,
          notes,
        });
        setStatusMsg("");
      } catch (e) {
        setStatusMsg("");
        setErrorMsg(e instanceof Error ? e.message : "Erro ao gerar PDF.");
      }
    });
  }

  /* ═══ textos do botão principal (igual ao HTML) ═══ */
  const btnFinalText =
    modo === "CRIACAO"
      ? "ENVIAR PARA CRIAÇÃO 🎨"
      : modo === "ALTERACAO"
        ? "ENVIAR PARA ALTERAÇÃO 🔄"
        : "GERAR OS DE PRODUÇÃO 🏭";

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    <div className="space-y-6">
      {products.length > 0 && (
        <datalist id="product-options">
          {products.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}

      {/* ─── SELETOR DE MODO ─── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ModeBtn
          active={modo === "PROD"}
          onClick={() => setModo("PROD")}
          icon={<Factory className="h-6 w-6" />}
          title="PRODUÇÃO"
          subtitle="Repetir Pedido / Pronto"
        />
        <ModeBtn
          active={modo === "CRIACAO"}
          onClick={() => setModo("CRIACAO")}
          icon={<Palette className="h-6 w-6" />}
          title="CRIAÇÃO"
          subtitle="Layout Novo (Do Zero)"
        />
        <ModeBtn
          active={modo === "ALTERACAO"}
          onClick={() => setModo("ALTERACAO")}
          icon={<RefreshCcw className="h-6 w-6" />}
          title="ALTERAÇÃO"
          subtitle="Preços / Ajustes"
        />
      </div>

      {/* ─── 1. DADOS DO PEDIDO ─── */}
      <SectionCard title="1. Dados do Pedido">
        {clients.length > 0 && (
          <div className="mb-4">
            <label className={labelCls}>Vincular lead do CRM (opcional)</label>
            <select
              defaultValue=""
              className={inputCls}
              onChange={(e) => {
                const c = clients.find((x) => x.id === e.target.value);
                if (!c) return;
                setClientId(c.id);
                setCliente(c.name);
                setClientPhone(c.phone);
                setClientEmail(c.email);
              }}
            >
              <option value="">— Selecionar lead existente —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Data Entrada">
            <input type="date" className={inputCls} value={dtEntrada} readOnly />
          </Field>
          <Field label="Data Limite">
            <input
              type="date"
              className={inputCls + " font-bold !text-burgundy"}
              value={dtLimite}
              readOnly
            />
          </Field>
          <Field label="Nome Fantasia (Cliente)" span2>
            <input
              className={inputCls}
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              onBlur={() => buscarHistorico("CLIENTE")}
              placeholder="Ex: RESTAURANTE VILLA"
            />
          </Field>
          <Field label="Nº Pedido">
            <input
              type="number"
              className={inputCls}
              value={nPedido}
              onChange={(e) => setNPedido(e.target.value)}
            />
          </Field>
          <Field label="Vendedor">
            <select className={inputCls} value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
              <option value="">Selecione...</option>
              {VENDEDORES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Entrega">
            <select className={inputCls} value={entrega} onChange={(e) => setEntrega(e.target.value)}>
              <option value="">Selecione...</option>
              {ENTREGAS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select
              className={inputCls}
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
            >
              <option value="">Selecione...</option>
              {PRIORIDADES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Inauguração">
            <input
              type="date"
              className={inputCls}
              value={inauguracao}
              onChange={(e) => setInauguracao(e.target.value)}
            />
          </Field>
          <Field label="WhatsApp do Cliente">
            <input
              className={inputCls}
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="5511999999999"
            />
          </Field>
          <Field label="E-mail do Cliente">
            <input
              className={inputCls}
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="contato@cliente.com"
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={() => buscarHistorico("CLIENTE")}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-premium hover:text-leather"
        >
          <Search className="h-3.5 w-3.5" /> Buscar histórico deste cliente
        </button>
      </SectionCard>

      {/* ─── BRIEFING DE CRIAÇÃO ─── */}
      {modo === "CRIACAO" && (
        <BriefingCard title="🎨 Briefing de Criação (Novo)">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Quantos Cardápios?">
              <input
                className={inputCls}
                placeholder="Ex: 20 un"
                value={briCri.qtd}
                onChange={(e) => setBriCri({ ...briCri, qtd: e.target.value })}
              />
            </Field>
            <BriSel label="Formato" value={briCri.formato} options={CRI_FORMATOS} onChange={(v) => setBriCri({ ...briCri, formato: v })} />
            <BriSel label="Modelo" value={briCri.modelo} options={CRI_MODELOS} onChange={(v) => setBriCri({ ...briCri, modelo: v })} />
            <BriSel label="Fixação" value={briCri.fixacao} options={CRI_FIXACOES} onChange={(v) => setBriCri({ ...briCri, fixacao: v })} />
            <BriSel label="Acabamento" value={briCri.acab} options={CRI_ACABAMENTOS} onChange={(v) => setBriCri({ ...briCri, acab: v })} />
            <Field label="Segmento">
              <input
                className={inputCls}
                placeholder="Ex: Bar, Hamburgueria..."
                value={briCri.segmento}
                onChange={(e) => setBriCri({ ...briCri, segmento: e.target.value })}
              />
            </Field>
            <Field label="Template de Referência / Descrição (Seja Detalhado)" span3>
              <textarea
                rows={2}
                className={inputCls}
                placeholder="Descreva estilo, referências..."
                value={briCri.template}
                onChange={(e) => setBriCri({ ...briCri, template: e.target.value })}
              />
            </Field>
            <BriSel label="Fotos" value={briCri.fotos} options={CRI_FOTOS} onChange={(v) => setBriCri({ ...briCri, fotos: v })} />
            <BriSel label="Cores" value={briCri.cores} options={CRI_CORES} onChange={(v) => setBriCri({ ...briCri, cores: v })} />
            <BriSel label="Capa (Pers.)" value={briCri.capa} options={CRI_CAPAS} onChange={(v) => setBriCri({ ...briCri, capa: v })} />

            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Acessórios (marque os inclusos)</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Chk label="Jogos Americanos" checked={briCri.acJa} onChange={(v) => setBriCri({ ...briCri, acJa: v })} />
                <Chk label="Porta Contas" checked={briCri.acPc} onChange={(v) => setBriCri({ ...briCri, acPc: v })} />
                <Chk label="Displays" checked={briCri.acDisp} onChange={(v) => setBriCri({ ...briCri, acDisp: v })} />
                <Chk label="Não Aplicável" checked={briCri.acNa} onChange={(v) => setBriCri({ ...briCri, acNa: v })} />
              </div>
            </div>

            <Field label="🚫 O que NÃO pode haver? (Restrições)" span3>
              <textarea
                rows={2}
                className={inputCls}
                placeholder="Ex: Não usar cor verde, não usar fonte cursiva..."
                value={briCri.restricoes}
                onChange={(e) => setBriCri({ ...briCri, restricoes: e.target.value })}
              />
            </Field>
          </div>
        </BriefingCard>
      )}

      {/* ─── BRIEFING DE ALTERAÇÃO ─── */}
      {modo === "ALTERACAO" && (
        <BriefingCard title="🔄 Briefing de Alteração">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Quantos Cardápios?">
              <input
                className={inputCls}
                placeholder="Ex: 50 un"
                value={briAlt.qtd}
                onChange={(e) => setBriAlt({ ...briAlt, qtd: e.target.value })}
              />
            </Field>
            <Field label="Troca de Fotos?">
              <select
                className={inputCls}
                value={briAlt.fotos}
                onChange={(e) => setBriAlt({ ...briAlt, fotos: e.target.value })}
              >
                {ALT_FOTOS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de Serviço">
              <select
                className={inputCls}
                value={briAlt.tipo}
                onChange={(e) => setBriAlt({ ...briAlt, tipo: e.target.value })}
              >
                {ALT_TIPOS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quais páginas / Descrição:" span3>
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Ex: Alterar preços pág 2 e 4 conforme rabiscos..."
                value={briAlt.desc}
                onChange={(e) => setBriAlt({ ...briAlt, desc: e.target.value })}
              />
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-premium">
                📂 Upload de rabiscos e fotos (Drive)
              </label>
              <p className="mb-2 text-xs text-leather/50">
                Crie a pasta no Google Drive, suba todas as fotos dos rabiscos/alterações lá e cole
                o link abaixo.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="https://drive.google.com/drive/my-drive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !py-2 !px-4 text-sm"
                >
                  <FolderOpen className="h-4 w-4" /> Abrir Google Drive
                </a>
                <input
                  className={inputCls + " flex-1 font-medium !text-premium"}
                  placeholder="Cole aqui o link da pasta do Drive..."
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                />
              </div>
            </div>
          </div>
        </BriefingCard>
      )}

      {/* ─── SEÇÕES OPCIONAIS ─── */}

      {/* CARDÁPIO (FÍSICO) */}
      <ToggleSection
        label="INCLUIR CARDÁPIO (FÍSICO)"
        checked={secoes.cardapio}
        onChange={(v) => {
          setSecoes({ ...secoes, cardapio: v });
          if (v) buscarHistorico("CARDÁPIO");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Sel label="Tipo" k="cTipo" det={det} setDet={setDet} options={C_TIPOS} />
          <Num label="Qtd Pedido" k="cQtdPed" det={det} setDet={setDet} />
          <Num label="Qtd Produção" k="cQtdProd" det={det} setDet={setDet} />
          <Field label="Formato">
            <select
              className={inputCls}
              value={det.cFormato ?? ""}
              onChange={(e) => onFormatoCardapio(e.target.value)}
            >
              <option value="">Selecione...</option>
              {C_FORMATOS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Sel label="Material Capa" k="cMatCapa" det={det} setDet={setDet} options={C_MATERIAIS_CAPA} />
          <Sel label="Cor Capa" k="cCorCapa" det={det} setDet={setDet} options={C_CORES_CAPA} />
          <Sel label="Trisset" k="cTrisse" det={det} setDet={setDet} options={C_TRISSETS} />
          <Sel label="Costura" k="cCostura" det={det} setDet={setDet} options={C_COSTURAS} />
          <Sel label="Cor Linha" k="cCorLinha" det={det} setDet={setDet} options={C_CORES_LINHA} />
          <Sel label="Fixação" k="cFixacao" det={det} setDet={setDet} options={C_FIXACOES} />
          <Sel label="Tipo Divisórias" k="cTipoDiv" det={det} setDet={setDet} options={C_TIPOS_DIV} />
          <Num label="Qtd Div. p/ Card" k="cQtdDiv" det={det} setDet={setDet} />
          <Sel label="Pers. Frente" k="cPersCapa" det={det} setDet={setDet} options={C_PERS} />
          <Sel label="Posição Frente" k="cPosCapa" det={det} setDet={setDet} options={C_POS_FRENTE} />
          <Sel label="Pers. Verso" k="cPersVerso" det={det} setDet={setDet} options={C_PERS} />
          <Sel label="Posição Verso" k="cPosVerso" det={det} setDet={setDet} options={C_POS_VERSO} />
          <Sel label="Contra Capa 1" k="cCC1" det={det} setDet={setDet} options={CONTRA_CAPAS} />
          <Sel label="Contra Capa 2" k="cCC2" det={det} setDet={setDet} options={CONTRA_CAPAS} />
          <Sel label="Cor Acabamento" k="cCorAcab" det={det} setDet={setDet} options={C_CORES_ACAB} />

          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelCls}>Extras</label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Sel label="Filipeta" k="cFilipeta" det={det} setDet={setDet} options={C_FILIPETAS} />
              <Sel label="Quadro" k="cQuadro" det={det} setDet={setDet} options={C_QUADROS} />
              <Sel label="Cantoneira" k="cCantoneira" det={det} setDet={setDet} options={C_CANTONEIRAS} />
            </div>
          </div>

          <Area label="Observações" k="cObs" det={det} setDet={setDet} rows={3} />
        </div>
        <MockupRow
          a="c1"
          b="c2"
          labelA="📷 Imagem 1 (Cardápio)"
          labelB="📷 Imagem 2 (Detalhe)"
          previews={previews}
          triggerFile={triggerFile}
          fileInputs={fileInputs}
          onFileChange={onFileChange}
        />
      </ToggleSection>

      {/* IMPRESSÃO */}
      <ToggleSection
        label="INCLUIR IMPRESSÃO"
        checked={secoes.impressao}
        onChange={(v) => {
          setSecoes({ ...secoes, impressao: v });
          if (v) buscarHistorico("IMPRESSÃO");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Num label="Qtd Cardápios" k="iQtdCard" det={det} setDet={setDet} />
          <Num label="Páginas/Card" k="iPagCard" det={det} setDet={setDet} />
          <Field label="Total Impressões">
            <input className={inputCls + " font-bold !text-burgundy"} value={totalImp} readOnly />
          </Field>
          <Sel label="Papel" k="iPapel" det={det} setDet={setDet} options={I_PAPEIS} />
          <Sel label="Tamanho" k="iTamanho" det={det} setDet={setDet} options={I_TAMANHOS} />
          <Sel label="Laminação" k="iLam" det={det} setDet={setDet} options={I_LAMINACOES} />
          <Sel label="Acabamento" k="iAcab" det={det} setDet={setDet} options={I_ACABAMENTOS} />
          <Area label="Obs Impressão" k="iObs" det={det} setDet={setDet} rows={2} />
        </div>
        <MockupRow
          a="i1"
          b="i2"
          labelA="📷 Imagem 1 (Impressão)"
          labelB="📷 Imagem 2 (Detalhe)"
          previews={previews}
          triggerFile={triggerFile}
          fileInputs={fileInputs}
          onFileChange={onFileChange}
        />
      </ToggleSection>

      {/* JOGOS AMERICANOS */}
      <ToggleSection
        label="INCLUIR JOGOS AMERICANOS"
        checked={secoes.ja}
        onChange={(v) => {
          setSecoes({ ...secoes, ja: v });
          if (v) buscarHistorico("JA");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Num label="Qtd" k="jQtd" det={det} setDet={setDet} />
          <Sel label="Formato" k="jFormato" det={det} setDet={setDet} options={J_FORMATOS} />
          <Sel label="Mat Frente" k="jMatF" det={det} setDet={setDet} options={J_MATERIAIS} />
          <Sel label="Cor Frente" k="jCorF" det={det} setDet={setDet} options={J_CORES_FRENTE} />
          <Sel label="Pers Frente" k="jPersF" det={det} setDet={setDet} options={J_PERS} />
          <Sel label="Posição Frente" k="jPosF" det={det} setDet={setDet} options={J_POSICOES} />
          <Sel label="Mat Verso" k="jMatV" det={det} setDet={setDet} options={J_MATERIAIS} />
          <Sel label="Cor Verso" k="jCorV" det={det} setDet={setDet} options={J_CORES_VERSO} />
          <Sel label="Pers Verso" k="jPersV" det={det} setDet={setDet} options={J_PERS} />
          <Sel label="Posição Verso" k="jPosV" det={det} setDet={setDet} options={J_POSICOES} />
          <Sel label="Costura" k="jCostura" det={det} setDet={setDet} options={J_COSTURAS} />
          <Sel label="Cor Linha" k="jLinha" det={det} setDet={setDet} options={J_CORES_LINHA} />
          <Area label="Obs JA" k="jObs" det={det} setDet={setDet} rows={2} />
        </div>
        <MockupRow
          a="j1"
          b="j2"
          labelA="📷 Imagem 1 (JA)"
          labelB="📷 Imagem 2 (Detalhe)"
          previews={previews}
          triggerFile={triggerFile}
          fileInputs={fileInputs}
          onFileChange={onFileChange}
        />
      </ToggleSection>

      {/* PORTA CONTA */}
      <ToggleSection
        label="INCLUIR PORTA CONTA"
        checked={secoes.pc}
        onChange={(v) => {
          setSecoes({ ...secoes, pc: v });
          if (v) buscarHistorico("PC");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Num label="Qtd" k="pcQtd" det={det} setDet={setDet} />
          <Sel label="Tipo" k="pcTipo" det={det} setDet={setDet} options={PC_TIPOS} />
          <Sel label="Material" k="pcMat" det={det} setDet={setDet} options={PC_MATERIAIS} />
          <Sel label="Cor" k="pcCor" det={det} setDet={setDet} options={PC_CORES} />
          <Sel label="Contra Capa 1" k="pcCC1" det={det} setDet={setDet} options={CONTRA_CAPAS} />
          <Sel label="Contra Capa 2" k="pcCC2" det={det} setDet={setDet} options={CONTRA_CAPAS} />
          <Sel label="Costura" k="pcCostura" det={det} setDet={setDet} options={PC_COSTURAS} />
          <Sel label="Cor Linha" k="pcLinha" det={det} setDet={setDet} options={PC_CORES_LINHA} />
          <Sel label="Pers" k="pcPers" det={det} setDet={setDet} options={PC_PERS} />
          <Sel label="Posição" k="pcPosPers" det={det} setDet={setDet} options={PC_POSICOES} />
        </div>
        <MockupRow
          a="p1"
          b="p2"
          labelA="📷 Imagem 1 (PC)"
          labelB="📷 Imagem 2 (Detalhe)"
          previews={previews}
          triggerFile={triggerFile}
          fileInputs={fileInputs}
          onFileChange={onFileChange}
        />
      </ToggleSection>

      {/* DISPLAY */}
      <ToggleSection
        label="INCLUIR DISPLAY"
        checked={secoes.display}
        onChange={(v) => {
          setSecoes({ ...secoes, display: v });
          if (v) buscarHistorico("DISPLAY");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Num label="Qtd" k="dQtd" det={det} setDet={setDet} />
          <Sel label="Tipo" k="dTipo" det={det} setDet={setDet} options={D_TIPOS} />
          <Sel label="Medida" k="dMedida" det={det} setDet={setDet} options={D_MEDIDAS} />
          <Sel label="Material" k="dMat" det={det} setDet={setDet} options={D_MATERIAIS} />
          <Sel label="Cor" k="dCor" det={det} setDet={setDet} options={D_CORES} />
          <Sel label="Fixação" k="dFixacao" det={det} setDet={setDet} options={D_FIXACOES} />
          <Sel label="Pers" k="dPers" det={det} setDet={setDet} options={D_PERS} />
          <Sel label="Posição" k="dPosPers" det={det} setDet={setDet} options={D_POSICOES} />
        </div>
        <MockupRow
          a="d1"
          b="d2"
          labelA="📷 Imagem 1 (Display)"
          labelB="📷 Imagem 2"
          previews={previews}
          triggerFile={triggerFile}
          fileInputs={fileInputs}
          onFileChange={onFileChange}
        />
      </ToggleSection>

      {/* ─── VALORES DO ORÇAMENTO (integração ERP, opcional) ─── */}
      <div className="rounded-xl border border-premium/10 bg-white">
        <button
          type="button"
          onClick={() => setShowValores(!showValores)}
          className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-cream/40"
        >
          <input
            type="checkbox"
            readOnly
            checked={showValores}
            className="h-4 w-4 accent-champagne"
          />
          <span className="font-semibold uppercase tracking-wide text-leather">
            💰 Incluir Valores do Orçamento
          </span>
          <span className="ml-auto text-xs text-leather/50">
            (opcional — habilita total, envio por WhatsApp/e-mail e financeiro)
          </span>
          <ChevronDown
            className={`h-4 w-4 text-leather/40 transition-transform ${showValores ? "rotate-180" : ""}`}
          />
        </button>

        {showValores && (
          <div className="border-t border-premium/10 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg text-leather">Produtos e Preços</h3>
              <button
                type="button"
                onClick={() => setItems([...items, { name: "", quantity: 1, unitPrice: 0 }])}
                className="inline-flex items-center gap-1 text-sm font-medium text-premium hover:text-burgundy"
              >
                <Plus className="h-4 w-4" /> Adicionar produto
              </button>
            </div>

            <div className="space-y-3">
              {items.map((it, i) => {
                const sub = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
                return (
                  <div key={i} className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        className={inputCls}
                        placeholder="Cardápio Couro Sintético A4"
                        list="product-options"
                        value={it.name}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], name: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min={1}
                        className={inputCls}
                        placeholder="Qtd"
                        value={it.quantity}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], quantity: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputCls}
                        placeholder="Valor unit."
                        value={it.unitPrice}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], unitPrice: e.target.value };
                          setItems(next);
                        }}
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium text-leather sm:col-span-1">
                      {BRL.format(sub)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                          aria-label="Remover"
                          className="text-leather/40 hover:text-burgundy"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-4 border-t border-premium/10 pt-4 sm:grid-cols-3">
              <Field label="Validade do Orçamento">
                <input
                  type="date"
                  className={inputCls}
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2 sm:text-right">
                <span className="text-xs uppercase tracking-wider text-leather/50">Total</span>
                <p className="font-display text-3xl text-leather">{BRL.format(totalValores)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── OBSERVAÇÕES GERAIS ─── */}
      <SectionCard title="Observações Gerais do Orçamento">
        <textarea
          rows={3}
          className={inputCls}
          placeholder="Ex: prazo de 15 dias úteis após aprovação da arte. Frete por conta do cliente."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </SectionCard>

      {/* ─── BOTÕES FINAIS (iguais ao HTML) ─── */}
      {errorMsg && (
        <p className="rounded-lg border border-burgundy/20 bg-burgundy/5 p-3 text-sm text-burgundy">
          {errorMsg}
        </p>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={processarPedido}
          disabled={pending}
          className="btn-gold w-full !py-4 text-base uppercase tracking-wide disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {pending ? "Processando..." : quoteId ? "SALVAR ALTERAÇÕES DA OS ☁️" : btnFinalText}
        </button>

        <button
          type="button"
          onClick={gerarPdfSemSalvar}
          disabled={pending}
          className="btn-outline w-full !py-3.5 uppercase tracking-wide disabled:opacity-60"
        >
          <FileDown className="h-4 w-4" /> Gerar PDF da OS (sem salvar)
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Limpar a tela e começar um novo pedido?"))
              window.location.reload();
          }}
          className="w-full rounded-lg border border-leather/15 bg-cream px-6 py-3 font-semibold text-leather/60 transition-colors hover:bg-leather/5 hover:text-leather"
        >
          <Eraser className="mr-2 inline h-4 w-4" /> NOVO PEDIDO (LIMPAR TELA)
        </button>

        {statusMsg && <p className="text-center text-sm text-leather/60">{statusMsg}</p>}
      </div>
    </div>
  );
}

/* ══════════════ componentes auxiliares ══════════════ */

function ModeBtn({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-xl border-2 p-4 text-center transition-all duration-200 " +
        (active
          ? "scale-[1.02] border-champagne bg-champagne font-extrabold text-ink shadow-premium"
          : "border-leather/15 bg-white text-leather/60 opacity-80 hover:border-champagne hover:opacity-100")
      }
    >
      <span className="mb-1 flex justify-center">{icon}</span>
      <span className="block text-sm font-bold tracking-wide">{title}</span>
      <span className={"block text-[11px] " + (active ? "text-ink/70" : "text-leather/40")}>
        {subtitle}
      </span>
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-premium/10 bg-white p-5">
      <h2 className="mb-4 rounded-md bg-gradient-to-r from-champagne/90 to-transparent px-3 py-2 font-bold uppercase tracking-wide text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BriefingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-dashed border-champagne bg-champagne/5 p-5">
      <h3 className="mb-4 border-b border-champagne/30 pb-2 font-display text-lg font-bold text-leather">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ToggleSection({
  label,
  checked,
  onChange,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-premium/10 bg-white">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex w-full items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-cream/40"
      >
        <input type="checkbox" readOnly checked={checked} className="h-4 w-4 accent-champagne" />
        <span className="font-semibold uppercase tracking-wide text-leather">{label}</span>
      </button>
      {checked && <div className="border-t border-premium/10 p-5">{children}</div>}
    </div>
  );
}

function Field({
  label,
  children,
  span2,
  span3,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
  span3?: boolean;
}) {
  return (
    <div className={span3 ? "sm:col-span-2 lg:col-span-3" : span2 ? "sm:col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Sel({
  label,
  k,
  det,
  setDet,
  options,
}: {
  label: string;
  k: string;
  det: Record<string, string>;
  setDet: (k: string, v: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select className={inputCls} value={det[k] ?? ""} onChange={(e) => setDet(k, e.target.value)}>
        <option value="">Selecione...</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

function Num({
  label,
  k,
  det,
  setDet,
}: {
  label: string;
  k: string;
  det: Record<string, string>;
  setDet: (k: string, v: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        className={inputCls}
        value={det[k] ?? ""}
        onChange={(e) => setDet(k, e.target.value)}
      />
    </Field>
  );
}

function Area({
  label,
  k,
  det,
  setDet,
  rows,
}: {
  label: string;
  k: string;
  det: Record<string, string>;
  setDet: (k: string, v: string) => void;
  rows: number;
}) {
  return (
    <Field label={label} span3>
      <textarea
        rows={rows}
        className={inputCls}
        value={det[k] ?? ""}
        onChange={(e) => setDet(k, e.target.value)}
      />
    </Field>
  );
}

function Chk({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md bg-cream/60 px-3 py-2 text-sm text-leather">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-champagne"
      />
      {label}
    </label>
  );
}

function MockupRow({
  a,
  b,
  labelA,
  labelB,
  previews,
  triggerFile,
  fileInputs,
  onFileChange,
}: {
  a: MockupKey;
  b: MockupKey;
  labelA: string;
  labelB: string;
  previews: Partial<Record<MockupKey, string>>;
  triggerFile: (k: MockupKey) => void;
  fileInputs: React.MutableRefObject<Partial<Record<MockupKey, HTMLInputElement | null>>>;
  onFileChange: (k: MockupKey, f?: File | null) => void;
}) {
  const Box = ({ k, label }: { k: MockupKey; label: string }) => (
    <div
      onClick={() => triggerFile(k)}
      className="flex-1 cursor-pointer rounded-lg border-2 border-dashed border-leather/20 p-3 text-center transition-colors hover:border-champagne"
    >
      <p className="text-sm text-leather/60">
        <Camera className="mr-1 inline h-4 w-4" />
        {label}
      </p>
      <input
        ref={(el) => {
          fileInputs.current[k] = el;
        }}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onFileChange(k, e.target.files?.[0])}
      />
      {previews[k] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previews[k]}
          alt={`Mockup ${k}`}
          className="mt-2 max-h-48 w-full rounded border border-champagne object-contain"
        />
      )}
    </div>
  );
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <Box k={a} label={labelA} />
      <Box k={b} label={labelB} />
    </div>
  );
}
