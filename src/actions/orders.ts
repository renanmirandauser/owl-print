"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Quote } from "@/models/Quote";
import { Financial } from "@/models/Financial";
import { ORDER_STAGE, type OrderStage } from "@/types";

/* ─── DTOs ──────────────────────────────────────────────── */

export interface OrderItemDTO {
  name: string;
  quantity: number;
  unitPrice: number;
}
export interface OrderDTO {
  id: string;
  code: string;
  quoteId: string | null;
  clientName: string;
  items: OrderItemDTO[];
  stage: OrderStage;
  total: number;
  deliveryForecast: string | null;
  internalNotes: string;
  archived: boolean;
  createdAt: string | null;
}

type LeanOrder = {
  _id: unknown;
  code: string;
  quote?: unknown;
  clientName: string;
  items?: { name: string; quantity: number; unitPrice?: number }[];
  stage: OrderStage;
  total: number;
  deliveryForecast?: Date;
  internalNotes?: string;
  archived?: boolean;
  createdAt?: Date;
};

function serialize(o: LeanOrder): OrderDTO {
  return {
    id: String(o._id),
    code: o.code,
    quoteId: o.quote ? String(o.quote) : null,
    clientName: o.clientName,
    items: (o.items ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice ?? 0,
    })),
    stage: o.stage,
    total: o.total ?? 0,
    deliveryForecast: o.deliveryForecast ? new Date(o.deliveryForecast).toISOString() : null,
    internalNotes: o.internalNotes ?? "",
    archived: !!o.archived,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
  };
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

async function nextCode(): Promise<string> {
  const last = await Order.findOne().sort({ createdAt: -1 }).select("code").lean<{ code: string }>();
  const n = last?.code ? parseInt(last.code.replace(/\D/g, ""), 10) || 0 : 0;
  return `PED-${String(n + 1).padStart(5, "0")}`;
}

/* ─── Leitura ───────────────────────────────────────────── */

export async function listOrders(): Promise<OrderDTO[]> {
  await dbConnect();
  const docs = await Order.find({ archived: { $ne: true } }).sort({ createdAt: -1 }).lean<LeanOrder[]>();
  return docs.map(serialize);
}

export async function getOrder(id: string): Promise<OrderDTO | null> {
  await dbConnect();
  const doc = await Order.findById(id).lean<LeanOrder>();
  return doc ? serialize(doc) : null;
}

/* ─── Geração a partir do orçamento ─────────────────────── */

type LeanQuote = {
  _id: unknown;
  clientName: string;
  client?: unknown;
  items?: { name: string; quantity: number; unitPrice: number }[];
  total: number;
};

export async function createOrderFromQuote(
  quoteId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await dbConnect();

    // Evita duplicar: se já existe pedido para este orçamento, retorna ele.
    const existing = await Order.findOne({ quote: quoteId }).select("_id").lean<{ _id: unknown }>();
    if (existing) return { ok: true, data: { id: String(existing._id) } };

    const quote = await Quote.findById(quoteId).lean<LeanQuote>();
    if (!quote) return { ok: false, error: "Orçamento não encontrado." };

    const order = await Order.create({
      code: await nextCode(),
      quote: quote._id,
      client: quote.client || undefined,
      clientName: quote.clientName,
      items: (quote.items ?? []).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      total: quote.total,
      stage: "waiting_approval",
    });

    revalidatePath("/admin/producao");
    revalidatePath("/admin");
    return { ok: true, data: { id: String(order._id) } };
  } catch (err) {
    console.error("createOrderFromQuote:", err);
    return { ok: false, error: "Erro ao gerar pedido." };
  }
}

/* ─── Kanban: mover de coluna ───────────────────────────── */

export async function moveOrderStage(id: string, stage: OrderStage): Promise<ActionResult> {
  if (!ORDER_STAGE.includes(stage)) return { ok: false, error: "Etapa inválida." };
  try {
    await dbConnect();
    const order = await Order.findByIdAndUpdate(id, { stage }, { new: true });

    // Integração financeira: ao entregar, registra receita (uma única vez).
    if (stage === "delivered" && order) {
      const exists = await Financial.findOne({ order: id }).select("_id").lean();
      if (!exists) {
        await Financial.create({
          kind: "revenue",
          description: `Pedido ${order.code} — ${order.clientName}`,
          amount: order.total ?? 0,
          category: "venda",
          order: id,
          date: new Date(),
        });
        revalidatePath("/admin/financeiro");
      }
    }

    revalidatePath("/admin/producao");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("moveOrderStage:", err);
    return { ok: false, error: "Erro ao mover pedido." };
  }
}

/* ─── Detalhes: prazo + notas internas ──────────────────── */

export async function updateOrder(
  id: string,
  data: { deliveryForecast?: string; internalNotes?: string }
): Promise<ActionResult> {
  try {
    await dbConnect();
    await Order.findByIdAndUpdate(id, {
      deliveryForecast: data.deliveryForecast ? new Date(data.deliveryForecast) : undefined,
      internalNotes: data.internalNotes,
    });
    revalidatePath(`/admin/producao/${id}`);
    revalidatePath("/admin/producao");
    return { ok: true };
  } catch (err) {
    console.error("updateOrder:", err);
    return { ok: false, error: "Erro ao salvar." };
  }
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Order.findByIdAndDelete(id);
    revalidatePath("/admin/producao");
    return { ok: true };
  } catch (err) {
    console.error("deleteOrder:", err);
    return { ok: false, error: "Erro ao excluir." };
  }
}

/* ─── Arquivamento ──────────────────────────────────────── */

export async function listArchivedOrders(): Promise<OrderDTO[]> {
  await dbConnect();
  const docs = await Order.find({ archived: true }).sort({ updatedAt: -1 }).lean<LeanOrder[]>();
  return docs.map(serialize);
}

export async function archiveOrder(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Order.findByIdAndUpdate(id, { archived: true });
    revalidatePath("/admin/producao");
    revalidatePath("/admin/producao/arquivados");
    return { ok: true };
  } catch (err) {
    console.error("archiveOrder:", err);
    return { ok: false, error: "Erro ao arquivar." };
  }
}

export async function unarchiveOrder(id: string): Promise<ActionResult> {
  try {
    await dbConnect();
    await Order.findByIdAndUpdate(id, { archived: false });
    revalidatePath("/admin/producao");
    revalidatePath("/admin/producao/arquivados");
    return { ok: true };
  } catch (err) {
    console.error("unarchiveOrder:", err);
    return { ok: false, error: "Erro ao desarquivar." };
  }
}
