"use client";

import { MessageCircle } from "lucide-react";
import { ORDER_STAGE, ORDER_STAGE_LABEL } from "@/types";
import type { OrderDTO } from "@/actions/orders";

export function ProductionWhatsApp({ orders }: { orders: OrderDTO[] }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511953098258";

  function build() {
    const lines: string[] = ["*Produção OWL PRINT*", ""];
    for (const stage of ORDER_STAGE) {
      const inStage = orders.filter((o) => o.stage === stage);
      if (inStage.length === 0) continue;
      lines.push(`*${ORDER_STAGE_LABEL[stage]}:*`);
      for (const o of inStage) {
        const items = o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
        const prazo = o.deliveryForecast
          ? ` — entrega ${new Date(o.deliveryForecast).toLocaleDateString("pt-BR")}`
          : "";
        lines.push(`• ${o.code} — ${o.clientName}${items ? ` (${items})` : ""}${prazo}`);
      }
      lines.push("");
    }
    if (lines.length <= 2) lines.push("Sem pedidos ativos no momento.");
    return lines.join("\n");
  }

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(build())}`;

  function click() {
    window.gtag?.("event", "whatsapp_click", { location: "producao" });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={click}
      className="btn-gold !py-2 !px-4 text-sm"
    >
      <MessageCircle className="h-4 w-4" /> Enviar pro WhatsApp
    </a>
  );
}
