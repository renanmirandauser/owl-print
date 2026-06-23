"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, X, ArrowRight,
} from "lucide-react";
import { importLeads, type ImportLeadRow } from "@/actions/clients";

type Step = "upload" | "map" | "preview" | "done";
type FieldKey = keyof ImportLeadRow;
const NONE = "__none__";

const FIELDS: { key: FieldKey; label: string; required?: boolean }[] = [
  { key: "name",      label: "Nome",         required: true },
  { key: "company",   label: "Empresa" },
  { key: "phone",     label: "Telefone" },
  { key: "whatsapp",  label: "WhatsApp" },
  { key: "instagram", label: "Instagram" },
  { key: "email",     label: "E-mail" },
  { key: "notes",     label: "Observações" },
];

const ALIASES: Record<FieldKey, string[]> = {
  name:      ["nome", "name", "cliente", "contato", "responsavel", "lead", "razao social", "razão social", "proprietario"],
  company:   ["empresa", "company", "estabelecimento", "negocio", "loja", "restaurante", "fantasia", "razao social"],
  phone:     ["telefone", "phone", "tel", "fone", "celular", "telefone1"],
  whatsapp:  ["whatsapp", "whats", "zap", "wpp", "whatszap"],
  instagram: ["instagram", "insta", "arroba", "perfil"],
  email:     ["email", "e-mail", "mail", "correio"],
  notes:     ["observacoes", "observacao", "obs", "notas", "notes", "comentarios", "anotacoes", "descricao"],
};

const norm = (s: string) =>
  s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

function autoDetect(headers: string[]): Record<FieldKey, string> {
  const used = new Set<string>();
  const out = {} as Record<FieldKey, string>;
  for (const { key } of FIELDS) {
    out[key] = NONE;
    for (const h of headers) {
      if (used.has(h)) continue;
      const nh = norm(h);
      if (ALIASES[key].some((a) => nh === a || nh.startsWith(a))) {
        out[key] = h;
        used.add(h);
        break;
      }
    }
  }
  return out;
}

function buildLeads(rows: Record<string, unknown>[], mapping: Record<FieldKey, string>): ImportLeadRow[] {
  const leads: ImportLeadRow[] = [];
  for (const r of rows) {
    const name = mapping.name !== NONE ? String(r[mapping.name] ?? "").trim() : "";
    if (!name) continue;
    const get = (k: FieldKey) =>
      mapping[k] !== NONE ? String(r[mapping[k]] ?? "").trim() || undefined : undefined;
    leads.push({
      name,
      company:   get("company"),
      phone:     get("phone"),
      whatsapp:  get("whatsapp"),
      instagram: get("instagram"),
      email:     mapping.email !== NONE ? String(r[mapping.email] ?? "").trim().toLowerCase() || undefined : undefined,
      notes:     get("notes"),
    });
  }
  return leads;
}

function colSample(rows: Record<string, unknown>[], h: string): string {
  return rows.slice(0, 3).map((r) => String(r[h] ?? "").trim()).filter(Boolean)[0]?.slice(0, 28) ?? "";
}

const selectCls =
  "w-full rounded-lg border border-leather/15 bg-white px-3 py-2.5 text-sm text-ink " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/25";

