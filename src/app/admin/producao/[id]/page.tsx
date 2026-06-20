import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { getOrder } from "@/actions/orders";
import { OrderEditor } from "@/components/production/OrderEditor";
import { ORDER_STAGE_LABEL } from "@/types";
import { BRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = await getOrder(id);
  if (!o) notFound();

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href="/admin/producao"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Kanban
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-leather">#{o.code}</h1>
          <p className="text-leather/60">{o.clientName}</p>
        </div>
        <span className="rounded-full bg-cream px-3 py-1 text-sm text-leather">
          {ORDER_STAGE_LABEL[o.stage]}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Itens */}
        <div className="overflow-hidden rounded-xl border border-premium/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-leather/50">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3 text-right">Qtd.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-premium/10">
              {o.items.map((it, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-leather">{it.name}</td>
                  <td className="px-4 py-3 text-right">{it.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-premium/10">
                <td className="px-4 py-3 text-right font-medium text-leather">Total</td>
                <td className="px-4 py-3 text-right font-display text-lg text-leather">
                  {BRL.format(o.total)}
                </td>
              </tr>
            </tfoot>
          </table>
          {o.quoteId && (
            <Link
              href={`/admin/orcamentos/${o.quoteId}`}
              className="flex items-center gap-2 border-t border-premium/10 px-4 py-3 text-sm text-premium hover:bg-cream/40"
            >
              <FileText className="h-4 w-4" /> Ver orçamento de origem
            </Link>
          )}
        </div>

        {/* Editor */}
        <OrderEditor id={o.id} deliveryForecast={o.deliveryForecast} internalNotes={o.internalNotes} />
      </div>
    </div>
  );
}
