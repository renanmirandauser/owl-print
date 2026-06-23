import Link from "next/link";
import Image from "next/image";
import { Plus, Star, Pencil } from "lucide-react";
import { listPortfolio } from "@/actions/portfolio";
import { segmentLabel } from "@/types";
import { DeletePortfolioButton } from "@/components/portfolio/PortfolioForm";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const items = await listPortfolio();
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-leather">Portfólio</h1>
        <Link href="/admin/portfolio/novo" className="btn-gold !py-2 !px-4">
          <Plus className="h-4 w-4" /> Novo Case
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-premium/10 bg-white">
        {items.length === 0 ? (
          <div className="p-12 text-center text-leather/50">
            Nenhum case. <Link href="/admin/portfolio/novo" className="text-premium underline">Cadastrar o primeiro</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
            <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
              <tr><th className="px-4 py-3">Case</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Segmento</th><th className="px-4 py-3 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-premium/10">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-cream">
                        {p.images[0] ? <Image src={p.images[0].url} alt={p.title} fill sizes="40px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-premium/40">🦉</span>}
                      </div>
                      <span className="flex items-center gap-1 font-medium text-leather">{p.title}{p.featured && <Star className="h-3 w-3 text-champagne" />}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-leather/70">{p.clientName}</td>
                  <td className="px-4 py-3 text-leather/70">{segmentLabel(p.segment)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/portfolio/${p.id}/editar`} className="text-leather/40 hover:text-premium" aria-label="Editar"><Pencil className="h-4 w-4" /></Link>
                      <DeletePortfolioButton id={p.id} />
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