export function LeadsImporter() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep]       = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<{ created: number; skipped: number } | null>(null);

  const leads = useMemo(() => buildLeads(rawRows, mapping), [rawRows, mapping]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf);
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      if (!rows.length) { setError("Planilha vazia ou sem linhas."); return; }
      const hdrs = Object.keys(rows[0]);
      setFileName(file.name);
      setHeaders(hdrs);
      setRawRows(rows);
      setMapping(autoDetect(hdrs));
      setStep("map");
    } catch {
      setError("Não consegui ler o arquivo. Use .xlsx, .xls ou .csv.");
    } finally {
      e.target.value = "";
    }
  }

  function doImport() {
    setError(null);
    startTransition(async () => {
      const res = await importLeads(leads);
      if (!res.ok) { setError(res.error); return; }
      setResult({ created: res.created, skipped: res.skipped });
      setStep("done");
      router.refresh();
    });
  }

  function reset() {
    setStep("upload"); setFileName(""); setHeaders([]); setRawRows([]);
    setMapping({} as Record<FieldKey, string>); setError(null); setResult(null);
  }

  /* ── SUCESSO ── */
  if (step === "done" && result) {
    return (
      <div className="rounded-2xl border border-leather/10 bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-3 font-display text-2xl font-semibold text-leather">
          {result.created} {result.created === 1 ? "lead importado" : "leads importados"}!
        </h2>
        {result.skipped > 0 && (
          <p className="mt-1 text-sm text-ink/55">
            {result.skipped} {result.skipped === 1 ? "linha ignorada" : "linhas ignoradas"} (sem nome).
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/admin/crm" className="btn-gold">Ver os leads no CRM</Link>
          <button onClick={reset} className="rounded-lg border border-leather/20 px-5 py-2.5 text-sm font-medium text-leather transition-colors hover:bg-leather/5">
            Importar outra planilha
          </button>
        </div>
      </div>
    );
  }

  /* ── PASSO 1: UPLOAD ── */
  if (step === "upload") {
    return (
      <div className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
        {error && <p className="mb-4 rounded-lg border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm font-medium text-burgundy">{error}</p>}
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-leather/20 bg-cream/40 px-6 py-12 text-center transition-colors hover:border-champagne hover:bg-champagne/5">
          <UploadCloud className="h-10 w-10 text-champagne" />
          <div>
            <p className="font-semibold text-leather">Clique para enviar sua planilha</p>
            <p className="mt-1 text-sm text-ink/55">Formatos: .xlsx, .xls ou .csv</p>
          </div>
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
        </label>
      </div>
    );
  }

  /* ── PASSO 2: MAPEAR COLUNAS ── */
  if (step === "map") {
    return (
      <div className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-champagne" />
            <span className="font-medium text-leather">{fileName}</span>
            <span className="text-sm text-ink/50">({rawRows.length} linhas)</span>
          </div>
          <button onClick={reset} className="text-ink/40 hover:text-burgundy" aria-label="Remover">
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="font-display text-lg font-semibold text-leather">Conecte as colunas</h2>
        <p className="mb-5 text-sm text-ink/55">
          Diga qual coluna da planilha corresponde a cada campo.
          O sistema detecta automaticamente — corrija se precisar.
        </p>

        <div className="space-y-3">
          {FIELDS.map(({ key, label, required }) => {
            const val    = mapping[key] ?? NONE;
            const sample = val !== NONE ? colSample(rawRows, val) : "";
            return (
              <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                <label className="mt-2.5 w-32 shrink-0 text-sm font-semibold text-ink">
                  {label}{required && <span className="text-champagne"> *</span>}
                </label>
                <div className="flex-1">
                  <select
                    value={val}
                    onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                    className={selectCls}
                  >
                    <option value={NONE}>
                      {required ? "— obrigatório: escolha —" : "— não importar —"}
                    </option>
                    {headers.map((h) => {
                      const s = colSample(rawRows, h);
                      return (
                        <option key={h} value={h}>
                          {h}{s ? ` (ex: ${s})` : ""}
                        </option>
                      );
                    })}
                  </select>
                  {sample && (
                    <p className="mt-1 text-xs text-ink/45">
                      Primeiro valor: <span className="font-medium text-ink/70">{sample}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="mt-4 rounded-lg border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm font-medium text-burgundy">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              if (!mapping.name || mapping.name === NONE) {
                setError("Escolha a coluna de Nome antes de continuar.");
                return;
              }
              if (leads.length === 0) {
                setError('Nenhum lead encontrado. Verifique se a coluna "Nome" tem dados.');
                return;
              }
              setError(null);
              setStep("preview");
            }}
            disabled={!mapping.name || mapping.name === NONE}
            className="btn-gold !py-2.5 disabled:opacity-50"
          >
            Ver prévia ({leads.length})
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ── PASSO 3: PRÉVIA + IMPORTAR ── */
  const preview    = leads.slice(0, 8);
  const usedFields = FIELDS.filter((f) => mapping[f.key] !== NONE && mapping[f.key] && leads.some((l) => l[f.key]));

  return (
    <div className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-leather">
            Prévia — {leads.length} leads
          </h2>
          <p className="text-sm text-ink/55">Confira os dados antes de importar.</p>
        </div>
        <button onClick={() => setStep("map")} className="text-sm text-ink/50 hover:text-leather">
          ← Voltar ao mapeamento
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-leather/10">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-cream/60 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
            <tr>
              {usedFields.map((f) => <th key={f.key} className="px-3 py-2.5">{f.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-leather/10">
            {preview.map((l, i) => (
              <tr key={i}>
                {usedFields.map((f) => (
                  <td key={f.key} className="px-3 py-2.5 text-ink/80">{l[f.key] || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length > preview.length && (
        <p className="mt-2 text-xs text-ink/45">
          Mostrando {preview.length} de {leads.length}. Todos serão importados.
        </p>
      )}

      {error && <p className="mt-4 rounded-lg border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm font-medium text-burgundy">{error}</p>}

      <div className="mt-5 flex justify-end gap-3">
        <button onClick={() => setStep("map")} className="rounded-lg px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-leather/5 hover:text-ink">
          Voltar
        </button>
        <button onClick={doImport} disabled={pending} className="btn-gold !py-2.5 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Importar {leads.length} {leads.length === 1 ? "lead" : "leads"}
        </button>
      </div>
    </div>
  );
}
