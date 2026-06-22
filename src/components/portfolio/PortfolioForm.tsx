"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  type PortfolioInput,
} from "@/actions/portfolio";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { SEGMENTS, SEGMENT_LABEL, type CloudinaryImage } from "@/types";

const inputCls =
  "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

export function PortfolioForm({ id, initial }: { id?: string; initial?: Partial<PortfolioInput> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const [segment, setSegment] = useState(initial?.segment ?? SEGMENTS[0]);
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [caseStudy, setCaseStudy] = useState(initial?.caseStudy ?? "");
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [images, setImages] = useState<CloudinaryImage[]>(initial?.images ?? []);

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
      <section className="grid gap-4 rounded-xl border border-premium/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Título do case *">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Cliente *">
          <input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </Field>
        <Field label="Segmento *">
          <select className={inputCls} value={segment} onChange={(e) => setSegment(e.target.value)}>
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {SEGMENT_LABEL[s]}
              </option>
            ))}
          </select>
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
          <Field label="Case study (texto completo)">
            <textarea rows={5} className={inputCls} value={caseStudy} onChange={(e) => setCaseStudy(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-leather">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[#C9A876]" />
          Destaque no portfólio
        </label>
      </section>

      <section className="rounded-xl border border-premium/10 bg-white p-5">
        <h2 className="mb-3 font-display text-lg text-leather">Imagens do projeto</h2>
        <ImageUploader value={images} onChange={setImages} />
      </section>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-md px-5 py-2.5 text-sm text-leather/70 hover:text-leather">
          Cancelar
        </button>
        <button onClick={submit} disabled={pending} className="btn-gold !py-2.5 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {id ? "Salvar Alterações" : "Criar Case"}
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
    <button onClick={remove} disabled={pending} className="text-leather/30 hover:text-burgundy" aria-label="Excluir">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-leather/60">{label}</label>
      {children}
    </div>
  );
}
