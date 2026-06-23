import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Quote } from "@/models/Quote";
import { Order } from "@/models/Order";
import { Financial } from "@/models/Financial";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import { BRL } from "@/lib/utils";
import { Users, FileText, Package, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

async function getMetrics() {
  await dbConnect();
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [leads, quotes, activeOrders, revenueAgg] = await Promise.all([
    Client.countDocuments(),
    Quote.countDocuments(),
    Order.countDocuments({ stage: { $ne: "delivered" } }),
    Financial.aggregate([
      { $match: { kind: "revenue", date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total ?? 0;
  return { leads, quotes, activeOrders, revenue };
}

export default async function AdminDashboard() {
  const { leads, quotes, activeOrders, revenue } = await getMetrics();

  return (
    <div className="container py-8">
      <h1 className="mb-6 font-display text-3xl text-leather">Dashboard</h1>
      <DashboardMetrics
        metrics={[
          { label: "Faturamento (Mês)", value: BRL.format(revenue), icon: DollarSign },
          { label: "Leads", value: String(leads), icon: Users },
          { label: "Orçamentos", value: String(quotes), icon: FileText },
          { label: "Pedidos Ativos", value: String(activeOrders), icon: Package },
        ]}
      />
    </div>
  );
}
