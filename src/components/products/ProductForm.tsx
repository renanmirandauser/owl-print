"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct, type ProductInput } from "@/actions/products";
import { ImageUploader } from "@/components/shared/ImageUploader";
import type { CloudinaryImage } from "@/types";

const inputCls =
  "w-full rounded-lg border border-leather/15 bg-white px-3.5 py-2.5 text-[15px] text-ink " +
  "outline-none transition-colors placeholder:text-ink/30 focus:border-champagne focus:ring-2 focus:ring-champagne/25";

interface Props {
  productId?: string;
  initial?: Partial<ProductInput>;
  categoryOptions?: string[];
  colorOptions?: { name: string; hex?: string }[];
  leatherOptions?: string[];
  sizeOptions?: string[];
}

const csv = (arr?: string[]) => (arr ?? []).join(", ");
const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function ProductForm({
  productId,
  initial,
  categoryOptions = [],
  colorOptions = [],
  leatherOptions = [],
  sizeOptions = [],
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? categoryOptions[0] ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sizes, setSizes] = useState(csv(initial?.sizes));
  const [colors, setColors] = useState(csv(initial?.colors));
  const [finishes, setFinishes] = useState(csv(initial?.finishes));
  const [leathers, setLeathers] = useState(csv(initial?.leathers));
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [active, setActive] = useState(initial?.active !== false);
  const [gallery, setGallery] = useState<CloudinaryImage[]>(initial?.gallery ?? []);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");

  // categorias vêm SOMENTE do Catálogo (cadastradas por você)
  const catList = [...categoryOptions];
  if (category && !catList.includes(category)) catList.unshift(category);

  function addToken(value: string, setter: (v: string) => void, token: string) {
    const arr = toArr(value);
    if (!arr.includes(token)) setter([...arr, token].join(", "));
  }

  function submit() {
    setError(null);
    const payload: ProductInput = {
      name,
      category,
      description,
      sizes: toArr(sizes),
      colors: toArr(colors),
      finishes: toArr(finishes),
      leathers: toArr(leathers),
      featured,
      active,
      gallery,
      seoTitle,
      seoDescription,
      slug: slug || undefined,
    };
    startTransition(async () => {
      const res = productId ? await updateProduct(productId, payload) : await createProduct(payload);
      if (!res.ok) return setError(res.error);
      router.push("/admin/produtos");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-2xl border border-leather/10 bg-white p-6 shadow-soft sm:grid-cols-2">
        <Field label="Nome do produto" required>
          <input className={inputCls} placeholder="Ex.: Cardápio Couro Premium" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Categoria" required>
          {catList.length === 0 ? (
            <div className="rounded-lg border border-dashed border-leather/25 bg-cream/50 px-3.5 py-2.5 text-sm text-ink/60">
              Nenhuma categoria cadastrada.{" "}
              <Link href="/admin/catalogo" className="font-semibold text-champagne hover:underline">
                Cadastrar no Catálogo
              </Link>
            </div>
          ) : (
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {catList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descrição">
            <textarea rows={3} className={inputCls} placeholder="Descreva o produto, materiais e diferenciais." value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>

        <Field label="Tamanhos" hint="Separe por vírgula. Clique nas sugestões para adicionar.">
          <Chips options={sizeOptions.map((s) => ({ name: s }))} onPick={(t) => addToken(sizes, setSizes, t)} />
          <input className={inputCls} placeholder="A4, A5, 30x40cm" value={sizes} onChange={(e) => setSizes(e.target.value)} />
        </Field>
        <Field label="Cores" hint="Separe por vírgula. Clique nas sugestões para adicionar.">
          <Chips options={colorOptions} colored onPick={(t) => addToken(colors, setColors, t)} />
          <input className={inputCls} placeholder="Marrom, Preto, Vinho" value={colors} onChange={(e) => setColors(e.target.value)} />
        </Field>
        <Field label="Tipos de couro" hint="Separe por vírgula. Clique nas sugestões para adicionar.">
          <Chips options={leatherOptions.map((s) => ({ name: s }))} onPick={(t) => addToken(leathers, setLeathers, t)} />
          <input className={inputCls} placeholder="Couro Sintético, Couro Legítimo" value={leathers} onChange={(e) => setLeathers(e.target.value)} />
        </Field>
        <Field label="Acabamentos" hint="Separe por vírgula.">
          <input className={inputCls} placeholder="Hot Stamping, Baixo Relevo, Laser" value={finishes} onChange={(e) => setFinishes(e.target.value)} />
        </Field>

        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[#BF9B4F]" />
            Produto em destaque
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#BF9B4F]" />
            Ativo (aparece no site)
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-leather/10 bg-white p-6 shadow-soft">
        <h2 className="mb-1 font-display text-lg font-semibold text-leather">Galeria de imagens</h2>
        <p className="mb-4 text-sm text-ink/55">A primeira imagem é usada como capa do produto.</p>
        <ImageUploader value={gallery} onChange={setGallery} enableLibrary />
      </section>

      <section className="grid gap-5 rounded-2xl border border-leather/10 bg-white p-6 shadow-soft sm:grid-cols-2">
        <h2 className="font-display text-lg font-semibold text-leather sm:col-span-2">SEO (opcional)</h2>
        <Field label="Título para o Google">
          <input className={inputCls} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>
        <Field label="Endereço da página" hint="Deixe vazio para gerar pelo nome.">
          <input className={inputCls} placeholder="cardapio-couro-premium" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descrição para o Google">
            <textarea rows={2} className={inputCls} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          </Field>
        </div>
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
          {productId ? "Salvar alterações" : "Criar produto"}
        </button>
      </div>
    </div>
  );
}

function Chips({
  options,
  onPick,
  colored = false,
}: {
  options: { name: string; hex?: string }[];
  onPick: (token: string) => void;
  colored?: boolean;
}) {
  if (!options.length) return null;
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      {options.map((o) => (
        <button
          key={o.name}
          type="button"
          onClick={() => onPick(o.name)}
          className="inline-flex items-center gap-1.5 rounded-full border border-leather/15 bg-cream/60 px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:border-champagne hover:bg-champagne/10"
        >
          {colored && o.hex && (
            <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: o.hex }} />
          )}
          {o.name}
        </button>
      ))}
    </div>
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
