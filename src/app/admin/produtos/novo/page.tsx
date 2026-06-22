import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/products/ProductForm";
import { getProductFormOptions } from "@/actions/catalog";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const opts = await getProductFormOptions();
  return (
    <div className="container max-w-4xl py-8">
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl text-leather">Novo Produto</h1>
      <ProductForm
        categoryOptions={opts.categories}
        colorOptions={opts.colors}
        leatherOptions={opts.leathers}
        sizeOptions={opts.sizes}
      />
    </div>
  );
}
