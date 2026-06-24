"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  type PortfolioInput,
} from "@/actions/portfolio";
import { ImageUploader } from "@/components/shared/ImageUploader";
import type { CloudinaryImage } from "@/types";

const inputCls =
  "w-full rounded-lg border border-leather/15 bg-white px-3.5 py-2.5 text-[15px] text-ink " +
  "outline-none transition-colors placeholder:text-ink/30 focus:border-champagne focus:ring-2 focus:ring-champagne/25";

export function PortfolioForm({
  id,
  initial,
  segmentOptions = [],
}: {
  id?: string;
  initial?: Partial<PortfolioInput>;
  segmentOptions?: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const [segment, setSegment] = useState(initial?.segment ?? segmentOptions[0] ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [caseStudy, setCaseStudy] = useState(initial?.caseStudy ?? "");
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [images, setImages] = useState<CloudinaryImage[]>(initial?.images ?? []);

  // segmentos vêm SOMENTE do Catálogo (cadastrados por você)
  const segList = [...segmentOptions];
  if (segment && !segList.includes(segment)) segList.unshift(segment);

  function submit() {
    setError(null);
    const payload: PortfolioInput = {
      title,
      clientName,
      segment,
      category,
      description,
      caseStudy,
      featured,
      images,
    };
    startTransition(async () => {
      const res = id ? await updatePortfolio(id, payload) : await createPortfolio(payload);
      if (!res.ok) return setError(res.error);
      router.push("/admin/portfolio");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-2xl border border-leather/10 bg-white p-6 shadow-soft sm:grid-cols-2">
        <Field label="Título do case" required>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Cliente" required>
          <input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </Field>
        <Field label="Segmento" required>
          {segList.length === 0 ? (
            <div className="rounded-lg border border-dashed border-leather/25 bg-cream/50 px-3.5 py-2.5 text-sm text-ink/60">
              Nenhum segmento cadastrado.{" "}
              <Link href="/admin/catalogo" className="font-semibold text-champagne hover:underline">
                Cadastrar no Catálogo
              </Link>
            </div>
          ) : (
            <select className={inputCls} value={segment} onChange={(e) => setSegment(e.target.value)}>
              {segList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Categoria">
          <input className={inputCls} placeholder="Cardápio, Carta de Vinhos..." value={category} onChange={(e) => setCategory(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descrição">
            <textarea rows={2} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Case study" hint="Texto completo do projeto (opcional).">
            <textarea rows={5} className={inputCls} value={caseStudy} onChange={(e) => setCaseStudy(e.target.value)} />
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[#BF9B4F]" />
          Destaque no portfólio
        </label>
      </section>

      <section className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
        <h2 className="mb-1 font-display text-lg font-semibold text-leather">Imagens do projeto</h2>
        <p className="mb-4 text-sm text-ink/55">A primeira imagem é usada como capa do case.</p>
        <ImageUploader value={images} onChange={setImages} enableLibrary />
      </section>

      {error && (
        <p className="rounded-lg border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm font-medium text-burgundy">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-leather/5 hover:text-ink">
          Cancelar
        </button>
        <button onClick={submit} disabled={pending} className="btn-gold !py-2.5 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {id ? "Salvar alterações" : "Criar case"}
        </button>
      </div>
    </div>
  );
}

export function DeletePortfolioButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function remove() {
    if (!window.confirm("Excluir este case?")) return;
    startTransition(async () => {
      await deletePortfolio(id);
      router.refresh();
    });
  }
  return (
    <button onClick={remove} disabled={pending} className="text-ink/30 hover:text-burgundy" aria-label="Excluir">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {required && <span className="text-champagne">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}
