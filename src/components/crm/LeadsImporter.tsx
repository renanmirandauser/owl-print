"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, X } from "lucide-react";
import { importLeads, type ImportLeadRow } from "@/actions/clients";

const FIELDS = ["name", "company", "phone", "whatsapp", "instagram", "email", "notes"] as const;
type Field = (typeof FIELDS)[number];

const FIELD_LABEL: Record<Field, string> = {
  name: "Nome",
  company: "Empresa",
  phone: "Telefone",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "E-mail",
  notes: "Observações",
};

// títulos de coluna que reconhecemos (sem acento, minúsculo)
const ALIASES: Record<Field, string[]> = {
  name: ["nome", "name", "cliente", "contato", "razao social", "responsavel", "lead"],
  company: ["empresa", "company", "estabelecimento", "negocio", "loja", "restaurante", "fantasia", "local"],
  phone: ["telefone", "phone", "tel", "fone", "celular", "contato telefonico"],
  whatsapp: ["whatsapp", "whats", "zap", "wpp", "whatszap", "whats app"],
  instagram: ["instagram", "insta", "arroba", "perfil", "rede social"],
  email: ["email", "e-mail", "mail", "e mail", "correio"],
  notes: ["observacoes", "observacao", "obs", "notas", "notes", "comentarios", "anotacoes", "descricao"],
};

const norm = (s: string) =>
  s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

function mapRows(rows: Record<string, unknown>[]): ImportLeadRow[] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);

  // associa cada coluna a um campo conhecido
  const map: Record<string, Field> = {};
  for (const h of headers) {
    const nh = norm(h);
    for (const field of FIELDS) {
      if (Object.values(map).includes(field)) continue; // já usado
      if (ALIASES[field].some((a) => nh === a || nh.includes(a))) {
        map[h] = field;
        break;
      }
    }
  }
  // se não achou "nome", usa a primeira coluna como nome
  if (!Object.values(map).includes("name") && headers[0]) map[headers[0]] = "name";

  const leads: ImportLeadRow[] = [];
  for (const r of rows) {
    const lead: ImportLeadRow = { name: "" };
    for (const h of Object.keys(map)) {
      const v = r[h];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        lead[map[h]] = String(v).trim();
      }
    }
    if (lead.name && lead.name.trim()) leads.push(lead);
  }
  return leads;
}

export function LeadsImporter() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [leads, setLeads] = useState<ImportLeadRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ created: number; skipped: number } | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDone(null);
    setLeads([]);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      const mapped = mapRows(rows);
      if (mapped.length === 0) {
        setError(
          "Não encontrei leads na planilha. Confira se a primeira linha tem os títulos das colunas (ex.: Nome, Empresa, Telefone)."
        );
        return;
      }
      setLeads(mapped);
    } catch (err) {
      console.error(err);
      setError("Não consegui ler o arquivo. Use um arquivo .xlsx, .xls ou .csv.");
    } finally {
      e.target.value = ""; // permite reenviar o mesmo arquivo
    }
  }

  function reset() {
    setLeads([]);
    setFileName(null);
    setError(null);
    setDone(null);
  }

  function doImport() {
    setError(null);
    startTransition(async () => {
      const res = await importLeads(leads);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone({ created: res.created, skipped: res.skipped });
      setLeads([]);
      router.refresh();
    });
  }

  // detecta quais campos foram preenchidos (para mostrar só colunas úteis na prévia)
  const usedFields = FIELDS.filter((f) => leads.some((l) => l[f]));
  const preview = leads.slice(0, 8);

  /* ─── Sucesso ─────────────────────────────────────────── */
  if (done) {
    return (
      <div className="rounded-2xl border border-leather/10 bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-3 font-display text-2xl font-semibold text-leather">
          {done.created} {done.created === 1 ? "lead importado" : "leads importados"}!
        </h2>
        {done.skipped > 0 && (
          <p className="mt-1 text-sm text-ink/55">
            {done.skipped} {done.skipped === 1 ? "linha foi ignorada" : "linhas foram ignoradas"} (sem nome).
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/admin/crm" className="btn-gold">
            Ver os leads no CRM
          </Link>
          <button
            onClick={reset}
            className="rounded-lg border border-leather/20 px-5 py-2.5 text-sm font-medium text-leather transition-colors hover:bg-leather/5"
          >
            Importar outra planilha
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Área de envio */}
      <div className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
        {!fileName ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-leather/20 bg-cream/40 px-6 py-12 text-center transition-colors hover:border-champagne hover:bg-champagne/5">
            <UploadCloud className="h-10 w-10 text-champagne" />
            <div>
              <p className="font-semibold text-leather">Clique para enviar sua planilha</p>
              <p className="mt-1 text-sm text-ink/55">Formatos aceitos: .xlsx, .xls ou .csv</p>
            </div>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
          </label>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-leather/10 bg-cream/40 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 shrink-0 text-champagne" />
              <div className="min-w-0">
                <p className="truncate font-medium text-leather">{fileName}</p>
                <p className="text-xs text-ink/55">
                  {leads.length > 0 ? `${leads.length} leads prontos para importar` : "Nenhum lead encontrado"}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="shrink-0 rounded-lg p-1.5 text-ink/40 transition-colors hover:bg-leather/5 hover:text-burgundy"
              aria-label="Remover arquivo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm font-medium text-burgundy">
          {error}
        </p>
      )}

      {/* Prévia */}
      {leads.length > 0 && (
        <div className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold text-leather">
            Prévia ({leads.length} {leads.length === 1 ? "lead" : "leads"})
          </h2>
          <p className="mb-4 text-sm text-ink/55">
            Reconheci as colunas automaticamente. Confira abaixo e clique em importar.
          </p>

          <div className="overflow-x-auto rounded-lg border border-leather/10">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-cream/60 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                <tr>
                  {usedFields.map((f) => (
                    <th key={f} className="px-3 py-2.5">
                      {FIELD_LABEL[f]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-leather/10">
                {preview.map((l, i) => (
                  <tr key={i}>
                    {usedFields.map((f) => (
                      <td key={f} className="px-3 py-2.5 text-ink/80">
                        {l[f] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leads.length > preview.length && (
            <p className="mt-2 text-xs text-ink/45">
              Mostrando os primeiros {preview.length}. Todos os {leads.length} serão importados.
            </p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={reset}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-leather/5 hover:text-ink"
            >
              Cancelar
            </button>
            <button onClick={doImport} disabled={pending} className="btn-gold !py-2.5 disabled:opacity-60">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Importar {leads.length} {leads.length === 1 ? "lead" : "leads"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
