import Link from "next/link";
import { Archive } from "lucide-react";
import { listOrders } from "@/actions/orders";
import { KanbanBoard } from "@/components/production/KanbanBoard";
import { ProductionWhatsApp } from "@/components/production/ProductionWhatsApp";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const orders = await listOrders();

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-leather">Produção</h1>
          <p className="text-sm text-leather/50">
            Arraste os cards entre as colunas ou use as setas para mover.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProductionWhatsApp orders={orders} />
          <Link
            href="/admin/producao/arquivados"
            className="inline-flex items-center gap-1.5 rounded-lg border border-premium/20 px-3 py-2 text-sm text-leather transition-colors hover:bg-cream"
          >
            <Archive className="h-4 w-4" /> Arquivados
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-premium/10 bg-white p-12 text-center text-leather/50">
          Nenhum pedido em produção. Aprove um orçamento e clique em{" "}
          <span className="font-medium text-leather">Gerar Pedido</span> para começar.
        </div>
      ) : (
        <KanbanBoard initialOrders={orders} />
      )}
    </div>
  );
}
