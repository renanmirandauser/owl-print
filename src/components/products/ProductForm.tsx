"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct, type ProductInput } from "@/actions/products";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { PRODUCT_CATEGORIES, CATEGORY_LABEL, type ProductCategory, type CloudinaryImage } from "@/types";

const inputCls =
  "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

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
  const [category, setCategory] = useState(initial?.category ?? (PRODUCT_CATEGORIES[0] as string));
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

  // monta a lista de categorias: padrões + cadastradas no Catálogo (sem repetir)
  const catList: { value: string; label: string }[] = [
    ...PRODUCT_CATEGORIES.map((c) => ({ value: c as string, label: CATEGORY_LABEL[c] })),
    ...categoryOptions.map((n) => ({ value: n, label: n })),
  ].filter((c, i, arr) => arr.findIndex((x) => x.value === c.value) === i);
  if (category && !catList.some((c) => c.value === category)) {
    catList.unshift({
      value: category,
      label: CATEGORY_LABEL[category as ProductCategory] ?? category,
    });
  }

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
      <section className="grid gap-4 rounded-xl border border-premium/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Nome do produto *">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Categoria *">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {catList.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descrição">
            <textarea rows={3} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>

        <Field label="Tamanhos (separados por vírgula)">
          <Chips options={sizeOptions.map((s) => ({ name: s }))} onPick={(t) => addToken(sizes, setSizes, t)} />
          <input className={inputCls} placeholder="A4, A5, 30x40cm" value={sizes} onChange={(e) => setSizes(e.target.value)} />
        </Field>
        <Field label="Cores (separadas por vírgula)">
          <Chips options={colorOptions} colored onPick={(t) => addToken(colors, setColors, t)} />
          <input className={inputCls} placeholder="Marrom, Preto, Vinho" value={colors} onChange={(e) => setColors(e.target.value)} />
        </Field>
        <Field label="Tipos de Couro (separados por vírgula)">
          <Chips options={leatherOptions.map((s) => ({ name: s }))} onPick={(t) => addToken(leathers, setLeathers, t)} />
          <input className={inputCls} placeholder="Couro Sintético, Couro Legítimo" value={leathers} onChange={(e) => setLeathers(e.target.value)} />
        </Field>
        <Field label="Acabamentos (separados por vírgula)">
          <input className={inputCls} placeholder="Hot Stamping, Baixo Relevo, Laser" value={finishes} onChange={(e) => setFinishes(e.target.value)} />
        </Field>

        <div className="flex items-end gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-leather">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[#BF9B4F]" />
            Produto em destaque
          </label>
          <label className="flex items-center gap-2 text-sm text-leather">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#BF9B4F]" />
            Ativo
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-premium/10 bg-white p-5">
        <h2 className="mb-3 font-display text-lg text-leather">Galeria de imagens</h2>
        <ImageUploader value={gallery} onChange={setGallery} />
      </section>

      <section className="grid gap-4 rounded-xl border border-premium/10 bg-white p-5 sm:grid-cols-2">
        <h2 className="font-display text-lg text-leather sm:col-span-2">SEO</h2>
        <Field label="SEO Title">
          <input className={inputCls} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>
        <Field label="Slug (URL)">
          <input className={inputCls} placeholder="gerado pelo nome se vazio" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="SEO Description">
            <textarea rows={2} className={inputCls} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          </Field>
        </div>
      </section>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-md px-5 py-2.5 text-sm text-leather/70 hover:text-leather">
          Cancelar
        </button>
        <button onClick={submit} disabled={pending} className="btn-gold !py-2.5 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {productId ? "Salvar Alterações" : "Criar Produto"}
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
      <span className="text-[11px] text-leather/40">clique para adicionar:</span>
      {options.map((o) => (
        <button
          key={o.name}
          type="button"
          onClick={() => onPick(o.name)}
          className="inline-flex items-center gap-1 rounded-full border border-premium/20 px-2 py-0.5 text-xs text-leather transition-colors hover:bg-cream"
        >
          {colored && o.hex && (
            <span className="h-3 w-3 rounded-full border border-premium/20" style={{ backgroundColor: o.hex }} />
          )}
          {o.name}
        </button>
      ))}
    </div>
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
