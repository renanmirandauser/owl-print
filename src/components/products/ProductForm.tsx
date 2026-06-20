"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct, type ProductInput } from "@/actions/products";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { PRODUCT_CATEGORIES, CATEGORY_LABEL, type CloudinaryImage } from "@/types";

const inputCls =
  "w-full rounded-md border border-premium/20 bg-white px-3 py-2 text-sm text-leather " +
  "outline-none focus:border-champagne focus:ring-2 focus:ring-champagne/30";

interface Props {
  productId?: string;
  initial?: Partial<ProductInput>;
}

const csv = (arr?: string[]) => (arr ?? []).join(", ");
const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function ProductForm({ productId, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sizes, setSizes] = useState(csv(initial?.sizes));
  const [colors, setColors] = useState(csv(initial?.colors));
  const [finishes, setFinishes] = useState(csv(initial?.finishes));
  const [featured, setFeatured] = useState(!!initial?.featured);
  const [active, setActive] = useState(initial?.active !== false);
  const [gallery, setGallery] = useState<CloudinaryImage[]>(initial?.gallery ?? []);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");

  function submit() {
    setError(null);
    const payload: ProductInput = {
      name,
      category,
      description,
      sizes: toArr(sizes),
      colors: toArr(colors),
      finishes: toArr(finishes),
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
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
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
          <input className={inputCls} placeholder="A4, A5, 30x40cm" value={sizes} onChange={(e) => setSizes(e.target.value)} />
        </Field>
        <Field label="Cores (separadas por vírgula)">
          <input className={inputCls} placeholder="Marrom, Preto, Vinho" value={colors} onChange={(e) => setColors(e.target.value)} />
        </Field>
        <Field label="Acabamentos (separados por vírgula)">
          <input className={inputCls} placeholder="Hot Stamping, Baixo Relevo, Laser" value={finishes} onChange={(e) => setFinishes(e.target.value)} />
        </Field>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm text-leather">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[#C9A876]" />
            Produto em destaque
          </label>
          <label className="flex items-center gap-2 text-sm text-leather">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#C9A876]" />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-leather/60">{label}</label>
      {children}
    </div>
  );
}
