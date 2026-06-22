import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProduct } from "@/actions/products";
import { getProductFormOptions } from "@/actions/catalog";
import { ProductForm } from "@/components/products/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, opts] = await Promise.all([getProduct(id), getProductFormOptions()]);
  if (!p) notFound();

  return (
    <div className="container max-w-4xl py-8">
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Editar Produto</h1>
      <ProductForm
        productId={p.id}
        categoryOptions={opts.categories}
        colorOptions={opts.colors}
        leatherOptions={opts.leathers}
        sizeOptions={opts.sizes}
        initial={{
          name: p.name,
          category: p.category,
          description: p.description,
          sizes: p.sizes,
          colors: p.colors,
          finishes: p.finishes,
          leathers: p.leathers,
          featured: p.featured,
          active: p.active,
          gallery: p.gallery,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          slug: p.slug,
        }}
      />
    </div>
  );
}
