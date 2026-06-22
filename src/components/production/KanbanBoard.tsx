"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Loader2, Archive } from "lucide-react";
import {
  ORDER_STAGE,
  ORDER_STAGE_LABEL,
  ORDER_STAGE_COLOR,
  type OrderStage,
} from "@/types";
import { moveOrderStage, archiveOrder, type OrderDTO } from "@/actions/orders";
import { BRL, cn } from "@/lib/utils";

export function KanbanBoard({ initialOrders }: { initialOrders: OrderDTO[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<OrderStage | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function move(id: string, stage: OrderStage) {
    const current = orders.find((o) => o.id === id);
    if (!current || current.stage === stage) return;
    const snapshot = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));
    setSavingId(id);
    startTransition(async () => {
      const res = await moveOrderStage(id, stage);
      setSavingId(null);
      if (!res.ok) setOrders(snapshot); // reverte em caso de erro
    });
  }

  function step(id: string, stage: OrderStage, dir: 1 | -1) {
    const idx = ORDER_STAGE.indexOf(stage) + dir;
    if (idx < 0 || idx >= ORDER_STAGE.length) return;
    move(id, ORDER_STAGE[idx]);
  }

  function archive(id: string) {
    const snapshot = orders;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    startTransition(async () => {
      const res = await archiveOrder(id);
      if (!res.ok) setOrders(snapshot);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ORDER_STAGE.map((stage) => {
        const column = orders.filter((o) => o.stage === stage);
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => {
              if (dragId) move(dragId, stage);
              setDragId(null);
              setOverStage(null);
            }}
            className={cn(
              "rounded-xl border bg-cream/40 p-3 transition-colors",
              overStage === stage ? "border-champagne bg-champagne/10" : "border-premium/10"
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-medium text-leather">{ORDER_STAGE_LABEL[stage]}</h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-leather/50">
                {column.length}
              </span>
            </div>

            <div className="space-y-2">
              {column.map((o) => {
                const idx = ORDER_STAGE.indexOf(o.stage);
                return (
                  <article
                    key={o.id}
                    draggable
                    onDragStart={() => setDragId(o.id)}
                    onDragEnd={() => setDragId(null)}
                    className={cn(
                      "group cursor-grab rounded-lg border-l-4 bg-white p-3 shadow-sm active:cursor-grabbing",
                      ORDER_STAGE_COLOR[o.stage]
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/admin/producao/${o.id}`}
                        className="text-sm font-medium text-premium hover:underline"
                      >
                        #{o.code}
                      </Link>
                      {savingId === o.id && (
                        <Loader2 className="h-3 w-3 animate-spin text-champagne" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-leather">{o.clientName}</p>
                    <p className="mt-1 text-xs text-leather/50">{BRL.format(o.total)}</p>
                    {o.deliveryForecast && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-leather/50">
                        <Calendar className="h-3 w-3" />
                        {new Date(o.deliveryForecast).toLocaleDateString("pt-BR")}
                      </p>
                    )}

                    {/* Setas (mobile / acessibilidade) */}
                    <div className="mt-2 flex justify-between opacity-60 group-hover:opacity-100">
                      <button
                        onClick={() => step(o.id, o.stage, -1)}
                        disabled={idx === 0}
                        aria-label="Etapa anterior"
                        className="rounded p-1 hover:bg-cream disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4 text-leather" />
                      </button>
                      <button
                        onClick={() => step(o.id, o.stage, 1)}
                        disabled={idx === ORDER_STAGE.length - 1}
                        aria-label="Próxima etapa"
                        className="rounded p-1 hover:bg-cream disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4 text-leather" />
                      </button>
                    </div>

                    {o.stage === "delivered" && (
                      <button
                        onClick={() => archive(o.id)}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-premium/20 py-1 text-xs text-leather/70 transition-colors hover:bg-cream"
                      >
                        <Archive className="h-3 w-3" /> Arquivar (concluído)
                      </button>
                    )}
                  </article>
                );
              })}

              {column.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-leather/30">Vazio</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
