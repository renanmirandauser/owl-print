import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";
import { listArchivedOrders } from "@/actions/orders";
import { ArchivedActions } from "@/components/production/ArchivedActions";
import { BRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArquivadosPage() {
  const orders = await listArchivedOrders();

  return (
    <div className="container py-8">
      <Link
        href="/admin/producao"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leather/60 hover:text-leather"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Produção
      </Link>
      <h1 className="mb-1 font-display text-3xl text-leather">Pedidos Arquivados</h1>
      <p className="mb-6 text-sm text-leather/50">
        Pedidos concluídos e arquivados. Você pode restaurar para o quadro ou excluir.
      </p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-premium/10 bg-white p-12 text-center text-leather/50">
          <Archive className="mx-auto mb-2 h-6 w-6 text-leather/30" />
          Nenhum pedido arquivado ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-3 rounded-xl border border-premium/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-leather">
                  #{o.code} — {o.clientName}
                </p>
                <p className="text-sm text-leather/50">
                  {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ") || "Sem itens"} ·{" "}
                  {BRL.format(o.total)}
                </p>
              </div>
              <ArchivedActions id={o.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
