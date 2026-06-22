import { listOrders } from "@/actions/orders";
import { KanbanBoard } from "@/components/production/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const orders = await listOrders();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-leather">Produção</h1>
        <p className="text-sm text-leather/50">
          Arraste os cards entre as colunas ou use as setas para mover.
        </p>
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
