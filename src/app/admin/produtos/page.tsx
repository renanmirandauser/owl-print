import Link from "next/link";
import Image from "next/image";
import { Plus, Star, Pencil } from "lucide-react";
import { listProducts } from "@/actions/products";
import { CATEGORY_LABEL } from "@/types";
import { DeleteProductButton } from "@/components/products/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-leather">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-gold !py-2 !px-4">
          <Plus className="h-4 w-4" /> Novo Produto
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-premium/10 bg-white">
        {products.length === 0 ? (
          <div className="p-12 text-center text-leather/50">
            Nenhum produto.{" "}
            <Link href="/admin/produtos/novo" className="text-premium underline">
              Cadastrar o primeiro
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
            <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-premium/10">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-cream">
                        {p.gallery[0] ? (
                          <Image src={p.gallery[0].url} alt={p.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-premium/40">🦉</span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 font-medium text-leather">
                        {p.name}
                        {p.featured && <Star className="h-3 w-3 text-champagne" />}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-leather/70">{CATEGORY_LABEL[p.category]}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-xs " + (p.active ? "bg-emerald-100 text-emerald-700" : "bg-leather/10 text-leather/60")}>
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/produtos/${p.id}/editar`} className="text-leather/40 hover:text-premium" aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
